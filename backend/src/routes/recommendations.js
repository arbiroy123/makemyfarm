import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// --- fuzzy match helpers ---

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function editThreshold(len) {
  if (len <= 4) return 1;
  if (len <= 7) return 2;
  return 3;
}

const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'type', 'variety', 'kind', 'species']);

function tokenize(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP.has(t));
}

function findMatch(input, vegetables) {
  const norm = input.toLowerCase().trim();

  // exact match — already supported
  for (const v of vegetables) {
    if (v.name.toLowerCase() === norm) return { type: 'exact', match: v };
  }

  // typo — levenshtein within threshold
  for (const v of vegetables) {
    const vNorm = v.name.toLowerCase();
    const dist = levenshtein(norm, vNorm);
    if (dist > 0 && dist <= editThreshold(Math.max(norm.length, vNorm.length))) {
      return { type: 'typo', match: v };
    }
  }

  // variant — shared content token or veg name is substring of input
  const inputTokens = tokenize(input);
  if (inputTokens.length > 0) {
    for (const v of vegetables) {
      const vegTokens = tokenize(v.name);
      const hasSharedToken = inputTokens.some(t => vegTokens.includes(t));
      const vegIsSubstring = norm.includes(v.name.toLowerCase());
      if (hasSharedToken || vegIsSubstring) {
        return { type: 'variant', match: v };
      }
    }
  }

  return { type: 'none' };
}

// Get vegetable recommendations based on climate, season, and difficulty
router.get('/vegetables', authenticateToken, async (req, res) => {
  try {
    const { climateZone, season, difficulty } = req.query;

    let sql = `SELECT * FROM vegetables WHERE 1=1`;
    const params = [];

    if (climateZone) {
      sql += ` AND $${params.length + 1} = ANY(climate_zones)`;
      params.push(climateZone);
    }

    if (season) {
      sql += ` AND season = $${params.length + 1}`;
      params.push(season);
    }

    if (difficulty) {
      sql += ` AND difficulty_level = $${params.length + 1}`;
      params.push(difficulty);
    }

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get care guide for a specific vegetable
router.get('/vegetable/:vegetableId', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, scientific_name, difficulty_level, days_to_harvest, spacing_cm,
              min_temp_celsius, optimal_temp_celsius, max_temp_celsius,
              water_frequency_days, sunlight_hours, soil_type, ph_min, ph_max,
              season, climate_zones, can_greenhouse, yields_per_plant,
              planting_tips, care_tips, pest_diseases, companion_plants,
              fun_fact, growing_story, simple_recipe, nutrition
       FROM vegetables WHERE id = $1`,
      [req.params.vegetableId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vegetable not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch vegetable guide' });
  }
});

// Get seasonal recommendations for user's location
router.get('/seasonal', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT timezone FROM users WHERE id = $1`,
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get current season based on user's timezone (simplified)
    const currentMonth = new Date().getMonth();
    let season = 'spring';
    if (currentMonth >= 3 && currentMonth < 6) season = 'spring';
    else if (currentMonth >= 6 && currentMonth < 9) season = 'summer';
    else if (currentMonth >= 9 && currentMonth < 12) season = 'fall';
    else season = 'winter';

    // Get user's farms for climate zones
    const farmsResult = await query(
      `SELECT DISTINCT climate_zone FROM farms WHERE owner_id = $1`,
      [req.user.userId]
    );

    const climateZones = farmsResult.rows.map(f => f.climate_zone);

    // Recommend vegetables
    let sql = `SELECT * FROM vegetables WHERE season ILIKE $1`;
    const params = [season];

    if (climateZones.length > 0) {
      sql += ` AND (`;
      for (let i = 0; i < climateZones.length; i++) {
        if (i > 0) sql += ` OR `;
        sql += `$${params.length + 1} = ANY(climate_zones)`;
        params.push(climateZones[i]);
      }
      sql += `)`;
    }

    const recommendations = await query(sql, params);

    res.json({
      season,
      climateZones,
      recommendations: recommendations.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get all vegetables (database)
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, scientific_name, difficulty_level, days_to_harvest, season, image_url
       FROM vegetables
       ORDER BY name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch vegetables' });
  }
});

// Check if a submitted name is a typo or variant of an existing vegetable
router.get('/check-name', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || !name.trim()) return res.json({ type: 'none' });

    const result = await query(`SELECT id, name FROM vegetables ORDER BY name`);
    res.json(findMatch(name.trim(), result.rows));
  } catch (error) {
    console.error(error);
    res.json({ type: 'none' }); // non-critical, degrade gracefully
  }
});

// Submit a request to add a new vegetable
router.post('/vegetable-requests', authenticateToken, async (req, res) => {
  try {
    const { vegetableName, description, reason } = req.body;

    if (!vegetableName || !vegetableName.trim()) {
      return res.status(400).json({ error: 'Vegetable name is required' });
    }

    const result = await query(
      `INSERT INTO vegetable_requests (user_id, vegetable_name, description, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING id, vegetable_name, description, reason, status, created_at`,
      [req.user.userId, vegetableName.trim(), description?.trim() || null, reason?.trim() || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit vegetable request' });
  }
});

// Get current user's vegetable requests
router.get('/vegetable-requests', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, vegetable_name, description, reason, status, created_at
       FROM vegetable_requests
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch vegetable requests' });
  }
});

export default router;
