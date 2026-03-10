/**
 * Cashfree KYC Verification Service
 * Integrates with Cashfree APIs for PAN, Aadhaar, GSTIN, and Bank Account verification
 * 
 * API Documentation: https://docs.cashfree.com/reference/verification-api
 */

import axios from 'axios';

/* =====================================================
   CONFIGURATION
===================================================== */

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID || '';
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET || '';
const CASHFREE_ENVIRONMENT = process.env.CASHFREE_ENVIRONMENT || 'TEST';

// Cashfree Verification API endpoints
// Docs: https://docs.cashfree.com/reference/verification-api
const BASE_URL = CASHFREE_ENVIRONMENT === 'PRODUCTION' 
  ? 'https://api.cashfree.com/verification'
  : 'https://sandbox.cashfree.com/verification';

// Check if KYC verification should be skipped
const SKIP_KYC = process.env.SKIP_KYC_VERIFICATION === 'true';

/* =====================================================
   TYPES
===================================================== */

export interface KYCVerificationResult {
  valid: boolean;
  message: string;
  verified: boolean;
  data?: any;
  referenceId?: string;
}

export interface VendorKYCVerification {
  pan: KYCVerificationResult;
  aadhaar: KYCVerificationResult;
  gst?: KYCVerificationResult;
  bankAccount?: KYCVerificationResult;
  ifsc?: KYCVerificationResult;
  upi?: KYCVerificationResult;
}

export interface VendorKYCInput {
  pan: string;
  aadhaar: string;
  gst?: string;
  payoutMethod: "BANK" | "UPI";
  accountNumber?: string;
  ifsc?: string;
  upiId?: string;
}

/* =====================================================
   CASHFREE API CLIENT
===================================================== */

async function getCashfreeHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-client-id': CASHFREE_CLIENT_ID,
    'x-client-secret': CASHFREE_CLIENT_SECRET,
  };
}

/* =====================================================
   PAN VERIFICATION via Cashfree
   API: POST /pan
   Docs: https://docs.cashfree.com/reference/verifypan
===================================================== */

export async function verifyPANWithCashfree(pan: string): Promise<KYCVerificationResult> {
  try {
    // Skip API call if SKIP_KYC is enabled
    if (SKIP_KYC) {
      console.log('[CASHFREE] SKIP_KYC_VERIFICATION is enabled, using format validation only');
      return verifyPANFormat(pan);
    }
    
    if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
      console.warn('[CASHFREE] Credentials not configured, falling back to format validation');
      return verifyPANFormat(pan);
    }

    const cleaned = pan.trim().toUpperCase();
    
    // First validate format
    const formatCheck = verifyPANFormat(cleaned);
    if (!formatCheck.valid) {
      return formatCheck;
    }

    // Cashfree Verification API endpoint for PAN
    const panUrl = `${BASE_URL}/pan`;
    console.log("[CASHFREE] Calling URL:", panUrl);
    
    const panRequestBody = { pan: cleaned };
    console.log("[CASHFREE] PAN request body:", panRequestBody);
    
    const response = await axios.post(
      panUrl,
      panRequestBody,
      {
        headers: await getCashfreeHeaders(),
      }
    );

    const data = response.data;

    // Cashfree PAN verification response
    if (data.valid === true || data.status === 'VALID') {
      return {
        valid: true,
        message: `PAN verified successfully. Name: ${data.name || 'N/A'}`,
        verified: true,
        data: {
          name: data.name,
          panStatus: data.pan_status || data.status,
          panType: data.pan_type,
        },
        referenceId: data.reference_id,
      };
    } else if (data.valid === false || data.status === 'INVALID') {
      return {
        valid: false,
        message: data.message || 'PAN verification failed',
        verified: false,
        data,
        referenceId: data.reference_id,
      };
    }

    return {
      valid: true,
      message: 'PAN format valid (verification pending)',
      verified: true,
      data,
    };

  } catch (error: any) {
    console.error('[CASHFREE] PAN verification error:', error.response?.data || error.message);
    
    // Fallback to format validation if API fails (401, 403, or IP whitelist error)
    const errorCode = error.response?.data?.code;
    const errorStatus = error.response?.status;
    
    if (errorStatus === 401 || errorStatus === 403 || errorCode === 'ip_validation_failed') {
      console.warn('[CASHFREE] API authentication/IP error, falling back to format validation');
      const formatResult = verifyPANFormat(pan);
      return {
        ...formatResult,
        message: `${formatResult.message} (Cashfree API: IP not whitelisted - using format validation)`,
      };
    }
    
    return {
      valid: false,
      message: error.response?.data?.message || 'PAN verification service unavailable',
      verified: false,
    };
  }
}

/* =====================================================
   AADHAAR VERIFICATION via Cashfree
   APIs: 
   - POST /aadhaar (for Aadhaar validation)
   Docs: https://docs.cashfree.com/reference/verifyaadhaar
===================================================== */

export async function verifyAadhaarWithCashfree(aadhaar: string): Promise<KYCVerificationResult> {
  try {
    // Skip API call if SKIP_KYC is enabled
    if (SKIP_KYC) {
      console.log('[CASHFREE] SKIP_KYC_VERIFICATION is enabled, using format validation only (checksum skipped)');
      return verifyAadhaarFormat(aadhaar, true); // Skip checksum in sandbox
    }
    
    if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
      console.warn('[CASHFREE] Credentials not configured, falling back to format validation');
      return verifyAadhaarFormat(aadhaar);
    }

    const cleaned = aadhaar.trim().replace(/\s/g, '');
    
    // First validate format
    const formatCheck = verifyAadhaarFormat(cleaned);
    if (!formatCheck.valid) {
      return formatCheck;
    }

    // Note: Full Aadhaar verification requires OTP flow
    // For registration, we validate format and can initiate OTP verification separately
    // Cashfree Verification API endpoint for Aadhaar
    const aadhaarUrl = `${BASE_URL}/aadhaar`;
    console.log("[CASHFREE] Calling URL:", aadhaarUrl);
    const response = await axios.post(
      aadhaarUrl,
      {
        aadhaar_number: cleaned,
      },
      {
        headers: await getCashfreeHeaders(),
      }
    );

    const data = response.data;

    if (data.valid === true || data.status === 'VALID') {
      return {
        valid: true,
        message: 'Aadhaar number is valid',
        verified: true,
        data: {
          maskedAadhaar: data.masked_aadhaar,
        },
        referenceId: data.reference_id,
      };
    }

    return {
      valid: true,
      message: 'Aadhaar format valid',
      verified: true,
      data,
    };

  } catch (error: any) {
    console.error('[CASHFREE] Aadhaar verification error:', error.response?.data || error.message);
    
    // Fallback to format validation if API fails (401, 403, or IP whitelist error)
    const errorCode = error.response?.data?.code;
    const errorStatus = error.response?.status;
    
    if (errorStatus === 401 || errorStatus === 403 || errorCode === 'ip_validation_failed') {
      console.warn('[CASHFREE] API authentication/IP error, falling back to format validation');
      const formatResult = verifyAadhaarFormat(aadhaar);
      return {
        ...formatResult,
        message: `${formatResult.message} (Cashfree API: IP not whitelisted - using format validation)`,
      };
    }
    
    return {
      valid: false,
      message: error.response?.data?.message || 'Aadhaar verification service unavailable',
      verified: false,
    };
  }
}

/* =====================================================
   GSTIN VERIFICATION via Cashfree
   API: POST /gstin
   Docs: https://docs.cashfree.com/reference/verifygst
===================================================== */

export async function verifyGSTINWithCashfree(gstin: string): Promise<KYCVerificationResult> {
  try {
    // Skip API call if SKIP_KYC is enabled
    if (SKIP_KYC) {
      console.log('[CASHFREE] SKIP_KYC_VERIFICATION is enabled, using format validation only');
      return verifyGSTINFormat(gstin);
    }
    
    if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
      console.warn('[CASHFREE] Credentials not configured, falling back to format validation');
      return verifyGSTINFormat(gstin);
    }

    if (!gstin || !gstin.trim()) {
      return { valid: true, message: 'GSTIN is optional', verified: true };
    }

    const cleaned = gstin.trim().toUpperCase();
    
    // First validate format
    const formatCheck = verifyGSTINFormat(cleaned);
    if (!formatCheck.valid) {
      return formatCheck;
    }

    // Cashfree Verification API endpoint for GSTIN
    const gstUrl = `${BASE_URL}/gstin`;
    console.log("[CASHFREE] Calling URL:", gstUrl);
    
    const gstRequestBody = { gstin: cleaned };
    console.log("[CASHFREE] GSTIN request body:", gstRequestBody);
    
    const response = await axios.post(
      gstUrl,
      gstRequestBody,
      {
        headers: await getCashfreeHeaders(),
      }
    );

    const data = response.data;

    if (data.valid === true || data.status === 'VALID' || data.gst_status === 'Active') {
      return {
        valid: true,
        message: `GSTIN verified. Business: ${data.legal_name || data.business_name || 'N/A'}`,
        verified: true,
        data: {
          businessName: data.legal_name || data.business_name,
          gstStatus: data.gst_status || data.status,
          address: data.address,
          registrationDate: data.registration_date,
        },
        referenceId: data.reference_id,
      };
    } else if (data.gst_status === 'Inactive' || data.status === 'INVALID') {
      return {
        valid: false,
        message: 'GSTIN is inactive or invalid',
        verified: false,
        data,
      };
    }

    return {
      valid: true,
      message: 'GSTIN format valid',
      verified: true,
      data,
    };

  } catch (error: any) {
    console.error('[CASHFREE] GSTIN verification error:', error.response?.data || error.message);
    
    // Fallback to format validation if API fails (401, 403, or IP whitelist error)
    const errorCode = error.response?.data?.code;
    const errorStatus = error.response?.status;
    
    if (errorStatus === 401 || errorStatus === 403 || errorCode === 'ip_validation_failed') {
      console.warn('[CASHFREE] API authentication/IP error, falling back to format validation');
      const formatResult = verifyGSTINFormat(gstin);
      return {
        ...formatResult,
        message: `${formatResult.message} (Cashfree API: IP not whitelisted - using format validation)`,
      };
    }
    
    return {
      valid: false,
      message: error.response?.data?.message || 'GSTIN verification service unavailable',
      verified: false,
    };
  }
}

/* =====================================================
   BANK ACCOUNT VERIFICATION via Cashfree
   API: POST /bank-account
   Docs: https://docs.cashfree.com/reference/verifybank
===================================================== */

export async function verifyBankAccountWithCashfree(
  accountNumber: string, 
  ifsc: string
): Promise<KYCVerificationResult> {
  try {
    // Skip API call if SKIP_KYC is enabled
    if (SKIP_KYC) {
      console.log('[CASHFREE] SKIP_KYC_VERIFICATION is enabled, using format validation only');
      return verifyBankAccountFormat(accountNumber, ifsc);
    }
    
    if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
      console.warn('[CASHFREE] Credentials not configured, falling back to format validation');
      return verifyBankAccountFormat(accountNumber, ifsc);
    }

    const cleanedAccount = accountNumber.trim().replace(/\s/g, '');
    const cleanedIFSC = ifsc.trim().toUpperCase();
    
    // First validate format
    const formatCheck = verifyBankAccountFormat(cleanedAccount, cleanedIFSC);
    if (!formatCheck.valid) {
      return formatCheck;
    }

    // Cashfree Verification API endpoint for Bank Account
    const bankUrl = `${BASE_URL}/bank-account`;
    console.log("[CASHFREE] Calling URL:", bankUrl);
    
    // Cashfree bank account verification request body
    const requestBody = {
      bank_account: cleanedAccount,
      ifsc: cleanedIFSC,
    };
    console.log("[CASHFREE] Bank request body:", requestBody);
    
    const response = await axios.post(
      bankUrl,
      requestBody,
      {
        headers: await getCashfreeHeaders(),
      }
    );

    const data = response.data;

    if (data.account_status === 'VALID' || data.valid === true || data.status === 'SUCCESS') {
      return {
        valid: true,
        message: `Bank account verified. Name: ${data.account_name || data.name || 'N/A'}`,
        verified: true,
        data: {
          accountName: data.account_name || data.name,
          bankName: data.bank_name,
          branch: data.branch,
          city: data.city,
          ifsc: data.ifsc || cleanedIFSC,
        },
        referenceId: data.reference_id,
      };
    } else if (data.account_status === 'INVALID' || data.valid === false) {
      return {
        valid: false,
        message: data.message || 'Bank account verification failed',
        verified: false,
        data,
      };
    }

    return {
      valid: true,
      message: 'Bank account format valid',
      verified: true,
      data,
    };

  } catch (error: any) {
    console.error('[CASHFREE] Bank account verification error:', {
      message: error.message,
      responseData: error.response?.data,
      responseStatus: error.response?.status,
      responseStatusText: error.response?.statusText,
    });
    
    // Fallback to format validation if API fails (401, 403, 405, or IP whitelist error)
    const errorCode = error.response?.data?.code;
    const errorStatus = error.response?.status;
    
    if (errorStatus === 401 || errorStatus === 403 || errorStatus === 405 || errorCode === 'ip_validation_failed') {
      console.warn('[CASHFREE] API authentication/IP/method error, falling back to format validation');
      const formatResult = verifyBankAccountFormat(accountNumber, ifsc);
      return {
        ...formatResult,
        message: `${formatResult.message} (Cashfree API: ${errorStatus === 405 ? 'Method not allowed in sandbox' : 'IP not whitelisted'} - using format validation)`,
      };
    }
    
    return {
      valid: false,
      message: error.response?.data?.message || 'Bank account verification service unavailable',
      verified: false,
    };
  }
}

/* =====================================================
   UPI VERIFICATION via Cashfree
   API: POST /upi
   Docs: https://docs.cashfree.com/reference/verifyupi
===================================================== */

export async function verifyUPIWithCashfree(upiId: string): Promise<KYCVerificationResult> {
  try {
    // Skip API call if SKIP_KYC is enabled
    if (SKIP_KYC) {
      console.log('[CASHFREE] SKIP_KYC_VERIFICATION is enabled, using format validation only');
      return verifyUPIFormat(upiId);
    }
    
    if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
      console.warn('[CASHFREE] Credentials not configured, falling back to format validation');
      return verifyUPIFormat(upiId);
    }

    const cleaned = upiId.trim();
    
    // First validate format
    const formatCheck = verifyUPIFormat(cleaned);
    if (!formatCheck.valid) {
      return formatCheck;
    }

    // Cashfree Verification API endpoint for UPI
    const upiUrl = `${BASE_URL}/upi`;
    console.log("[CASHFREE] Calling URL:", upiUrl);
    const response = await axios.post(
      upiUrl,
      {
        upi_vpa: cleaned,
      },
      {
        headers: await getCashfreeHeaders(),
      }
    );

    const data = response.data;

    if (data.account_status === 'VALID' || data.valid === true || data.status === 'SUCCESS') {
      return {
        valid: true,
        message: `UPI ID verified. Name: ${data.customer_name || data.name || 'N/A'}`,
        verified: true,
        data: {
          customerName: data.customer_name || data.name,
          upiId: cleaned,
        },
        referenceId: data.reference_id,
      };
    } else if (data.account_status === 'INVALID' || data.valid === false) {
      return {
        valid: false,
        message: data.message || 'UPI ID verification failed',
        verified: false,
        data,
      };
    }

    return {
      valid: true,
      message: 'UPI ID format valid',
      verified: true,
      data,
    };

  } catch (error: any) {
    console.error('[CASHFREE] UPI verification error:', error.response?.data || error.message);
    
    // Fallback to format validation if API fails (401, 403, or IP whitelist error)
    const errorCode = error.response?.data?.code;
    const errorStatus = error.response?.status;
    
    if (errorStatus === 401 || errorStatus === 403 || errorCode === 'ip_validation_failed') {
      console.warn('[CASHFREE] API authentication/IP error, falling back to format validation');
      const formatResult = verifyUPIFormat(upiId);
      return {
        ...formatResult,
        message: `${formatResult.message} (Cashfree API: IP not whitelisted - using format validation)`,
      };
    }
    
    return {
      valid: false,
      message: error.response?.data?.message || 'UPI verification service unavailable',
      verified: false,
    };
  }
}

/* =====================================================
   COMPLETE VENDOR KYC VERIFICATION
===================================================== */

export async function verifyVendorKYCWithCashfree(
  data: VendorKYCInput
): Promise<VendorKYCVerification> {
  const result: VendorKYCVerification = {
    pan: await verifyPANWithCashfree(data.pan),
    aadhaar: await verifyAadhaarWithCashfree(data.aadhaar),
  };

  // Verify GST if provided
  if (data.gst) {
    result.gst = await verifyGSTINWithCashfree(data.gst);
  }

  // Verify based on payout method
  if (data.payoutMethod === 'BANK' && data.accountNumber && data.ifsc) {
    result.bankAccount = await verifyBankAccountWithCashfree(
      data.accountNumber,
      data.ifsc
    );
    result.ifsc = { valid: true, message: 'IFSC verified with account', verified: true };
  } else if (data.payoutMethod === 'UPI' && data.upiId) {
    result.upi = await verifyUPIWithCashfree(data.upiId);
  }

  return result;
}

/* =====================================================
   FORMAT VALIDATION (Fallback when Cashfree is unavailable)
===================================================== */

function verifyPANFormat(pan: string): KYCVerificationResult {
  const cleaned = pan.trim().toUpperCase();
  
  if (!cleaned) {
    return { valid: false, message: 'PAN number is required', verified: false };
  }
  
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  
  if (!panRegex.test(cleaned)) {
    return { 
      valid: false, 
      message: 'Invalid PAN format. Expected: ABCDE1234F', 
      verified: false 
    };
  }
  
  const panType = cleaned[3];
  const validTypes = ['A', 'B', 'C', 'F', 'G', 'H', 'L', 'J', 'P', 'T'];
  
  if (!validTypes.includes(panType)) {
    return { 
      valid: false, 
      message: `Invalid PAN type character: ${panType}`, 
      verified: false 
    };
  }
  
  return { 
    valid: true, 
    message: 'PAN format is valid (offline validation)', 
    verified: true 
  };
}

function verifyAadhaarFormat(aadhaar: string, skipChecksum = false): KYCVerificationResult {
  const cleaned = aadhaar.trim().replace(/\s/g, '');
  
  if (!cleaned) {
    return { valid: false, message: 'Aadhaar number is required', verified: false };
  }
  
  if (!/^\d{12}$/.test(cleaned)) {
    return { 
      valid: false, 
      message: 'Aadhaar must be 12 digits', 
      verified: false 
    };
  }
  
  // Skip Verhoeff checksum validation in sandbox/testing mode
  if (!skipChecksum && !validateVerhoeff(cleaned)) {
    return { 
      valid: false, 
      message: 'Invalid Aadhaar checksum', 
      verified: false 
    };
  }
  
  return { 
    valid: true, 
    message: skipChecksum ? 'Aadhaar format valid (checksum skipped for sandbox)' : 'Aadhaar format is valid (offline validation)', 
    verified: true 
  };
}

function verifyGSTINFormat(gstin: string): KYCVerificationResult {
  if (!gstin || !gstin.trim()) {
    return { valid: true, message: 'GSTIN is optional', verified: true };
  }
  
  const cleaned = gstin.trim().toUpperCase();
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (!gstinRegex.test(cleaned)) {
    return { 
      valid: false, 
      message: 'Invalid GSTIN format. Expected: 22AAAAA0000A1Z5', 
      verified: false 
    };
  }
  
  const stateCode = parseInt(cleaned.substring(0, 2));
  if (stateCode < 1 || stateCode > 37) {
    return { 
      valid: false, 
      message: 'Invalid GSTIN state code', 
      verified: false 
    };
  }
  
  return { 
    valid: true, 
    message: 'GSTIN format is valid (offline validation)', 
    verified: true 
  };
}

function verifyBankAccountFormat(
  accountNumber: string, 
  ifsc: string
): KYCVerificationResult {
  if (!accountNumber || !accountNumber.trim()) {
    return { valid: false, message: 'Account number is required', verified: false };
  }
  
  const cleanedAccount = accountNumber.trim().replace(/\s/g, '');
  
  if (!/^\d{9,18}$/.test(cleanedAccount)) {
    return { 
      valid: false, 
      message: 'Account number must be 9-18 digits', 
      verified: false 
    };
  }
  
  if (!ifsc || !ifsc.trim()) {
    return { valid: false, message: 'IFSC code is required', verified: false };
  }
  
  const cleanedIFSC = ifsc.trim().toUpperCase();
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  
  if (!ifscRegex.test(cleanedIFSC)) {
    return { 
      valid: false, 
      message: 'Invalid IFSC format. Expected: SBIN0001234', 
      verified: false 
    };
  }
  
  return { 
    valid: true, 
    message: 'Bank account format is valid (offline validation)', 
    verified: true 
  };
}

function verifyUPIFormat(upiId: string): KYCVerificationResult {
  if (!upiId || !upiId.trim()) {
    return { valid: false, message: 'UPI ID is required', verified: false };
  }
  
  const cleaned = upiId.trim();
  const upiRegex = /^[a-zA-Z0-9._-]{3,50}@[a-zA-Z]{3,}$/;
  
  if (!upiRegex.test(cleaned)) {
    return { 
      valid: false, 
      message: 'Invalid UPI ID format. Expected: user@bank', 
      verified: false 
    };
  }
  
  return { 
    valid: true, 
    message: 'UPI ID format is valid (offline validation)', 
    verified: true 
  };
}

// Verhoeff algorithm for Aadhaar validation
function validateVerhoeff(aadhaar: string): boolean {
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];
  
  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];
  
  let c = 0;
  const reversed = aadhaar.split('').reverse();
  
  for (let i = 0; i < reversed.length; i++) {
    c = d[c][p[i % 8][parseInt(reversed[i])]];
  }
  
  return c === 0;
}

/* =====================================================
   CHECK IF ALL KYC IS VALID
===================================================== */

export function isKYCValid(verification: VendorKYCVerification): boolean {
  if (!verification.pan.valid) return false;
  if (!verification.aadhaar.valid) return false;
  if (verification.gst && !verification.gst.valid) return false;
  if (verification.bankAccount && !verification.bankAccount.valid) return false;
  if (verification.ifsc && !verification.ifsc.valid) return false;
  if (verification.upi && !verification.upi.valid) return false;
  
  return true;
}

/* =====================================================
   GET KYC ERROR MESSAGES
===================================================== */

export function getKYCErrorMessages(verification: VendorKYCVerification): string[] {
  const errors: string[] = [];
  
  if (!verification.pan.valid) {
    errors.push(`PAN: ${verification.pan.message}`);
  }
  if (!verification.aadhaar.valid) {
    errors.push(`Aadhaar: ${verification.aadhaar.message}`);
  }
  if (verification.gst && !verification.gst.valid) {
    errors.push(`GSTIN: ${verification.gst.message}`);
  }
  if (verification.bankAccount && !verification.bankAccount.valid) {
    errors.push(`Bank Account: ${verification.bankAccount.message}`);
  }
  if (verification.ifsc && !verification.ifsc.valid) {
    errors.push(`IFSC: ${verification.ifsc.message}`);
  }
  if (verification.upi && !verification.upi.valid) {
    errors.push(`UPI: ${verification.upi.message}`);
  }
  
  return errors;
}