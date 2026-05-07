import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

const FROST_BY_ZONE = {
  'Tropical':              { lastFrost: null, firstFrost: null, frostMonths: [] },
  'Arid':                  { lastFrost: null, firstFrost: null, frostMonths: [] },
  'Semi-Arid':             { lastFrost: 2,    firstFrost: 11,   frostMonths: [12, 1, 2] },
  'Subtropical':           { lastFrost: 1,    firstFrost: 12,   frostMonths: [12, 1] },
  'Mediterranean':         { lastFrost: 2,    firstFrost: 11,   frostMonths: [12, 1, 2] },
  'Oceanic':               { lastFrost: 2,    firstFrost: 11,   frostMonths: [12, 1, 2] },
  'Temperate':             { lastFrost: 3,    firstFrost: 11,   frostMonths: [11, 12, 1, 2, 3] },
  'Humid Continental':     { lastFrost: 4,    firstFrost: 10,   frostMonths: [11, 12, 1, 2, 3, 4] },
  'Temperate Continental': { lastFrost: 4,    firstFrost: 10,   frostMonths: [11, 12, 1, 2, 3, 4] },
  'Subarctic':             { lastFrost: 6,    firstFrost: 8,    frostMonths: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6] },
};

const SEASON_MONTHS = {
  'spring':      [3, 4, 5],
  'summer':      [6, 7, 8],
  'fall':        [8, 9, 10],
  'winter':      [10, 11, 12],
  'all-season':  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  'cool-season': [2, 3, 4, 8, 9, 10],
  'warm-season': [4, 5, 6, 7, 8, 9],
};

router.get('/:farmId', authenticateToken, async (req, res) => {
  try {
    const farmRow = await query(`SELECT climate_zone FROM farms WHERE id = $1`, [req.params.farmId]);
    if (farmRow.rows.length === 0) return res.status(404).json({ error: 'Farm not found' });

    const climateZone = farmRow.rows[0].climate_zone || 'Temperate';
    const frostInfo = FROST_BY_ZONE[climateZone] || FROST_BY_ZONE['Temperate'];

    // Vegetables compatible with this climate zone
    const vegetables = await query(
      `SELECT id, name, season, days_to_harvest, difficulty_level
       FROM vegetables
       WHERE $1 = ANY(climate_zones) OR climate_zones IS NULL OR array_length(climate_zones, 1) = 0
       ORDER BY name`,
      [climateZone]
    );

    // Active crops for this farm with their timeline
    const crops = await query(
      `SELECT c.id, v.name as vegetable_name, c.planting_date, c.expected_harvest_date, c.status
       FROM crops c JOIN vegetables v ON c.vegetable_id = v.id
       WHERE c.farm_id = $1 AND c.status NOT IN ('harvested', 'failed')
       ORDER BY c.planting_date`,
      [req.params.farmId]
    );

    // Build monthly planting windows
    const monthlyPlanting = {};
    for (let m = 1; m <= 12; m++) {
      const isFrostMonth = frostInfo.frostMonths.includes(m);
      const safe    = vegetables.rows.filter(v => (SEASON_MONTHS[v.season] || SEASON_MONTHS['all-season']).includes(m) && !isFrostMonth);
      const caution = vegetables.rows.filter(v => (SEASON_MONTHS[v.season] || SEASON_MONTHS['all-season']).includes(m) && isFrostMonth);
      monthlyPlanting[m] = { safe, caution, frostRisk: isFrostMonth };
    }

    res.json({ climateZone, frostInfo, monthlyPlanting, currentCrops: crops.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load calendar' });
  }
});

export default router;
