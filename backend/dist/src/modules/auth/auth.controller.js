"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorRegister = exports.checkEmailExists = exports.loginUser = exports.registerUser = void 0;
const auth_service_1 = require("./auth.service");
const vendor_register_service_1 = require("./vendor-register.service");
const asyncHandler_1 = require("../../utils/asyncHandler");
const validators_1 = require("../../utils/validators");
const response_1 = require("../../utils/response");
/* =====================================================
   REGISTER USER
===================================================== */
exports.registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validated = validators_1.registerSchema.parse(req.body);
    const { token, user } = await (0, auth_service_1.registerUserService)(validated);
    return (0, response_1.sendSuccess)(res, "Registration successful", {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    }, 201);
});
/* =====================================================
   LOGIN USER (ADMIN / CUSTOMER / VENDOR)
===================================================== */
exports.loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const validated = validators_1.loginSchema.parse(req.body);
        const { token, user } = await (0, auth_service_1.loginUserService)(validated.email, validated.password);
        return (0, response_1.sendSuccess)(res, "Login successful", {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error.message);
        throw error;
    }
});
/* =====================================================
   CHECK EMAIL EXISTS (AJAX)
   Used during registration
===================================================== */
exports.checkEmailExists = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = validators_1.checkEmailSchema.parse(req.body);
    const exists = await (0, auth_service_1.checkEmailExistsService)(email);
    return (0, response_1.sendSuccess)(res, "Email check completed", { exists });
});
/* =====================================================
   VENDOR REGISTRATION
===================================================== */
exports.vendorRegister = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, vendorType, aadhaar, pan, gst, payoutMethod, accountNumber, ifsc, upiId, } = req.body;
        // Detailed validation - check each required field
        const missingFields = [];
        if (!firstName || firstName.trim() === "")
            missingFields.push("firstName");
        if (!lastName || lastName.trim() === "")
            missingFields.push("lastName");
        if (!email || email.trim() === "")
            missingFields.push("email");
        if (!phone || phone.trim() === "")
            missingFields.push("phone");
        if (!password || password.trim() === "")
            missingFields.push("password");
        if (!vendorType || vendorType.trim() === "")
            missingFields.push("vendorType");
        if (!aadhaar || aadhaar.trim() === "")
            missingFields.push("aadhaar");
        if (!pan || pan.trim() === "")
            missingFields.push("pan");
        if (missingFields.length > 0) {
            return (0, response_1.sendError)(res, `Missing required fields: ${missingFields.join(", ")}`, 400);
        }
        if (!["BANK", "UPI"].includes(payoutMethod)) {
            return (0, response_1.sendError)(res, "Invalid payout method. Must be BANK or UPI.", 400);
        }
        // Validate payout method specific fields
        if (payoutMethod === "BANK" && (!accountNumber || !ifsc)) {
            return (0, response_1.sendError)(res, "Bank payout requires accountNumber and ifsc code", 400);
        }
        if (payoutMethod === "UPI" && !upiId) {
            return (0, response_1.sendError)(res, "UPI payout requires upiId", 400);
        }
        const { token, vendor, kycVerification } = await (0, vendor_register_service_1.vendorRegisterService)({
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
        return (0, response_1.sendSuccess)(res, "Vendor registration successful. All KYC documents verified. Awaiting admin approval.", {
            token,
            vendor,
            kycVerification,
        }, 201);
    }
    catch (error) {
        console.error("[VENDOR-REGISTER-CONTROLLER] Error:", error.message);
        return (0, response_1.sendError)(res, error.message || "Vendor registration failed", 400);
    }
});
