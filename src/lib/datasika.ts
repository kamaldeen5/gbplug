// DataSika Developer API v2 Server-Side Client
const DATASIKA_BASE_URL = 'https://nrsfvhztpzwkadwciizp.supabase.co/functions/v1';

function getApiKey(): string {
  const key = process.env.DATA_API_KEY || process.env.DSK_API_KEY;
  if (!key) {
    throw new Error('DataSika API key is missing. Please set DATA_API_KEY in .env.local');
  }
  return key;
}

export interface CatalogItem {
  product_id: string;
  network: 'MTN' | 'Telecel' | 'AirtelTigo';
  bundle_gb: number;
  price: number;
  currency: string;
  validity: string;
}

export interface CatalogResponse {
  services: {
    data_bundles: {
      available: boolean;
      items: CatalogItem[];
    };
  };
  enabled_services: string[];
}

export interface BuyDataParams {
  productId: string;
  recipient: string; // 10-digit Ghana number starting with 0
  idempotencyKey?: string;
}

export interface BuyDataResponse {
  order_id: string;
  status: string; // 'Pending' | 'processing' | 'delivered' | 'failed' | 'refunded'
  network: string;
  bundle_gb: number;
  recipient: string;
  amount_charged: number;
  new_balance?: number;
  held_for_review?: boolean;
}

export interface OrderStatusResponse {
  order_id: string;
  status: string; // 'pending' | 'processing' | 'delivered' | 'failed' | 'refunded' | 'refund_processing'
  network: string;
  bundle_gb: number;
  recipient: string;
  amount_charged: number;
  terminal?: boolean;
  held_for_review?: boolean;
}

/**
 * Fetch live data bundle catalog from DataSika
 */
export async function getCatalog(): Promise<CatalogResponse> {
  const apiKey = getApiKey();
  const res = await fetch(`${DATASIKA_BASE_URL}/api-catalog`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`DataSika catalog error (${res.status}): ${errorText}`);
  }

  return res.json();
}

/**
 * Purchase a data bundle for a recipient
 */
export async function buyDataBundle({
  productId,
  recipient,
  idempotencyKey,
}: BuyDataParams): Promise<BuyDataResponse> {
  const apiKey = getApiKey();
  const cleanRecipient = recipient.replace(/\D/g, '');

  if (cleanRecipient.length !== 10 || !cleanRecipient.startsWith('0')) {
    throw new Error('Invalid recipient number. Must be a 10-digit Ghana number starting with 0.');
  }

  const key = idempotencyKey || `gbplug-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

  const res = await fetch(`${DATASIKA_BASE_URL}/api-buy-data`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Idempotency-Key': key,
      'Content-Type': 'application/json',
      'X-Correlation-Id': `gbplug-${cleanRecipient}-${Date.now()}`,
    },
    body: JSON.stringify({
      product_id: productId,
      recipient: cleanRecipient,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data.message || data.error || `Purchase failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

export const FLEXA_TO_REGULAR_MAP: Record<string, string> = {
  'e5825a25-f365-4926-b78e-8a5b7d2a1c40': '17490299-29e5-4e73-bcae-85be8ed68972', // 1GB
  'b285a7da-adea-4bdd-be49-8dd54ad2663f': '15f90b99-ae56-41d1-bc86-0770ba7d8d74', // 2GB
  '211647ff-747a-4c00-99d1-f793ced9755c': 'cb0f6cf3-efa5-4cc1-a1a9-27ac095130a0', // 3GB
  'd56621a9-875a-496d-b216-cc21cb5bae02': 'd5898b8c-9979-4a09-bc52-f08430157498', // 4GB
  '440262fb-f6fe-4c43-89f3-b6c470f24fea': 'ca208754-ed35-4f7a-af14-f103691947c8', // 5GB
  '45caa58f-397c-41d2-a4f1-48ad8d6e1b23': 'c6625d9d-722b-4f33-bf20-9a7eba9a3d6a', // 8GB
  '56456480-f69d-4cb2-8d0f-fd90e5a3e7b7': '16527bc5-9832-476d-913f-1f1abc7e79e8', // 10GB
  'c5418c3a-83fb-461b-ba61-59c1583d5699': '3c78af77-a372-4bf8-9a5b-23dc7c45a134', // 15GB
};

/**
 * Purchase an MTN Flexa bundle for a recipient
 */
export interface BuyFlexaParams {
  productId: string;
  recipient: string;
  idempotencyKey?: string;
}

export async function buyFlexaBundle({
  productId,
  recipient,
  idempotencyKey,
}: BuyFlexaParams): Promise<BuyDataResponse> {
  const apiKey = getApiKey();
  const cleanRecipient = recipient.replace(/\D/g, '');

  if (cleanRecipient.length !== 10 || !cleanRecipient.startsWith('0')) {
    throw new Error('Invalid recipient number. Must be a 10-digit Ghana number starting with 0.');
  }

  const key = idempotencyKey || `flexa-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

  try {
    const res = await fetch(`${DATASIKA_BASE_URL}/api-buy-flexa`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Idempotency-Key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        recipient: cleanRecipient,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return data;
    }

    // If flexa is not approved on key (403), or unavailable (503), map to regular product ID and dispatch
    if (res.status === 403 || res.status === 503 || res.status === 400) {
      console.warn(`MTN Flexa returned status ${res.status}, mapping to regular MTN bundle...`);
      const regularProductId = FLEXA_TO_REGULAR_MAP[productId] || productId;
      return await buyDataBundle({ productId: regularProductId, recipient: cleanRecipient, idempotencyKey: key });
    }

    const errorMsg = data.message || data.error || `Flexa purchase failed (${res.status})`;
    throw new Error(errorMsg);
  } catch (err: any) {
    // If error, attempt regular buyDataBundle fallback with mapped product ID
    console.error('buyFlexaBundle error, trying mapped fallback:', err.message);
    const regularProductId = FLEXA_TO_REGULAR_MAP[productId] || productId;
    return await buyDataBundle({ productId: regularProductId, recipient: cleanRecipient, idempotencyKey: key });
  }
}

/**
 * Query real-time status of an order
 */
export async function getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
  const apiKey = getApiKey();
  const cleanOrderId = orderId.trim();

  const res = await fetch(`${DATASIKA_BASE_URL}/api-order-status?order_id=${encodeURIComponent(cleanOrderId)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Always fresh status
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data.message || data.error || `Status check failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

