import { Request, Response } from "express";
import {
  registerUserService,
  loginUserService,
  checkEmailExistsService,
} from "./auth.service";
import { vendorRegisterService } from "./vendor-register.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { registerSchema, loginSchema, checkEmailSchema } from "../../utils/validators";
import { sendSuccess, sendError } from "../../utils/response";

/* =====================================================
   REGISTER USER
===================================================== */

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const validated = registerSchema.parse(req.body);

  const { token, user } = await registerUserService(validated as any);

  return sendSuccess(
    res,
    "Registration successful",
    {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    },
    201
  );
});

/* =====================================================
   LOGIN USER (ADMIN / CUSTOMER / VENDOR)
===================================================== */

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);

    const { token, user } = await loginUserService(validated.email, validated.password);

    return sendSuccess(res, "Login successful", {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error.message);
    throw error;
  }
});

/* =====================================================
   CHECK EMAIL EXISTS (AJAX)
   Used during registration
===================================================== */

export const checkEmailExists = asyncHandler(async (req: Request, res: Response) => {
  const { email } = checkEmailSchema.parse(req.body);

  const exists = await checkEmailExistsService(email);
  return sendSuccess(res, "Email check completed", { exists });
});
/* =====================================================
   VENDOR REGISTRATION
===================================================== */

export const vendorRegister = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      vendorType,
      aadhaar,
      pan,
      gst,
      payoutMethod,
      accountNumber,
      ifsc,
      upiId,
    } = req.body;

    // Detailed validation - check each required field
    const missingFields: string[] = [];
    if (!firstName || firstName.trim() === "") missingFields.push("firstName");
    if (!lastName || lastName.trim() === "") missingFields.push("lastName");
    if (!email || email.trim() === "") missingFields.push("email");
    if (!phone || phone.trim() === "") missingFields.push("phone");
    if (!password || password.trim() === "") missingFields.push("password");
    if (!vendorType || vendorType.trim() === "") missingFields.push("vendorType");
    if (!aadhaar || aadhaar.trim() === "") missingFields.push("aadhaar");
    if (!pan || pan.trim() === "") missingFields.push("pan");

    if (missingFields.length > 0) {
      return sendError(
        res,
        `Missing required fields: ${missingFields.join(", ")}`,
        400
      );
    }

    if (!["BANK", "UPI"].includes(payoutMethod)) {
      return sendError(res, "Invalid payout method. Must be BANK or UPI.", 400);
    }

    // Validate payout method specific fields
    if (payoutMethod === "BANK" && (!accountNumber || !ifsc)) {
      return sendError(
        res,
        "Bank payout requires accountNumber and ifsc code",
        400
      );
    }

    if (payoutMethod === "UPI" && !upiId) {
      return sendError(res, "UPI payout requires upiId", 400);
    }

    const { token, vendor, kycVerification } = await vendorRegisterService({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      vendorType: vendorType.trim(),
      aadhaar: aadhaar.trim(),
      pan: pan.trim(),
      gst: gst ? gst.trim() : "", 
      payoutMethod,
      accountNumber: accountNumber ? accountNumber.trim() : "",
      ifsc: ifsc ? ifsc.trim() : "",
      upiId: upiId ? upiId.trim() : "",
    });

    return sendSuccess(
      res,
      "Vendor registration successful. All KYC documents verified. Awaiting admin approval.",
      {
        token,
        vendor,
        kycVerification,
      },
      201
    );
  } catch (error: any) {
    console.error("[VENDOR-REGISTER-CONTROLLER] Error:", error.message);
    return sendError(res, error.message || "Vendor registration failed", 400);
  }
});
