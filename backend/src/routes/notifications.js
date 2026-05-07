import express from 'express';
import axios from 'axios';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Register / update Expo push token for the logged-in user
router.post('/register-token', authenticateToken, async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    await query(
      `INSERT INTO push_tokens (user_id, token, platform)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET token = $2, platform = $3, updated_at = NOW()`,
      [req.user.userId, token, platform || 'expo']
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register token' });
  }
});

// Internal: send Expo push notification to a user
export async function sendPushToUser(userId, title, body, data = {}) {
  try {
    const tokenRow = await query(`SELECT token FROM push_tokens WHERE user_id = $1`, [userId]);
    if (tokenRow.rows.length === 0) return;
    const token = tokenRow.rows[0].token;
    if (!token.startsWith('ExponentPushToken')) return;

    await axios.post('https://exp.host/--/api/v2/push/send', {
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }, { timeout: 10000 });
  } catch (err) {
    console.error('Push notification failed:', err.message);
  }
}

// Nightly weather check — called from server.js cron
export async function runWeatherAlerts() {
  try {
    // Find crops whose expected_harvest_date is within the next 3 days
    const crops = await query(
      `SELECT c.id, c.expected_harvest_date, c.farm_id,
              v.name as vegetable_name,
              ST_Y(f.location::geometry) as lat,
              ST_X(f.location::geometry) as lng,
              fc.user_id
       FROM crops c
       JOIN vegetables v ON c.vegetable_id = v.id
       JOIN farms f ON c.farm_id = f.id
       JOIN farm_collaborators fc ON fc.farm_id = f.id AND fc.role = 'owner'
       WHERE c.status IN ('planted', 'growing')
         AND c.expected_harvest_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'`,
      []
    );

    for (const crop of crops.rows) {
      if (!crop.lat || !crop.lng) continue;
      try {
        const weatherRes = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${crop.lat}&longitude=${crop.lng}&daily=precipitation_sum,temperature_2m_min&forecast_days=3&timezone=auto`,
          { timeout: 8000 }
        );
        const daily = weatherRes.data?.daily;
        if (!daily) continue;

        const hasHeavyRain = daily.precipitation_sum?.some(v => v > 15);
        const hasFrost = daily.temperature_2m_min?.some(v => v < 2);

        if (hasHeavyRain || hasFrost) {
          const warning = hasHeavyRain ? 'Heavy rain expected' : 'Frost risk detected';
          await sendPushToUser(
            crop.user_id,
            `⚠️ ${warning} — harvest soon!`,
            `Your ${crop.vegetable_name} is due for harvest and ${hasHeavyRain ? 'heavy rain' : 'frost'} is forecast. Consider harvesting now.`,
            { cropId: crop.id }
          );
        }
      } catch (_) {
        // Skip individual crop weather failures silently
      }
    }
    console.log(`Weather alerts checked for ${crops.rows.length} crops`);
  } catch (error) {
    console.error('Weather alert job failed:', error.message);
  }
}

export default router;
