// Central Idempotent Fulfillment Engine
// Ensures that for any payment reference, DataSika is called EXACTLY ONCE.
// Prevents duplicate orders between verify-polling, webhooks, and retries.

import { buyDataBundle, buyFlexaBundle, BuyDataResponse } from './datasika';
import { registerOrderEntry } from './order-registry';

export interface FulfillOrderParams {
  reference: string;
  productId: string;
  recipient: string;
  serviceType?: string;
}

const g = global as unknown as {
  __gbplug_fulfilled_refs__?: Map<string, BuyDataResponse>;
  __gbplug_inflight_refs__?: Map<string, Promise<BuyDataResponse>>;
};

if (!g.__gbplug_fulfilled_refs__) {
  g.__gbplug_fulfilled_refs__ = new Map();
}

if (!g.__gbplug_inflight_refs__) {
  g.__gbplug_inflight_refs__ = new Map();
}

const FLEXA_PRODUCT_IDS = new Set([
  'e5825a25-f365-4926-b78e-8a5b7d2a1c40', // 1GB
  'b285a7da-adea-4bdd-be49-8dd54ad2663f', // 2GB
  '211647ff-747a-4c00-99d1-f793ced9755c', // 3GB
  'd56621a9-875a-496d-b216-cc21cb5bae02', // 4GB
  '440262fb-f6fe-4c43-89f3-b6c470f24fea', // 5GB
  '81cc78fc-3e21-45f0-ac54-1fafa3f01923', // 6GB
  '45caa58f-397c-41d2-a4f1-48ad8d6e1b23', // 8GB
  '56456480-f69d-4cb2-8d0f-fd90e5a3e7b7', // 10GB
  'c5418c3a-83fb-461b-ba61-59c1583d5699', // 15GB
  '02c2d960-3676-4e34-b96e-3791b8c2b16c', // 20GB
  '6912f2a7-8c03-4ef3-9be3-292e1ba407ed', // 25GB
  'a18f4d14-fac2-4277-901e-d8732b3cfa8e', // 30GB
  '6be0cb96-ba7e-4bb1-a993-82cbc4adca62', // 40GB
  '4545d0f0-1181-40e0-83b0-f78a8984824f', // 50GB
]);

/**
 * Fulfill an order once and only once for a given payment reference.
 * If the reference has already been fulfilled or is currently in flight,
 * it returns the existing order result without sending a second purchase request.
 */
export async function fulfillOrderOnce(params: FulfillOrderParams): Promise<BuyDataResponse> {
  const { reference, productId, recipient, serviceType } = params;
  const cleanRef = reference.trim();
  const cleanRecipient = recipient.replace(/\D/g, '');

  if (!cleanRef) {
    throw new Error('Payment reference is required for fulfillment');
  }

  // 1. Check if this reference has ALREADY been dispatched & fulfilled
  if (g.__gbplug_fulfilled_refs__?.has(cleanRef)) {
    console.log(`[Fulfillment] Reference ${cleanRef} already dispatched. Returning cached order.`);
    return g.__gbplug_fulfilled_refs__.get(cleanRef)!;
  }

  // 2. Check if this reference is CURRENTLY in flight (prevents race condition between verify & webhook)
  if (g.__gbplug_inflight_refs__?.has(cleanRef)) {
    console.log(`[Fulfillment] Reference ${cleanRef} is currently in flight. Awaiting existing fulfillment.`);
    return await g.__gbplug_inflight_refs__.get(cleanRef)!;
  }

  // 3. Deterministic Idempotency Key - IDENTICAL across verify, webhook, and cron
  const deterministicKey = `gbplug-paystack-${cleanRef}`;

  const fulfillmentPromise = (async () => {
    try {
      const isFlexa = serviceType === 'mtn_flexa' || FLEXA_PRODUCT_IDS.has(productId);
      console.log(`[Fulfillment] Dispatching SINGLE order for ref ${cleanRef} (${isFlexa ? 'MTN Flexa' : 'Standard Bundle'}) to ${cleanRecipient}...`);

      const order = isFlexa
        ? await buyFlexaBundle({
            productId,
            recipient: cleanRecipient,
            idempotencyKey: deterministicKey,
          })
        : await buyDataBundle({
            productId,
            recipient: cleanRecipient,
            idempotencyKey: deterministicKey,
          });

      if (order?.order_id) {
        console.log(`[Fulfillment] Order successfully created with ID: ${order.order_id}`);
        registerOrderEntry({ orderId: order.order_id, recipient: cleanRecipient, reference: cleanRef });
        g.__gbplug_fulfilled_refs__?.set(cleanRef, order);
      }

      return order;
    } finally {
      // Clear in-flight state once settled
      g.__gbplug_inflight_refs__?.delete(cleanRef);
    }
  })();

  g.__gbplug_inflight_refs__?.set(cleanRef, fulfillmentPromise);
  return await fulfillmentPromise;
}
