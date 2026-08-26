// SikaPay Ghana Payment Gateway - Server-Side Client
const SIKAPAY_BASE_URL = 'https://api.sikapaygh.com';

function getSecretKey(): string {
  const key = process.env.SIKAPAY_SECRET_KEY;
  if (!key) throw new Error('SIKAPAY_SECRET_KEY is missing from environment variables');
  return key;
}

// Map network IDs to SikaPay provider codes
export function getProviderFromPhone(phone: string): 'mtn' | 'vodafone' | 'airteltigo' {
  const clean = phone.replace(/\D/g, '');
  const prefix = clean.slice(0, 3);
  const mtnPrefixes = ['024', '054', '055', '059', '025'];
  const telecelPrefixes = ['020', '050'];
  if (mtnPrefixes.includes(prefix)) return 'mtn';
  if (telecelPrefixes.includes(prefix)) return 'vodafone'; // Telecel uses "vodafone" in SikaPay
  return 'airteltigo';
}

export interface SikaChargeParams {
  amount: number;
  phone: string;        // Customer phone (also MoMo number)
  reference: string;   // Your unique reference
  bundleName: string;
  productId: string;
}

export interface SikaChargeResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    amount: number;
    status: string;    // pending, success, failed
    authorization_url?: string;
  };
}

export interface SikaVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    amount: number;
    currency: string;
    status: string;    // success, failed, pending
    channel: string;
    customer: {
      email: string;
      phone: string;
    };
    paid_at?: string;
  };
}

/**
 * Initiate a direct MoMo charge — sends prompt straight to customer's phone
 */
export async function initiateMoMoCharge({
  amount,
  phone,
  reference,
  bundleName,
}: SikaChargeParams): Promise<SikaChargeResponse> {
  const secretKey = getSecretKey();
  const cleanPhone = phone.replace(/\D/g, '');
  const provider = getProviderFromPhone(cleanPhone);

  // Generate a placeholder email from phone (SikaPay requires email field)
  const email = `${cleanPhone}@gbplug.com`;

  const res = await fetch(`${SIKAPAY_BASE_URL}/v1/charge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      email,
      currency: 'GHS',
      mobile_money: {
        phone: cleanPhone,
        provider,
      },
      metadata: {
        bundle_name: bundleName,
        recipient_phone: cleanPhone,
        custom_reference: reference,
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

  const res = await fetch(`${SIKAPAY_BASE_URL}/v1/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  return data;
}
