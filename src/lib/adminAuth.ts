import crypto from 'crypto';

export function getAdminPin(): string {
  return (process.env.ADMIN_SECRET_PIN || 'gbplug2026').trim();
}

export function generateAdminToken(pin: string): string {
  return crypto.createHmac('sha256', pin).update('gbplug-admin-session').digest('hex');
}

export function verifyAdminToken(token: string | null): boolean {
  if (!token) return false;
  const pin = getAdminPin();
  const expectedHash = generateAdminToken(pin);
  return token === expectedHash;
}
