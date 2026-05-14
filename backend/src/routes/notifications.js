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

// Harvest-to-recipe push — called from crop.js when a crop is marked harvested
export async function sendHarvestRecipePush(userId, vegetableName, simpleRecipe) {
  if (!simpleRecipe) return;
  const recipeTitle = simpleRecipe.split('|')[0].replace(/^.*?:\s*/, '').trim();
  await sendPushToUser(
    userId,
    `You harvested your ${vegetableName}!`,
    `Tonight's idea: ${recipeTitle}. Tap to see the full recipe.`,
    { screen: 'Home', action: 'harvest_recipe', vegetable: vegetableName }
  );
}

// Stage-aware daily tip push — called from server.js cron each morning
export async function runDailyGrowTips() {
  try {
    const crops = await query(
      `SELECT c.id, c.planting_date, c.status,
              v.name AS vegetable_name, v.care_tips,
              fc.user_id
       FROM crops c
       JOIN vegetables v ON c.vegetable_id = v.id
       JOIN farm_collaborators fc ON fc.farm_id = c.farm_id AND fc.role = 'owner'
       WHERE c.status IN ('planted', 'growing', 'flowering', 'fruiting')`,
      []
    );

    // Group crops by user so we send at most 1 push per user per day
    const byUser = {};
    for (const crop of crops.rows) {
      if (!byUser[crop.user_id]) byUser[crop.user_id] = [];
      byUser[crop.user_id].push(crop);
    }

    for (const [userId, userCrops] of Object.entries(byUser)) {
      // Pick one crop — prefer the one closest to harvest
      const crop = userCrops[0];
      const daysPlanted = Math.floor((Date.now() - new Date(crop.planting_date)) / 86400000);

      let tip = null;
      if (daysPlanted <= 7) {
        tip = `Your ${crop.vegetable_name} seedlings need consistent moisture — check soil daily this week.`;
      } else if (daysPlanted <= 21) {
        tip = `${crop.vegetable_name} entering active growth — thin crowded plants to improve airflow and yield.`;
      } else if (crop.status === 'flowering') {
        tip = `${crop.vegetable_name} is flowering — avoid heavy nitrogen now; switch to phosphorus-rich feed.`;
      } else if (crop.status === 'fruiting') {
        tip = `${crop.vegetable_name} is fruiting — water deeply every 2 days to prevent blossom end issues.`;
      }

      if (tip) {
        await sendPushToUser(userId, `Today's grow tip`, tip, { screen: 'Home' });
      }
    }

    console.log(`Daily grow tips sent for ${Object.keys(byUser).length} users`);
  } catch (error) {
    console.error('Daily grow tips job failed:', error.message);
  }
}

// Frost alert for ALL growing crops (not just harvest-ready) — broader protection
export async function runFrostAlerts() {
  try {
    const crops = await query(
      `SELECT c.id, c.farm_id,
              v.name AS vegetable_name, v.min_temp_celsius,
              ST_Y(f.location::geometry) AS lat,
              ST_X(f.location::geometry) AS lng,
              fc.user_id
       FROM crops c
       JOIN vegetables v ON c.vegetable_id = v.id
       JOIN farms f ON c.farm_id = f.id
       JOIN farm_collaborators fc ON fc.farm_id = f.id AND fc.role = 'owner'
       WHERE c.status IN ('planted', 'growing', 'seedling', 'flowering', 'fruiting')`,
      []
    );

    // Deduplicate by user+location to avoid hammering the weather API
    const checked = new Set();
    for (const crop of crops.rows) {
      if (!crop.lat || !crop.lng) continue;
      const key = `${crop.user_id}:${Math.round(crop.lat * 10)}:${Math.round(crop.lng * 10)}`;
      if (checked.has(key)) continue;
      checked.add(key);

      try {
        const weatherRes = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${crop.lat}&longitude=${crop.lng}&daily=temperature_2m_min,precipitation_sum&forecast_days=2&timezone=auto`,
          { timeout: 8000 }
        );
        const daily = weatherRes.data?.daily;
        if (!daily) continue;

        const hasFrost = daily.temperature_2m_min?.some(v => v < 2);
        const hasHeavyRain = daily.precipitation_sum?.some(v => v > 20);

        if (hasFrost) {
          await sendPushToUser(
            crop.user_id,
            '❄️ Frost alert tonight',
            `Cover tender plants — frost forecast in your area. Check your ${crop.vegetable_name} and other crops.`,
            { screen: 'Home', action: 'frost_alert' }
          );
        } else if (hasHeavyRain) {
          await sendPushToUser(
            crop.user_id,
            '🌧️ Heavy rain incoming',
            `Check drainage around your crops — heavy rain expected. Harvest anything ready before it arrives.`,
            { screen: 'Home', action: 'rain_alert' }
          );
        }
      } catch (_) {
        // individual location failures are silent
      }
    }
    console.log(`Frost/weather alerts checked for ${checked.size} unique locations`);
  } catch (error) {
    console.error('Frost alert job failed:', error.message);
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
