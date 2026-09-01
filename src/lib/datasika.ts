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
 * Purchase a standard data bundle for a recipient (Telecel, AirtelTigo, Standard MTN)
 * Makes strictly ONE single API call with deduplication.
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

export interface BuyFlexaParams {
  productId: string;
  recipient: string;
  idempotencyKey?: string;
}

/**
 * Purchase an MTN Flexa bundle for a recipient
 * Makes strictly ONE single API call to the dedicated MTN Flexa endpoint.
 * Never performs duplicate calls or uncontrolled fallback.
 */
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

  if (!res.ok) {
    const errorMsg = data.message || data.error || `Flexa purchase failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return data;
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
