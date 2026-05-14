import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/tasks/today — today's personalised task list for all active crops
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const cropsResult = await query(
      `SELECT c.id, c.farm_id, c.planting_date, c.expected_harvest_date, c.status,
              v.name AS vegetable_name, v.water_frequency_days, v.days_to_harvest,
              v.simple_recipe,
              f.name AS farm_name,
              (CURRENT_DATE - c.planting_date)::int                            AS days_planted,
              (c.expected_harvest_date - CURRENT_DATE)::int                    AS days_to_harvest_remaining,
              (SELECT entry_date FROM crop_diary_entries
               WHERE crop_id = c.id ORDER BY entry_date DESC LIMIT 1)         AS last_diary_date,
              (CURRENT_DATE - (SELECT entry_date FROM crop_diary_entries
               WHERE crop_id = c.id ORDER BY entry_date DESC LIMIT 1))::int   AS days_since_diary
       FROM crops c
       JOIN vegetables v ON c.vegetable_id = v.id
       JOIN farms f ON c.farm_id = f.id
       JOIN farm_collaborators fc ON fc.farm_id = f.id AND fc.user_id = $1
       WHERE c.status IN ('planted', 'growing', 'flowering', 'fruiting')
       ORDER BY c.expected_harvest_date ASC`,
      [userId]
    );

    // Fetch today's completions in one shot to avoid N+1 per task type
    const completionsResult = await query(
      `SELECT crop_id, task_type FROM task_completions
       WHERE user_id = $1 AND completed_at::date = CURRENT_DATE`,
      [userId]
    );
    const doneToday = new Set(
      completionsResult.rows.map(r => `${r.crop_id}:${r.task_type}`)
    );

    // Fetch fertilize completions (14-day window) separately
    const fertilizeResult = await query(
      `SELECT crop_id FROM task_completions
       WHERE user_id = $1 AND task_type = 'fertilize'
         AND completed_at > CURRENT_DATE - INTERVAL '14 days'`,
      [userId]
    );
    const fertilizedRecently = new Set(fertilizeResult.rows.map(r => r.crop_id));

    const tasks = [];

    for (const crop of cropsResult.rows) {
      const daysToHarvest  = crop.days_to_harvest_remaining ?? 999;
      const daysPlanted    = crop.days_planted ?? 0;
      const daysSinceDiary = crop.days_since_diary ?? 999;
      const waterFreq      = crop.water_frequency_days || 3;

      // --- Watering ---
      if (!doneToday.has(`${crop.id}:water`)) {
        tasks.push({
          type: 'water',
          cropId: crop.id,
          cropName: crop.vegetable_name,
          farmName: crop.farm_name,
          farmId: crop.farm_id,
          title: `Water your ${crop.vegetable_name}`,
          subtitle: `Every ${waterFreq} days — keep soil evenly moist`,
          icon: 'water',
          priority: daysToHarvest <= 7 ? 'high' : 'medium',
          color: '#2196F3',
        });
      }

      // --- Harvest alert (≤3 days) ---
      if (daysToHarvest >= 0 && daysToHarvest <= 3 && !doneToday.has(`${crop.id}:harvest`)) {
        const recipeSnippet = crop.simple_recipe
          ? crop.simple_recipe.split('|')[0].replace(/^.*?:\s*/, '')
          : null;
        tasks.push({
          type: 'harvest',
          cropId: crop.id,
          cropName: crop.vegetable_name,
          farmName: crop.farm_name,
          farmId: crop.farm_id,
          title: daysToHarvest === 0
            ? `${crop.vegetable_name} is ready to harvest!`
            : `Harvest in ${daysToHarvest} day${daysToHarvest === 1 ? '' : 's'}`,
          subtitle: recipeSnippet
            ? `Tonight: ${recipeSnippet}`
            : 'Check crop and harvest when ready',
          icon: 'basket',
          priority: 'high',
          color: '#4CAF50',
          recipe: crop.simple_recipe || null,
        });
      }

      // --- Diary reminder (5+ days no entry) ---
      if ((daysSinceDiary >= 5 || !crop.last_diary_date) && !doneToday.has(`${crop.id}:diary`)) {
        tasks.push({
          type: 'diary',
          cropId: crop.id,
          cropName: crop.vegetable_name,
          farmName: crop.farm_name,
          farmId: crop.farm_id,
          title: `Log your ${crop.vegetable_name}`,
          subtitle: crop.last_diary_date
            ? `Last entry ${daysSinceDiary} days ago`
            : 'Start tracking — first diary entry',
          icon: 'journal',
          priority: 'low',
          color: '#9C27B0',
        });
      }

      // --- Fertilize reminder (every 14 days, after 2 weeks of planting) ---
      if (daysPlanted >= 14 && !fertilizedRecently.has(crop.id)) {
        tasks.push({
          type: 'fertilize',
          cropId: crop.id,
          cropName: crop.vegetable_name,
          farmName: crop.farm_name,
          farmId: crop.farm_id,
          title: `Fertilize your ${crop.vegetable_name}`,
          subtitle: 'Feed every 2 weeks — boosts yield',
          icon: 'leaf',
          priority: 'medium',
          color: '#FF9800',
        });
      }
    }

    // High → medium → low
    tasks.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));

    res.json({
      tasks,
      date: new Date().toISOString().split('T')[0],
      count: tasks.length,
    });
  } catch (error) {
    console.error('Tasks today error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks/complete — mark a task done for today
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { cropId, taskType } = req.body;
    if (!cropId || !taskType) {
      return res.status(400).json({ error: 'cropId and taskType required' });
    }

    await query(
      `INSERT INTO task_completions (user_id, crop_id, task_type)
       VALUES ($1, $2, $3)`,
      [req.user.userId, cropId, taskType]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Failed to mark task complete' });
  }
});

export default router;
