// Global DataSika Order Registry & Automated Pending Fulfillment Queue
// Persists across requests within the same Vercel function instance.

export interface OrderEntry {
  orderId: string;      // DataSika order_id e.g. "API-21778B1443"
  recipient: string;    // 10-digit Ghana number e.g. "0544530442"
  createdAt?: string;
}

export interface PendingOrder {
  reference: string;
  productId: string;
  recipient: string;
  serviceType?: string;
  bundleName?: string;
  amount?: number;
  createdAt: string;
}

const g = global as unknown as {
  __gbplug_order_registry__?: OrderEntry[];
  __gbplug_pending_queue__?: PendingOrder[];
};

if (!g.__gbplug_order_registry__) {
  g.__gbplug_order_registry__ = [];
}

if (!g.__gbplug_pending_queue__) {
  g.__gbplug_pending_queue__ = [];
}

export function registerOrderEntry(entry: OrderEntry): void {
  const list = g.__gbplug_order_registry__!;
  const clean = entry.recipient.replace(/\D/g, '');
  if (!list.find((o) => o.orderId === entry.orderId)) {
    list.push({ ...entry, recipient: clean, createdAt: entry.createdAt || new Date().toISOString() });
  }

  // Remove from pending queue if present
  if (g.__gbplug_pending_queue__) {
    g.__gbplug_pending_queue__ = g.__gbplug_pending_queue__.filter(
      (p) => p.recipient.replace(/\D/g, '') !== clean
    );
  }
}

export function queuePendingOrder(pending: PendingOrder): void {
  const queue = g.__gbplug_pending_queue__!;
  const clean = pending.recipient.replace(/\D/g, '');
  if (!queue.find((p) => p.reference === pending.reference)) {
    queue.push({ ...pending, recipient: clean });
  }
}

export function getPendingOrders(): PendingOrder[] {
  return g.__gbplug_pending_queue__ || [];
}

export function getOrdersByPhone(phone: string): OrderEntry[] {
  const clean = phone.replace(/\D/g, '').slice(-10);
  return (g.__gbplug_order_registry__ || [])
    .filter((o) => o.recipient.replace(/\D/g, '').endsWith(clean));
}
