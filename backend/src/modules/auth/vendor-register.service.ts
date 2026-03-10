import { prisma } from "../../config/prisma";
import { hashPassword } from "../../utils/hash";
import { signToken } from "../../utils/jwt";
import {
  verifyVendorKYCWithCashfree,
  isKYCValid,
  getKYCErrorMessages,
  VendorKYCVerification,
} from "../../utils/cashfreeKyc";

/* =====================================================
   TYPES
===================================================== */

type VendorRegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  vendorType: string;
  aadhaar: string;
  pan: string;
  gst?: string;
  payoutMethod: "BANK" | "UPI";
  accountNumber?: string;
  ifsc?: string;
  upiId?: string;
};

interface VendorRegisterResult {
  token: string;
  vendor: {
    id: string;
    email: string;
    role: string;
    kycStatus: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  kycVerification?: VendorKYCVerification;
}

/* =====================================================
   VENDOR REGISTRATION SERVICE
===================================================== */

export async function vendorRegisterService(
  data: VendorRegisterInput,
  options: { skipKYCVerification?: boolean } = {}
): Promise<VendorRegisterResult> {
  try {
    // 1️⃣ Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingEmail) {
      throw new Error("Email already registered");
    }

    // 2️⃣ Check if Aadhaar already exists
    const existingAadhaar = await prisma.user.findUnique({
      where: { aadhaar: data.aadhaar },
    });

    if (existingAadhaar) {
      throw new Error("Aadhaar number already registered");
    }

    // 3️⃣ Check if PAN already exists
    const existingPan = await prisma.user.findUnique({
      where: { pan: data.pan },
    });

    if (existingPan) {
      throw new Error("PAN number already registered");
    }

    // 4️⃣ Validate payout method details
    if (data.payoutMethod === "BANK") {
      if (!data.accountNumber || !data.ifsc) {
        throw new Error("Bank details (account number and IFSC) are required for bank payout");
      }
    } else if (data.payoutMethod === "UPI") {
      if (!data.upiId) {
        throw new Error("UPI ID is required for UPI payout");
      }
    }

    // 5️⃣ Verify KYC documents with Cashfree (if not skipped)
    let kycVerification: VendorKYCVerification | undefined;
    
    const skipKYC = options.skipKYCVerification || process.env.SKIP_KYC_VERIFICATION === 'true';
    
    if (!skipKYC) {
      console.log("[VENDOR-REGISTER] Starting KYC verification with Cashfree...");
      
      kycVerification = await verifyVendorKYCWithCashfree({
        pan: data.pan,
        aadhaar: data.aadhaar,
        gst: data.gst,
        payoutMethod: data.payoutMethod,
        accountNumber: data.accountNumber,
        ifsc: data.ifsc,
        upiId: data.upiId,
      });

      console.log("[VENDOR-REGISTER] KYC verification completed:", {
        pan: kycVerification.pan.valid,
        aadhaar: kycVerification.aadhaar.valid,
        gst: kycVerification.gst?.valid,
        bankAccount: kycVerification.bankAccount?.valid,
        upi: kycVerification.upi?.valid,
      });

      // Check if all KYC is valid
      if (!isKYCValid(kycVerification)) {
        const errors = getKYCErrorMessages(kycVerification);
        throw new Error(`KYC verification failed: ${errors.join("; ")}`);
      }
    }

    // 6️⃣ Hash password
    const hashedPassword = await hashPassword(data.password);

    // 7️⃣ Create vendor user
    const vendor = await prisma.user.create({
      data: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: "VENDOR",
        isActive: false, // Will be activated after KYC approval
        kycStatus: "PENDING",
        
        // Vendor personal info
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        vendorType: data.vendorType.trim(),
        
        // Vendor KYC documents
        aadhaar: data.aadhaar.trim(),
        pan: data.pan.trim(),
        gst: data.gst ? data.gst.trim() : null,
        
        // Vendor payout details
        payoutMethod: data.payoutMethod,
        accountNumber: data.accountNumber ? data.accountNumber.trim() : null,
        ifsc: data.ifsc ? data.ifsc.trim() : null,
        upiId: data.upiId ? data.upiId.trim() : null,
      },
    });

    // 8️⃣ Generate JWT token
    const token = signToken({
      id: vendor.id,
      role: vendor.role,
    });

    console.log("[VENDOR-REGISTER] Vendor registered successfully:", vendor.id);

    return {
      token,
      vendor: {
        id: vendor.id,
        email: vendor.email,
        role: vendor.role,
        kycStatus: vendor.kycStatus,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
      },
      kycVerification,
    };
  } catch (error: any) {
    console.error("[VENDOR-REGISTER] Registration error:", error.message);
    throw error;
  }
}
