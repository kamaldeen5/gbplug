// Paystack Payment Gateway - Server-Side Client for Ghana Mobile Money & Cards
import crypto from 'crypto';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

function getPaystackConfig() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is missing from environment variables');
  }

  return { secretKey };
}

export interface InitializePaymentParams {
  amount: number; // In GHS (e.g. 4.30)
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
    access_code?: string;
    reference: string;
  };
}

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data?: {
    status: 'success' | 'failed' | 'pending';
    reference: string;
    amount: number; // In GHS
    paid_at?: string;
    customer_phone?: string;
    transaction_id?: string | number;
    raw?: any;
  };
}

/**
 * Initialize a transaction on Paystack
 */
export async function initializePayment({
  amount,
  phone,
  email,
  bundleName,
  productId,
  callbackUrl,
  serviceType,
}: InitializePaymentParams): Promise<InitializePaymentResponse> {
  const { secretKey } = getPaystackConfig();

  const cleanPhone = phone.replace(/\D/g, '');
  const externalRef = `gbplug-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const defaultCallback = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gbplug.com'}/track-order?phone=${encodeURIComponent(cleanPhone)}`;

  // Paystack expects amount in subunit (Pesewas for GHS: 1 GHS = 100 pesewas)
  const amountInPesewas = Math.round(amount * 100);

  const payload = {
    email: email || `${cleanPhone}@gbplug.com`,
    amount: amountInPesewas,
    currency: 'GHS',
    reference: externalRef,
    callback_url: callbackUrl || defaultCallback,
    channels: ['mobile_money', 'card'],
    metadata: {
      product_id: productId,
      recipient_phone: cleanPhone,
      bundle_name: bundleName,
      service_type: serviceType || 'data_bundles',
      custom_fields: [
        {
          display_name: 'Recipient Phone',
          variable_name: 'recipient_phone',
          value: cleanPhone,
        },
        {
          display_name: 'Data Bundle',
          variable_name: 'bundle_name',
          value: bundleName,
        },
      ],
    },
  };

  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = await res.json();

  if (data.status && data.data?.authorization_url) {
    return {
      status: true,
      message: data.message || 'Payment link generated',
      data: {
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: externalRef,
      },
    };
  }

  return {
    status: false,
    message: data.message || 'Failed to initialize Paystack transaction',
  };
}

/**
 * Verify a transaction status on Paystack
 */
export async function verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
  const { secretKey } = getPaystackConfig();

  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json();

  if (!data.status || !data.data) {
    return {
      status: false,
      message: data.message || 'Transaction not found',
    };
  }

  const tx = data.data;
  const rawStatus = (tx.status || '').toLowerCase();
  const amountInGhs = (Number(tx.amount) || 0) / 100;
  const customerPhone = tx.metadata?.recipient_phone || tx.customer?.phone || '';

  if (rawStatus === 'success') {
    return {
      status: true,
      message: tx.gateway_response || 'Transaction Successful',
      data: {
        status: 'success',
        reference,
        amount: amountInGhs,
        paid_at: tx.paid_at || tx.paidAt || new Date().toISOString(),
        customer_phone: customerPhone,
        transaction_id: tx.id,
        raw: tx,
      },
    };
  }

  if (rawStatus === 'failed') {
    return {
      status: false,
      message: tx.gateway_response || tx.message || 'Payment Failed',
      data: {
        status: 'failed',
        reference,
        amount: amountInGhs,
        raw: tx,
      },
    };
  }

  // Pending / Abandoned (customer is still on checkout page)
  return {
    status: true,
    message: tx.gateway_response || 'Payment Pending',
    data: {
      status: 'pending',
      reference,
      amount: amountInGhs,
      raw: tx,
    },
  };
}

/**
 * Verify Paystack HMAC SHA512 Webhook Signature
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const { secretKey } = getPaystackConfig();

  try {
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    return hash === signature;
  } catch (err) {
    console.error('Paystack webhook signature verification error:', err);
    return false;
  }
}
