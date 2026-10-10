// Referral & Earn Engine for GB Plug
// Manages referral codes, attribution, cumulative purchase progress,
// and automated 1 GB reward delivery when a friend reaches 7 GB.
import { buyFlexaBundle, buyDataBundle } from './datasika';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const MASTER_REGISTRY_EMAIL = 'system_referrals@gbplug.com';
const TARGET_GB_THRESHOLD = 7;

// In-memory cache across warm lambdas to reduce Paystack network calls
const g = global as unknown as {
  __gbplug_master_registry__?: {
    data: MasterRegistry;
    timestamp: number;
  };
  __gbplug_referrers_cache__?: Map<string, { data: ReferrerProfile; timestamp: number }>;
  __gbplug_processed_orders__?: Set<string>;
};

if (!g.__gbplug_referrers_cache__) {
  g.__gbplug_referrers_cache__ = new Map();
}
if (!g.__gbplug_processed_orders__) {
  g.__gbplug_processed_orders__ = new Set();
}

export interface MasterRegistry {
  customerCode?: string;
  codes: Record<string, string>; // referralCode -> referrerPhone
  phoneToCode: Record<string, string>; // referrerPhone -> referralCode
  attributions: Record<
    string,
    {
      referrerPhone: string;
      referrerCode: string;
      attributedAt: string;
    }
  >; // customerPhone -> attribution info
}

export interface ReferredCustomerRecord {
  phone: string;
  maskedPhone: string;
  cumulativeGb: number;
  targetGb: number;
  status: 'in_progress' | 'reward_delivered';
  rewardOrderId?: string;
  rewardDeliveredAt?: string;
  rewardFailureReason?: string;
  purchases: Array<{
    orderId: string;
    reference: string;
    bundleGb: number;
    timestamp: string;
  }>;
}

export interface ReferrerProfile {
  customerCode?: string;
  phone: string;
  referralCode: string;
  createdAt: string;
  rewardsEarned: number;
  totalEligibleGb: number;
  referredCustomers: Record<string, ReferredCustomerRecord>;
}

function getPaystackSecret(): string {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error('PAYSTACK_SECRET_KEY is missing');
  }
  return secret;
}

/**
 * Normalizes any Ghana phone representation into standard 10-digit 0XXXXXXXXX format.
 */
export function normalizeGhanaPhone(phone: string): string {
  if (!phone) return '';
  let clean = phone.toString().replace(/\D/g, '');
  if (clean.startsWith('233') && clean.length === 12) {
    clean = '0' + clean.slice(3);
  }
  return clean;
}

/**
 * Masks phone number for public display (e.g. 054 ••• 5878).
 */
export function maskPhoneNumber(phone: string): string {
  const clean = normalizeGhanaPhone(phone);
  if (clean.length === 10) {
    return `${clean.slice(0, 3)} ••• ${clean.slice(6)}`;
  }
  if (clean.length > 4) {
    return `${clean.slice(0, 3)} ••• ${clean.slice(-2)}`;
  }
  return '••• •••';
}

/**
 * Generates an alphanumeric referral code (e.g. GBP7K9, REF842).
 */
export function generateReferralCode(phone: string): string {
  const clean = normalizeGhanaPhone(phone);
  const suffix = clean.length >= 4 ? clean.slice(-3) : Math.random().toString(36).substring(2, 5);
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `GB${randomChars}${suffix}`.toUpperCase();
}

/**
 * Retrieve master referral registry from Paystack (or memory cache if fresh).
 */
export async function getMasterRegistry(): Promise<MasterRegistry> {
  const now = Date.now();
  if (g.__gbplug_master_registry__ && now - g.__gbplug_master_registry__.timestamp < 30000) {
    return g.__gbplug_master_registry__.data;
  }

  const secretKey = getPaystackSecret();
  try {
    const res = await fetch(`${PAYSTACK_BASE_URL}/customer/${encodeURIComponent(MASTER_REGISTRY_EMAIL)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const meta = data.data?.metadata || {};
      const registry: MasterRegistry = {
        customerCode: data.data?.customer_code,
        codes: meta.codes || {},
        phoneToCode: meta.phoneToCode || {},
        attributions: meta.attributions || {},
      };
      g.__gbplug_master_registry__ = { data: registry, timestamp: now };
      return registry;
    }

    if (res.status === 404) {
      // Create master customer if not exists
      const createRes = await fetch(`${PAYSTACK_BASE_URL}/customer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: MASTER_REGISTRY_EMAIL,
          first_name: 'GBPlug',
          last_name: 'Master Referrals Registry',
          phone: '0240000000',
          metadata: {
            codes: {},
            phoneToCode: {},
            attributions: {},
          },
        }),
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        const registry: MasterRegistry = {
          customerCode: createData.data?.customer_code,
          codes: {},
          phoneToCode: {},
          attributions: {},
        };
        g.__gbplug_master_registry__ = { data: registry, timestamp: now };
        return registry;
      }
    }
  } catch (err) {
    console.error('[Referrals] Error loading master registry:', err);
  }

  // Fallback to in-memory or empty
  const empty: MasterRegistry = { codes: {}, phoneToCode: {}, attributions: {} };
  return g.__gbplug_master_registry__?.data || empty;
}

/**
 * Persists master registry back to Paystack customer metadata.
 */
export async function saveMasterRegistry(registry: MasterRegistry): Promise<boolean> {
  const secretKey = getPaystackSecret();
  g.__gbplug_master_registry__ = { data: registry, timestamp: Date.now() };

  try {
    const identifier = registry.customerCode || MASTER_REGISTRY_EMAIL;
    const res = await fetch(`${PAYSTACK_BASE_URL}/customer/${encodeURIComponent(identifier)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          codes: registry.codes,
          phoneToCode: registry.phoneToCode,
          attributions: registry.attributions,
          lastUpdated: new Date().toISOString(),
        },
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('[Referrals] Failed to save master registry:', err);
    return false;
  }
}

/**
 * Get or create a referrer profile by their phone number.
 */
export async function getOrCreateReferrer(rawPhone: string): Promise<ReferrerProfile> {
  const phone = normalizeGhanaPhone(rawPhone);
  if (!phone || phone.length !== 10) {
    throw new Error('Valid 10-digit Ghana phone number required');
  }

  // 1. Check local memory cache
  const cached = g.__gbplug_referrers_cache__?.get(phone);
  if (cached && Date.now() - cached.timestamp < 30000) {
    return cached.data;
  }

  const secretKey = getPaystackSecret();
  const customerEmail = `ref_${phone}@gbplug.com`;

  // 2. Load from Paystack
  let profile: ReferrerProfile | null = null;
  let customerCode = '';

  try {
    const getRes = await fetch(`${PAYSTACK_BASE_URL}/customer/${encodeURIComponent(customerEmail)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: 'no-store',
    });

    if (getRes.ok) {
      const getJson = await getRes.json();
      customerCode = getJson.data?.customer_code;
      const meta = getJson.data?.metadata?.referrerProfile;
      if (meta && meta.phone) {
        profile = {
          customerCode,
          phone: meta.phone,
          referralCode: meta.referralCode,
          createdAt: meta.createdAt || new Date().toISOString(),
          rewardsEarned: Number(meta.rewardsEarned) || 0,
          totalEligibleGb: Number(meta.totalEligibleGb) || 0,
          referredCustomers: meta.referredCustomers || {},
        };
      }
    }
  } catch (err) {
    console.error(`[Referrals] Error fetching referrer ${phone}:`, err);
  }

  // 3. If profile doesn't exist, create it
  if (!profile) {
    const master = await getMasterRegistry();
    let code = master.phoneToCode[phone];

    if (!code) {
      code = generateReferralCode(phone);
      // Ensure code is unique in registry
      while (master.codes[code] && master.codes[code] !== phone) {
        code = generateReferralCode(phone);
      }
      master.codes[code] = phone;
      master.phoneToCode[phone] = code;
      await saveMasterRegistry(master);
    }

    profile = {
      customerCode,
      phone,
      referralCode: code,
      createdAt: new Date().toISOString(),
      rewardsEarned: 0,
      totalEligibleGb: 0,
      referredCustomers: {},
    };

    // Create or update customer in Paystack
    try {
      const createRes = await fetch(`${PAYSTACK_BASE_URL}/customer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          first_name: 'Referrer',
          last_name: phone,
          phone,
          metadata: {
            referrerProfile: profile,
          },
        }),
      });

      if (createRes.ok) {
        const createJson = await createRes.json();
        profile.customerCode = createJson.data?.customer_code;
      }
    } catch (err) {
      console.error(`[Referrals] Error creating referrer in Paystack for ${phone}:`, err);
    }
  }

  g.__gbplug_referrers_cache__?.set(phone, { data: profile, timestamp: Date.now() });
  return profile;
}

/**
 * Retrieve Referrer Profile by phone
 */
export async function getReferrerProfile(rawPhone: string): Promise<ReferrerProfile | null> {
  const phone = normalizeGhanaPhone(rawPhone);
  if (!phone) return null;
  return await getOrCreateReferrer(phone);
}

/**
 * Save Referrer Profile back to Paystack and cache
 */
export async function saveReferrerProfile(profile: ReferrerProfile): Promise<boolean> {
  const secretKey = getPaystackSecret();
  const phone = normalizeGhanaPhone(profile.phone);
  g.__gbplug_referrers_cache__?.set(phone, { data: profile, timestamp: Date.now() });

  try {
    const identifier = profile.customerCode || `ref_${phone}@gbplug.com`;
    const res = await fetch(`${PAYSTACK_BASE_URL}/customer/${encodeURIComponent(identifier)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          referrerProfile: profile,
          lastUpdated: new Date().toISOString(),
        },
      }),
    });

    return res.ok;
  } catch (err) {
    console.error(`[Referrals] Failed to save referrer profile for ${phone}:`, err);
    return false;
  }
}

/**
 * Find referrer profile by their unique referral code
 */
export async function getReferrerByCode(code: string): Promise<ReferrerProfile | null> {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();
  const master = await getMasterRegistry();
  const referrerPhone = master.codes[cleanCode];
  if (!referrerPhone) return null;
  return await getOrCreateReferrer(referrerPhone);
}

/**
 * Attributes a customer to a referrer permanently (First-Referrer-Wins).
 * Prevents self-referral.
 */
export async function attributeCustomerToReferrer(
  customerPhone: string,
  referralCode: string
): Promise<{ success: boolean; reason?: string }> {
  const cleanCustomer = normalizeGhanaPhone(customerPhone);
  const cleanCode = referralCode.trim().toUpperCase();

  if (!cleanCustomer || cleanCustomer.length !== 10) {
    return { success: false, reason: 'Invalid customer phone' };
  }

  const master = await getMasterRegistry();

  // If already attributed, attribution is locked (first referrer wins)
  if (master.attributions[cleanCustomer]) {
    return { success: true, reason: 'Already attributed' };
  }

  const referrerPhone = master.codes[cleanCode];
  if (!referrerPhone) {
    return { success: false, reason: 'Referral code not found' };
  }

  // Prevent self-referral
  if (referrerPhone === cleanCustomer) {
    return { success: false, reason: 'Self-referral is not allowed' };
  }

  master.attributions[cleanCustomer] = {
    referrerPhone,
    referrerCode: cleanCode,
    attributedAt: new Date().toISOString(),
  };

  await saveMasterRegistry(master);
  console.log(`[Referrals] Successfully attributed customer ${cleanCustomer} to referrer ${referrerPhone} (code: ${cleanCode})`);
  return { success: true };
}

/**
 * Dispatches the 1 GB Reward to the referrer upon reaching the 7 GB threshold.
 * Uses MTN Flexa 1 GB or standard fallback.
 */
export async function dispatchReferralReward(
  referrerPhone: string,
  referredCustomerPhone: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const cleanReferrer = normalizeGhanaPhone(referrerPhone);
  const idempotencyKey = `ref-reward-${cleanReferrer}-${referredCustomerPhone}-${Date.now()}`;

  // 1 GB MTN Flexa product ID
  const FLEXA_1GB_ID = 'e5825a25-f365-4926-b78e-8a5b7d2a1c40';
  // AirtelTigo 1 GB product ID
  const AT_1GB_ID = '8a62ede0-2bad-4ab3-9737-d4758d218bdc';

  const mtnPrefixes = ['024', '054', '055', '059', '025', '053'];
  const atPrefixes = ['027', '057', '026', '056'];
  const prefix = cleanReferrer.slice(0, 3);

  try {
    let orderResult;
    if (mtnPrefixes.includes(prefix)) {
      console.log(`[Referrals] Dispatching 1 GB MTN Flexa reward to ${cleanReferrer}...`);
      orderResult = await buyFlexaBundle({
        productId: FLEXA_1GB_ID,
        recipient: cleanReferrer,
        idempotencyKey,
      });
    } else if (atPrefixes.includes(prefix)) {
      console.log(`[Referrals] Dispatching 1 GB AirtelTigo reward to ${cleanReferrer}...`);
      orderResult = await buyDataBundle({
        productId: AT_1GB_ID,
        recipient: cleanReferrer,
        idempotencyKey,
      });
    } else {
      // Telecel / Other fallback: Attempt standard bundle
      console.log(`[Referrals] Dispatching 1 GB reward to ${cleanReferrer}...`);
      orderResult = await buyDataBundle({
        productId: FLEXA_1GB_ID,
        recipient: cleanReferrer,
        idempotencyKey,
      });
    }

    if (orderResult?.order_id) {
      console.log(`[Referrals] Reward successfully delivered to ${cleanReferrer}. Order ID: ${orderResult.order_id}`);
      return { success: true, orderId: orderResult.order_id };
    }

    return { success: false, error: 'No order ID returned by provider' };
  } catch (err: any) {
    console.error(`[Referrals] Reward delivery failed for ${cleanReferrer}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Central Hook: Process a confirmed purchase for referral credit.
 * Exactly-once idempotency per payment reference.
 */
export async function processReferralForOrder(params: {
  buyerPhone: string;
  bundleGb: number;
  orderId: string;
  reference: string;
  referralCode?: string;
}): Promise<{ credited: boolean; rewardTriggered?: boolean; rewardOrderId?: string; reason?: string }> {
  const { buyerPhone, bundleGb, orderId, reference, referralCode } = params;
  const cleanBuyer = normalizeGhanaPhone(buyerPhone);

  if (!cleanBuyer || bundleGb <= 0 || !reference) {
    return { credited: false, reason: 'Invalid parameters' };
  }

  // Idempotency: prevent double counting the same reference
  const dedupeKey = `${reference}-${cleanBuyer}`;
  if (g.__gbplug_processed_orders__?.has(dedupeKey)) {
    return { credited: false, reason: 'Order already processed for referral' };
  }
  g.__gbplug_processed_orders__?.add(dedupeKey);

  const master = await getMasterRegistry();

  // If customer is not yet attributed, attribute them now if code is passed
  if (!master.attributions[cleanBuyer] && referralCode) {
    await attributeCustomerToReferrer(cleanBuyer, referralCode);
  }

  const attribution = master.attributions[cleanBuyer];
  if (!attribution) {
    return { credited: false, reason: 'Buyer not attributed to any referrer' };
  }

  const referrerPhone = attribution.referrerPhone;
  // Anti-fraud: cannot earn referral on own purchases
  if (referrerPhone === cleanBuyer) {
    return { credited: false, reason: 'Self-referral ignored' };
  }

  const referrer = await getOrCreateReferrer(referrerPhone);
  if (!referrer) {
    return { credited: false, reason: 'Referrer profile not found' };
  }

  let customerRecord = referrer.referredCustomers[cleanBuyer];
  if (!customerRecord) {
    customerRecord = {
      phone: cleanBuyer,
      maskedPhone: maskPhoneNumber(cleanBuyer),
      cumulativeGb: 0,
      targetGb: TARGET_GB_THRESHOLD,
      status: 'in_progress',
      purchases: [],
    };
  }

  // Check if customer ALREADY reached 7 GB and reward was delivered
  if (customerRecord.status === 'reward_delivered') {
    console.log(`[Referrals] Buyer ${cleanBuyer} has already reached 7 GB reward limit for ${referrerPhone}. Skipping further accrual.`);
    return { credited: false, reason: 'Customer already completed 7 GB threshold' };
  }

  // Check if this reference was somehow already logged
  const existingPurchase = customerRecord.purchases.find((p) => p.reference === reference);
  if (existingPurchase) {
    return { credited: false, reason: 'Reference already credited' };
  }

  // Add purchase
  customerRecord.purchases.push({
    orderId,
    reference,
    bundleGb,
    timestamp: new Date().toISOString(),
  });

  customerRecord.cumulativeGb = Math.round((customerRecord.cumulativeGb + bundleGb) * 100) / 100;
  referrer.totalEligibleGb = Math.round(((referrer.totalEligibleGb || 0) + bundleGb) * 100) / 100;

  let rewardTriggered = false;
  let rewardOrderId: string | undefined;

  // Check if threshold is reached
  if (customerRecord.cumulativeGb >= TARGET_GB_THRESHOLD) {
    console.log(`[Referrals] Buyer ${cleanBuyer} reached ${customerRecord.cumulativeGb} GB (>= ${TARGET_GB_THRESHOLD} GB)! Triggering 1 GB reward for referrer ${referrerPhone}...`);
    customerRecord.status = 'reward_delivered';

    const rewardResult = await dispatchReferralReward(referrerPhone, cleanBuyer);
    if (rewardResult.success && rewardResult.orderId) {
      rewardTriggered = true;
      rewardOrderId = rewardResult.orderId;
      customerRecord.rewardOrderId = rewardResult.orderId;
      customerRecord.rewardDeliveredAt = new Date().toISOString();
      referrer.rewardsEarned = (referrer.rewardsEarned || 0) + 1;
    } else {
      customerRecord.rewardFailureReason = rewardResult.error || 'Failed to dispatch free bundle';
    }
  }

  referrer.referredCustomers[cleanBuyer] = customerRecord;
  await saveReferrerProfile(referrer);

  return {
    credited: true,
    rewardTriggered,
    rewardOrderId,
  };
}
