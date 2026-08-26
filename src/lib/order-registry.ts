// Global DataSika Order Registry
// Persists across requests within the same Vercel function instance.
// Seeded with all known historical orders. New orders are appended at purchase time.

export interface OrderEntry {
  orderId: string;      // DataSika order_id e.g. "API-21778B1443"
  recipient: string;    // 10-digit Ghana number e.g. "0544530442"
  createdAt?: string;
}

const SEED_ORDERS: OrderEntry[] = [
  { orderId: 'API-21778B1443', recipient: '0544530442', createdAt: '2026-08-26T07:58:26.766295+00:00' },
  { orderId: 'API-9CC42EDC0C',  recipient: '0544530442', createdAt: '2026-08-26T07:59:04.40945+00:00' },
  { orderId: 'API-15524B0554', recipient: '0542778141', createdAt: '2026-08-26T08:09:19.546762+00:00' },
];

// Attach to global so it survives Next.js hot-reloads in dev
const g = global as unknown as { __gbplug_order_registry__?: OrderEntry[] };
if (!g.__gbplug_order_registry__) {
  g.__gbplug_order_registry__ = [...SEED_ORDERS];
}

export function registerOrderEntry(entry: OrderEntry): void {
  const list = g.__gbplug_order_registry__!;
  const clean = entry.recipient.replace(/\D/g, '');
  if (!list.find((o) => o.orderId === entry.orderId)) {
    list.push({ ...entry, recipient: clean, createdAt: entry.createdAt || new Date().toISOString() });
  }
}

export function getOrdersByPhone(phone: string): OrderEntry[] {
  const clean = phone.replace(/\D/g, '').slice(-10);
  return (g.__gbplug_order_registry__ || SEED_ORDERS)
    .filter((o) => o.recipient.replace(/\D/g, '').endsWith(clean));
}
