"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

/* ================= TYPES ================= */

type VendorForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  vendorType: string;
  aadhaar: string;
  pan: string;
  gst: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
};

interface KYCVerificationResult {
  valid: boolean;
  message: string;
  verified: boolean;
}

interface KYCVerification {
  pan: KYCVerificationResult;
  aadhaar: KYCVerificationResult;
  gst?: KYCVerificationResult;
  bankAccount?: KYCVerificationResult;
  ifsc?: KYCVerificationResult;
  upi?: KYCVerificationResult;
}

export default function VendorRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"BANK" | "UPI">("BANK");
  const [error, setError] = useState<string | null>(null);
  const [kycVerification, setKycVerification] = useState<KYCVerification | null>(null);
  const [showKycDetails, setShowKycDetails] = useState(false);

  const [form, setForm] = useState<VendorForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    vendorType: "",
    aadhaar: "",
    pan: "",
    gst: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear KYC verification when form changes
    if (kycVerification) {
      setKycVerification(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setKycVerification(null);
      setLoading(true);

      const response = await api.post("/vendor/register", {
        ...form,
        payoutMethod,
        kycStatus: "PENDING",
      });

      // Store KYC verification results
      if (response.data?.data?.kycVerification) {
        setKycVerification(response.data.data.kycVerification);
      }

      alert("Vendor registered successfully. All KYC documents verified. Await admin approval.");
      window.location.href = "/login";
    } catch (err: any) {
      const raw: string = err.response?.data?.message || err.message || "Unable to submit KYC.";

      // Map known backend errors to friendly messages
      const friendlyError = (() => {
        const m = raw.toLowerCase();
        if (m.includes("email already") || m.includes("email is taken") || m.includes("email already registered")) {
          return {
            title: "Email already in use",
            detail: "An account with this email already exists. If you're already a vendor, please log in instead.",
            action: { label: "Go to Login →", href: "/login" },
          };
        }
        if (m.includes("phone") && (m.includes("already") || m.includes("taken") || m.includes("exists"))) {
          return {
            title: "Phone number already registered",
            detail: "This mobile number is linked to an existing account. Use a different number or contact support.",
            action: null,
          };
        }
        if (m.includes("aadhaar") && (m.includes("already") || m.includes("exists") || m.includes("used"))) {
          return {
            title: "Aadhaar number already registered",
            detail: "This Aadhaar number is linked to an existing vendor account. Contact admin if this is an error.",
            action: null,
          };
        }
        if (m.includes("pan") && (m.includes("already") || m.includes("exists") || m.includes("used"))) {
          return {
            title: "PAN already registered",
            detail: "This PAN number is already associated with another vendor. Contact admin if this is unexpected.",
            action: null,
          };
        }
        if (m.includes("gst") && (m.includes("already") || m.includes("exists") || m.includes("used"))) {
          return {
            title: "GST number already registered",
            detail: "This GSTIN is already linked to another vendor account.",
            action: null,
          };
        }
        return { title: "Registration failed", detail: raw, action: null };
      })();

      setError(JSON.stringify(friendlyError)); // store as JSON, render below

      // If KYC verification failed, show the details
      if (err.response?.data?.data?.kycVerification) {
        setKycVerification(err.response.data.data.kycVerification);
        setShowKycDetails(true);
      }

      console.error("Registration error:", raw);
    } finally {
      setLoading(false);
    }
  };

  const renderKYCStatus = (result: KYCVerificationResult | undefined, label: string) => {
    if (!result) return null;

    return (
      <div className={`flex items-center gap-2 text-sm ${result.valid ? 'text-green-600' : 'text-red-600'}`}>
        {result.valid ? <CheckCircle size={16} /> : <XCircle size={16} />}
        <span>{label}: {result.message}</span>
      </div>
    );
  };

  return (
    <>
      {/* ================= BACK TO HOME ================= */}
      <div className="px-4 sm:px-6 pt-6">
        <div className="w-full max-w-md mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-linear-to-r from-indigo-600 to-purple-600
              hover:from-indigo-700 hover:to-purple-700
              text-white text-sm font-bold transition shadow-lg hover:shadow-xl"
          >
            <span className="text-lg">←</span>
            Back to Home
          </Link>
        </div>
      </div>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="min-h-[calc(100vh-80px)] bg-linear-to-br from-gray-50 via-gray-100 to-gray-50 flex justify-center px-2 sm:px-4 md:px-6 py-6 overflow-x-hidden">

        <div className="w-full max-w-6xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-80px)]">

            {/* ================= LEFT PANEL ================= */}
            <div className="hidden lg:flex flex-col justify-center px-10 py-16 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 text-white sticky top-0">
              <h1 className="text-4xl font-extrabold mb-6">
                Vendor Registration & KYC
              </h1>

              <p className="text-white/90 mb-8 leading-relaxed">
                Join Sochamila as a manufacturing partner. Orders will be assigned
                by the admin after verification.
              </p>

              <div className="space-y-3 text-sm">
                <div>✓ Admin assigns orders</div>
                <div>✓ No customer interaction</div>
                <div>✓ Aadhaar & PAN verification</div>
                <div>✓ GST support</div>
                <div>✓ Secure payouts</div>
              </div>

              <div className="mt-10 bg-white/15 p-5 rounded-xl italic text-sm">
                "Verified vendors receive regular orders and stable payouts."
                <div className="mt-2 font-semibold">
                  — Sochamila Admin Team
                </div>
              </div>
            </div>

            {/* ================= RIGHT FORM ================= */}
            <div className="p-6 sm:p-8 lg:p-10 overflow-y-auto max-h-[calc(100vh-80px)] scrollbar-hide">

              {/* Hide Scrollbar */}
              <style>{`
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              <h2 className="text-3xl font-bold mb-1 text-gray-800">
                Vendor KYC Form
              </h2>

              <p className="text-sm text-gray-500 mb-6">
                Fill accurate details. Fake information leads to rejection.
              </p>

              {/* ERROR MESSAGE */}
              {error && (() => {
                let parsed: { title: string; detail: string; action?: { label: string; href: string } | null } | null = null;
                try { parsed = JSON.parse(error); } catch { }
                return (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm font-bold text-red-700 mb-1">
                      ⚠️ {parsed?.title || "Registration Error"}
                    </p>
                    <p className="text-sm text-red-600">{parsed?.detail || error}</p>
                    {parsed?.action && (
                      <a
                        href={parsed.action.href}
                        className="inline-flex items-center mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {parsed.action.label}
                      </a>
                    )}
                  </div>
                );
              })()}

              {/* KYC VERIFICATION DETAILS */}
              {kycVerification && showKycDetails && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">KYC Verification Results:</p>
                    <button
                      onClick={() => setShowKycDetails(false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Hide
                    </button>
                  </div>
                  <div className="space-y-2">
                    {renderKYCStatus(kycVerification.pan, "PAN")}
                    {renderKYCStatus(kycVerification.aadhaar, "Aadhaar")}
                    {kycVerification.gst && renderKYCStatus(kycVerification.gst, "GSTIN")}
                    {kycVerification.bankAccount && renderKYCStatus(kycVerification.bankAccount, "Bank Account")}
                    {kycVerification.ifsc && renderKYCStatus(kycVerification.ifsc, "IFSC")}
                    {kycVerification.upi && renderKYCStatus(kycVerification.upi, "UPI")}
                  </div>
                </div>
              )}

              <div className="space-y-6">

                {/* PERSONAL INFO */}
                <section>
                  <h3 className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-wider">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input name="firstName" placeholder="First Name" value={form.firstName} onChange={onChange} className="input-light" />
                    <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={onChange} className="input-light" />
                  </div>

                  <input name="email" placeholder="Email Address" value={form.email} onChange={onChange} className="input-light mt-3" />
                  <input name="phone" placeholder="Phone Number" value={form.phone} onChange={onChange} className="input-light mt-3" />
                  <input type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} className="input-light mt-3" />
                </section>

                {/* BUSINESS INFO */}
                <section>
                  <h3 className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-wider">
                    Business Information
                  </h3>

                  <select name="vendorType" value={form.vendorType} onChange={onChange} className="input-light">
                    <option value="">Select Vendor Category</option>
                    <option value="JERSEY">Jersey Printing</option>
                    <option value="HOODIE">Hoodie Printing</option>
                    <option value="SWEATSHIRT">Sweatshirt Printing</option>
                    <option value="TSHIRT">T-Shirt Printing</option>
                    <option value="MUG">Mug Printing</option>
                    <option value="STICKER">Sticker Printing</option>
                    <option value="POSTER">Poster Printing</option>
                  </select>
                </section>

                {/* COMPLIANCE */}
                <section>
                  <h3 className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-wider">
                    Compliance & Documents
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Your documents will be verified in real-time using secure verification services.
                  </p>

                  <input name="aadhaar" placeholder="Aadhaar Number (12 digits)" value={form.aadhaar} onChange={onChange} className="input-light" maxLength={12} />
                  <input name="pan" placeholder="PAN Number (e.g., ABCDE1234F)" value={form.pan} onChange={onChange} className="input-light mt-3" maxLength={10} />
                  <input name="gst" placeholder="GST Number (Optional, e.g., 22AAAAA0000A1Z5)" value={form.gst} onChange={onChange} className="input-light mt-3" maxLength={15} />
                </section>

                {/* PAYOUT METHOD */}
                <section>
                  <h3 className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-wider">
                    Payout Method
                  </h3>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setPayoutMethod("BANK")} className={`flex-1 py-2.5 rounded-lg font-semibold ${payoutMethod === "BANK" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                      🏦 Bank
                    </button>
                    <button type="button" onClick={() => setPayoutMethod("UPI")} className={`flex-1 py-2.5 rounded-lg font-semibold ${payoutMethod === "UPI" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                      📱 UPI
                    </button>
                  </div>
                </section>

                {/* PAYOUT DETAILS */}
                <section>
                  <h3 className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-wider">
                    {payoutMethod === "BANK" ? "Bank Details" : "UPI Details"}
                  </h3>

                  {payoutMethod === "BANK" ? (
                    <>
                      <input name="accountNumber" placeholder="Account Number" value={form.accountNumber} onChange={onChange} className="input-light" />
                      <input name="ifsc" placeholder="IFSC Code" value={form.ifsc} onChange={onChange} className="input-light mt-3" />
                    </>
                  ) : (
                    <input name="upiId" placeholder="UPI ID (example@upi)" value={form.upiId} onChange={onChange} className="input-light" />
                  )}
                </section>

                {/* SUBMIT */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full mt-6 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Verifying KYC Documents...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Submit Vendor KYC
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Already registered?{" "}
                  <Link href="/login" className="text-indigo-600 font-semibold">
                    Login here
                  </Link>
                </p>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
