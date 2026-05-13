import { query } from '../database/connection.js';

const FREE_LIMITS = { farms: 1, crops: 5 };

/**
 * Checks whether a user is allowed to create a new farm or crop based on
 * their subscription tier. Returns { allowed, tier, message }.
 *
 * @param {string} userId
 * @param {'farm'|'crop'} resource
 */
export async function checkSubscriptionLimit(userId, resource) {
  let tier = 'free';
  try {
    const userResult = await query(
      `SELECT subscription_tier FROM users WHERE id = $1`,
      [userId]
    );
    tier = userResult.rows[0]?.subscription_tier ?? 'free';
  } catch {
    // Column may not exist on older DB — default to free tier behaviour
    return { allowed: true, tier: 'free' };
  }

  if (tier !== 'free') {
    return { allowed: true, tier };
  }

  if (resource === 'farm') {
    const countResult = await query(
      `SELECT COUNT(*) FROM farms WHERE owner_id = $1`,
      [userId]
    );
    if (parseInt(countResult.rows[0].count) >= FREE_LIMITS.farms) {
      return {
        allowed: false,
        tier,
        message: `Upgrade to Pro to add more farms (free tier limit: ${FREE_LIMITS.farms})`,
      };
    }
  } else if (resource === 'crop') {
    const countResult = await query(
      `SELECT COUNT(*) FROM crops c
       JOIN farms f ON c.farm_id = f.id
       WHERE f.owner_id = $1`,
      [userId]
    );
    if (parseInt(countResult.rows[0].count) >= FREE_LIMITS.crops) {
      return {
        allowed: false,
        tier,
        message: `Upgrade to Pro to add more crops (free tier limit: ${FREE_LIMITS.crops})`,
      };
    }
  }

  return { allowed: true, tier };
}
