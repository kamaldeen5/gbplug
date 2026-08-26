// SikaPay Ghana Payment Gateway - Server-Side Client
const SIKAPAY_BASE_URL = 'https://api.sikapaygh.com/api/v1';

function getSecretKey(): string {
  const key = process.env.SIKAPAY_SECRET_KEY;
  if (!key) throw new Error('SIKAPAY_SECRET_KEY is missing from environment variables');
  return key;
}

export interface InitializePaymentParams {
  amount: number;
  phone: string;
  bundleName: string;
  productId: string;
  callbackUrl?: string;
}

export interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface SikaVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    amount: number;
    currency: string;
    status: string; // 'pending' | 'success' | 'failed'
    customer?: {
      email?: string;
      phone?: string;
    };
    metadata?: any;
    paid_at?: string;
  };
}

/**
 * Initialize a SikaPay payment session
 */
export async function initializePayment({
  amount,
  phone,
  bundleName,
  productId,
  callbackUrl,
}: InitializePaymentParams): Promise<InitializePaymentResponse> {
  const secretKey = getSecretKey();
  const cleanPhone = phone.replace(/\D/g, '');
  const email = `${cleanPhone}@gbplug.com`;
  const defaultCallback = callbackUrl || 'https://gbplug.com/track-order';

  const res = await fetch(`${SIKAPAY_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Number(amount),
      email,
      currency: 'GHS',
      callback_url: defaultCallback,
      metadata: {
        product_id: productId,
        bundle_name: bundleName,
        recipient_phone: cleanPhone,
      },
    }),
  });

  const data = await res.json();
  return data;
}

/**
 * Verify a SikaPay transaction by reference
 */
export async function verifyPayment(reference: string): Promise<SikaVerifyResponse> {
  const secretKey = getSecretKey();

  const res = await fetch(`${SIKAPAY_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  return data;
}
