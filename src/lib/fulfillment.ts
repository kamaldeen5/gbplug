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
  const deterministicKey = `gbplug-moolre-${cleanRef}`;

  const fulfillmentPromise = (async () => {
    try {
      const isFlexa = serviceType === 'mtn_flexa';
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
        registerOrderEntry({ orderId: order.order_id, recipient: cleanRecipient });
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
