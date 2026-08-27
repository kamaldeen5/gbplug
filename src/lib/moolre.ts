// Moolre Bank of Ghana Licensed Payment Gateway - Server-Side Client
const MOOLRE_BASE_URL = 'https://api.moolre.com';

function getMoolreConfig() {
  const apiUser = process.env.MOOLRE_API_USER || 'gbplug';
  const pubKey = process.env.MOOLRE_PUBLIC_KEY;
  const privKey = process.env.MOOLRE_PRIVATE_KEY;
  const accountNumber = process.env.MOOLRE_ACCOUNT_NUMBER || '11008006075371';

  if (!pubKey) {
    throw new Error('MOOLRE_PUBLIC_KEY is missing from environment variables');
  }

  return { apiUser, pubKey, privKey, accountNumber };
}

export interface InitializePaymentParams {
  amount: number;
  phone: string;
  email?: string;
  bundleName: string;
  productId: string;
  callbackUrl?: string;
  redirectUrl?: string;
  serviceType?: string;
}

export interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    reference: string;
  };
}

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data?: {
    status: 'success' | 'failed' | 'pending';
    reference: string;
    amount: number;
    paid_at?: string;
    customer_phone?: string;
    transaction_id?: string;
    raw?: any;
  };
}

/**
 * Generate a hosted payment link using Moolre Web POS API
 */
export async function initializePayment({
  amount,
  phone,
  email,
  bundleName,
  productId,
  callbackUrl,
  redirectUrl,
  serviceType,
}: InitializePaymentParams): Promise<InitializePaymentResponse> {
  const { apiUser, pubKey, accountNumber } = getMoolreConfig();

  const cleanPhone = phone.replace(/\D/g, '');
  const externalRef = `gbplug-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const defaultCallback = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gbplug.com'}/api/webhook/moolre`;
  const defaultRedirect = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gbplug.com'}/track-order?order_id=${encodeURIComponent(externalRef)}`;

  const payload = {
    type: 1,
    amount: amount.toFixed(2),
    email: email || `${cleanPhone}@gbplug.com`,
    externalref: externalRef,
    callback: callbackUrl || defaultCallback,
    redirect: redirectUrl || defaultRedirect,
    reusable: '0',
    expiration_time: 15,
    currency: 'GHS',
    accountnumber: accountNumber,
    metadata: {
      product_id: productId,
      recipient_phone: cleanPhone,
      bundle_name: bundleName,
      service_type: serviceType || 'data_bundles',
    },
  };

  const res = await fetch(`${MOOLRE_BASE_URL}/embed/link`, {
    method: 'POST',
    headers: {
      'X-API-USER': apiUser,
      'X-API-PUBKEY': pubKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = await res.json();

  if (data.status === 1 && data.data?.authorization_url) {
    return {
      status: true,
      message: data.message || 'Payment link generated',
      data: {
        authorization_url: data.data.authorization_url,
        reference: externalRef,
      },
    };
  }

  return {
    status: false,
    message: data.message || 'Failed to generate Moolre payment link',
  };
}

/**
 * Verify a payment status on Moolre using externalref
 */
export async function verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
  const { apiUser, pubKey, accountNumber } = getMoolreConfig();

  const payload = {
    type: 1,
    idtype: 1, // 1 = Unique externalref
    id: reference,
    accountnumber: accountNumber,
  };

  const res = await fetch(`${MOOLRE_BASE_URL}/open/transact/status`, {
    method: 'POST',
    headers: {
      'X-API-USER': apiUser,
      'X-API-PUBKEY': pubKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = await res.json();

  // Moolre returns status 1, code 'SS01', data.txstatus 1 for successful transaction
  if (data.status === 1 && data.code === 'SS01' && data.data?.txstatus === 1) {
    return {
      status: true,
      message: 'Transaction Successful',
      data: {
        status: 'success',
        reference,
        amount: Number(data.data.amount) || 0,
        paid_at: data.data.ts || new Date().toISOString(),
        customer_phone: data.data.payer || data.data.payee,
        transaction_id: data.data.transactionid,
        raw: data.data,
      },
    };
  }

  // Failed states: txstatus === 2 or explicit failure
  if (data.data?.txstatus === 2 || data.code === 'SS02' || data.code === 'SS09') {
    return {
      status: false,
      message: data.message || 'Payment Failed',
      data: {
        status: 'failed',
        reference,
        amount: Number(data.data?.amount) || 0,
        raw: data.data,
      },
    };
  }

  // Still pending / not finalized
  return {
    status: true,
    message: data.message || 'Payment Pending',
    data: {
      status: 'pending',
      reference,
      amount: Number(data.data?.amount) || 0,
      raw: data.data,
    },
  };
}
