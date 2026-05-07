import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

const ACHIEVEMENT_DEFS = [
  { key: 'first_farm',        badge: '🏡', name: 'Farm Founder',      description: 'Created your first farm',           type: 'milestone' },
  { key: 'first_harvest',     badge: '🌱', name: 'First Harvest',     description: 'Harvested your first crop',         type: 'milestone' },
  { key: 'ten_harvests',      badge: '🏆', name: 'Veteran Grower',    description: 'Harvested 10 crops total',          type: 'milestone' },
  { key: 'fifty_harvests',    badge: '🥇', name: 'Master Farmer',     description: 'Harvested 50 crops total',          type: 'milestone' },
  { key: 'diary_keeper',      badge: '📔', name: 'Diary Keeper',      description: 'Added 7 diary entries',             type: 'milestone' },
  { key: 'community_member',  badge: '🤝', name: 'Community Member',  description: 'Joined a community group',          type: 'social'    },
  { key: 'disease_detective', badge: '🔬', name: 'Disease Detective', description: 'Used plant disease detection',      type: 'feature'   },
  { key: 'market_trader',     badge: '🛒', name: 'Market Trader',     description: 'Listed produce on the marketplace', type: 'feature'   },
  { key: 'expert_farmer',     badge: '👨‍🌾', name: 'Expert Farmer',    description: 'Reached expert experience level',   type: 'milestone' },
  { key: 'map_explorer',      badge: '🌍', name: 'Map Explorer',      description: 'Explored the community map',        type: 'feature'   },
  { key: 'garden_planner',    badge: '📐', name: 'Garden Planner',    description: 'Created a garden layout plan',      type: 'feature'   },
];

// Get user's earned achievements + full definitions (for locked/unlocked grid)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const earned = await query(
      `SELECT badge_name, earned_at FROM achievements WHERE user_id = $1`,
      [req.user.userId]
    );
    const earnedKeys = new Set(earned.rows.map(r => r.badge_name));
    const earnedDates = {};
    earned.rows.forEach(r => { earnedDates[r.badge_name] = r.earned_at; });

    const achievements = ACHIEVEMENT_DEFS.map(def => ({
      ...def,
      earned: earnedKeys.has(def.key),
      earned_at: earnedDates[def.key] || null,
    }));

    res.json({ achievements, total: ACHIEVEMENT_DEFS.length, earnedCount: earnedKeys.size });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Check + award achievements for the logged-in user
router.post('/check', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const awarded = [];

    // Farm count
    const farms = await query(`SELECT COUNT(*) FROM farm_collaborators WHERE user_id = $1 AND role = 'owner'`, [userId]);
    if (parseInt(farms.rows[0].count) >= 1) awarded.push(await award(userId, 'first_farm'));

    // Harvest counts
    const harvests = await query(
      `SELECT COUNT(*) FROM crops c JOIN farm_collaborators fc ON c.farm_id = fc.farm_id WHERE fc.user_id = $1 AND c.status = 'harvested'`,
      [userId]
    );
    const hc = parseInt(harvests.rows[0].count);
    if (hc >= 1)  awarded.push(await award(userId, 'first_harvest'));
    if (hc >= 10) awarded.push(await award(userId, 'ten_harvests'));
    if (hc >= 50) awarded.push(await award(userId, 'fifty_harvests'));

    // Diary entries
    const diary = await query(`SELECT COUNT(*) FROM crop_diary_entries WHERE user_id = $1`, [userId]);
    if (parseInt(diary.rows[0].count) >= 7) awarded.push(await award(userId, 'diary_keeper'));

    // Community groups
    const groups = await query(`SELECT COUNT(*) FROM community_members WHERE user_id = $1`, [userId]);
    if (parseInt(groups.rows[0].count) >= 1) awarded.push(await award(userId, 'community_member'));

    // Experience level
    const user = await query(`SELECT experience_level FROM users WHERE id = $1`, [userId]);
    if (user.rows[0]?.experience_level === 'expert') awarded.push(await award(userId, 'expert_farmer'));

    // Disease detection
    const diseaseAch = await query(`SELECT 1 FROM achievements WHERE user_id = $1 AND badge_name = 'disease_detective'`, [userId]);
    if (diseaseAch.rows.length === 0 && req.body?.trigger === 'disease') awarded.push(await award(userId, 'disease_detective'));

    // Market listing
    const market = await query(`SELECT COUNT(*) FROM marketplace_listings WHERE user_id = $1`, [userId]);
    if (parseInt(market.rows[0].count) >= 1) awarded.push(await award(userId, 'market_trader'));

    // Garden planner
    const plans = await query(`SELECT COUNT(*) FROM garden_plans WHERE user_id = $1`, [userId]);
    if (parseInt(plans.rows[0].count) >= 1) awarded.push(await award(userId, 'garden_planner'));

    res.json({ checked: true, awarded: awarded.filter(Boolean) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
});

// Internal helper — idempotent award
async function award(userId, key) {
  const def = ACHIEVEMENT_DEFS.find(d => d.key === key);
  if (!def) return null;
  const existing = await query(`SELECT id FROM achievements WHERE user_id = $1 AND badge_name = $2`, [userId, key]);
  if (existing.rows.length > 0) return null;
  await query(
    `INSERT INTO achievements (user_id, badge_name, badge_icon, description) VALUES ($1, $2, $3, $4)`,
    [userId, key, def.badge, def.description]
  );
  return key;
}

export { award as awardAchievement, ACHIEVEMENT_DEFS };
export default router;
