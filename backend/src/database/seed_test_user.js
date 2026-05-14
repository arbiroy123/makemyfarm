/**
 * Test account seeder — creates a Pro user with farms, crops, and diary entries.
 * Run: node src/database/seed_test_user.js
 *
 * Credentials:
 *   Email:    testpro@farmsync.app
 *   Password: TestPro@123
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── 1. Create Pro user ────────────────────────────────────────────────────
    const userId   = uuidv4();
    const email    = 'testpro@farmsync.app';
    const pwHash   = await bcrypt.hash('TestPro@123', 12);

    // Delete existing test user if present (idempotent re-run)
    await client.query('DELETE FROM users WHERE email = $1', [email]);

    await client.query(
      `INSERT INTO users
         (id, email, password_hash, first_name, last_name, experience_level,
          country_code, subscription_tier, is_admin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [userId, email, pwHash, 'Test', 'Pro', 'intermediate', 'IN', 'pro', false]
    );
    console.log(`✓ User created: ${email}`);

    // ── 2. Fetch some vegetable IDs ───────────────────────────────────────────
    const vegResult = await client.query(
      `SELECT id, name, days_to_harvest FROM vegetables LIMIT 20`
    );
    const veg = vegResult.rows;
    if (veg.length === 0) {
      console.error('✗ No vegetables in DB — run seed.sql first');
      await client.query('ROLLBACK');
      return;
    }

    const byName = {};
    veg.forEach(v => { byName[v.name.toLowerCase()] = v; });

    const tomato  = byName['tomato']  || veg[0];
    const lettuce = byName['lettuce'] || veg[1] || veg[0];
    const carrot  = byName['carrot']  || veg[2] || veg[0];
    const pepper  = byName['bell pepper'] || veg[3] || veg[0];
    const spinach = byName['spinach'] || veg[4] || veg[0];
    const bean    = byName['green bean'] || byName['beans'] || veg[5] || veg[0];

    // Helper: insert farm with PostGIS location point
    async function createFarm(id, name, desc, type, size, address, zone, lat, lng) {
      await client.query(
        `INSERT INTO farms (id, owner_id, name, description, farm_type, size_sqft,
            location, address, climate_zone)
         VALUES ($1,$2,$3,$4,$5,$6,ST_SetSRID(ST_MakePoint($8,$7),4326),$9,$10)`,
        [id, userId, name, desc, type, size, lat, lng, address, zone]
      );
      await client.query(
        `INSERT INTO farm_collaborators (farm_id, user_id, role) VALUES ($1,$2,'owner')`,
        [id, userId]
      );
    }

    // ── 3. Farm A — small backyard (50 sq ft) ────────────────────────────────
    const farmAId = uuidv4();
    await createFarm(farmAId, 'Backyard Patch', 'Small kitchen garden behind the house',
      'backyard', 50, 'Mumbai, India', 'Subtropical', 19.0760, 72.8777);
    console.log(`✓ Farm A created: Backyard Patch (50 sq ft)`);

    // ── 4. Farm B — medium rooftop (150 sq ft) ───────────────────────────────
    const farmBId = uuidv4();
    await createFarm(farmBId, 'Rooftop Garden', 'Container garden on terrace — south-facing',
      'rooftop', 150, 'Mumbai, India', 'Subtropical', 19.0760, 72.8800);
    console.log(`✓ Farm B created: Rooftop Garden (150 sq ft)`);

    // ── 5. Farm C — large community (400 sq ft) ──────────────────────────────
    const farmCId = uuidv4();
    await createFarm(farmCId, 'Community Plot', 'Shared plot at local community garden',
      'community', 400, 'Pune, India', 'Subtropical', 18.5204, 73.8567);
    console.log(`✓ Farm C created: Community Plot (400 sq ft)`);

    // Helper to plant a crop with diary entries
    async function plantCrop(farmId, vegObj, daysAgo, status = 'growing', notes = '') {
      const cropId      = uuidv4();
      const plantedDate = new Date();
      plantedDate.setDate(plantedDate.getDate() - daysAgo);
      const plantedStr  = plantedDate.toISOString().split('T')[0];

      await client.query(
        `INSERT INTO crops (id, farm_id, vegetable_id, quantity_planted, planting_date,
           expected_harvest_date, status, growing_method, notes)
         VALUES ($1,$2,$3,$4,$5,
           ($5::date + ($6 || ' days')::interval)::date,
           $7, 'outdoor', $8)`,
        [cropId, farmId, vegObj.id, 2, plantedStr, vegObj.days_to_harvest, status, notes]
      );

      // Add diary entries every 5 days since planting
      const stages = ['seeded', 'sprouted', 'seedling', 'growing', 'flowering', 'fruiting'];
      for (let d = daysAgo; d >= 5; d -= 5) {
        const entryDate = new Date();
        entryDate.setDate(entryDate.getDate() - d);
        const stage = stages[Math.min(Math.floor((daysAgo - d) / 10), stages.length - 1)];
        await client.query(
          `INSERT INTO crop_diary_entries
             (crop_id, user_id, entry_date, growth_stage, note, height_cm)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [cropId, userId, entryDate.toISOString().split('T')[0], stage,
           `Day ${daysAgo - d}: ${vegObj.name} looking healthy. Watered and checked for pests.`,
           Math.floor(5 + (daysAgo - d) * 0.8)]
        );
      }

      await client.query(
        `INSERT INTO activity_log (farm_id, user_id, action, details)
         VALUES ($1,$2,'crop_planted',$3)`,
        [farmId, userId, JSON.stringify({ cropId, vegetableId: vegObj.id })]
      );

      return cropId;
    }

    // ── 6. Backyard crops (small plots) ──────────────────────────────────────
    await plantCrop(farmAId, tomato,  45, 'growing',   'Indeterminate variety, staked');
    await plantCrop(farmAId, lettuce, 20, 'growing',   'Cut-and-come-again method');
    await plantCrop(farmAId, carrot,  30, 'growing',   'Deep container, loose soil');
    console.log(`✓ 3 crops planted in Backyard Patch`);

    // ── 7. Rooftop crops (medium plots) ──────────────────────────────────────
    await plantCrop(farmBId, pepper,  60, 'growing',   'Red bell pepper, needs support');
    await plantCrop(farmBId, spinach, 15, 'growing',   'Container spinach, partial shade');
    await plantCrop(farmBId, tomato,   5, 'planted',   'Cherry tomatoes — new seedlings');
    await plantCrop(farmBId, lettuce, 35, 'growing',   'Succession batch 2');
    console.log(`✓ 4 crops planted in Rooftop Garden`);

    // ── 8. Community crops (large plots) ─────────────────────────────────────
    await plantCrop(farmCId, bean,    25, 'growing',   'Bush beans along the fence row');
    await plantCrop(farmCId, carrot,  50, 'growing',   'Large carrot bed — 3 varieties');
    await plantCrop(farmCId, spinach, 10, 'planted',   'Winter spinach — cold tolerant variety');
    await plantCrop(farmCId, pepper,   3, 'planted',   'New transplants from nursery');
    await plantCrop(farmCId, lettuce, 40, 'growing',   'Mixed lettuce bed — harvest outer leaves');
    console.log(`✓ 5 crops planted in Community Plot`);

    // ── 9. Financial records for Farm B ──────────────────────────────────────
    const finTable = await client.query(
      `SELECT to_regclass('public.financial_records') AS exists`
    );
    if (finTable.rows[0]?.exists) {
      await client.query(
        `INSERT INTO financial_records (id, farm_id, user_id, type, category, amount, description, record_date)
         VALUES
           ($1,$2,$3,'expense','Seeds',450,'Mixed seed pack — tomato, lettuce, carrot',CURRENT_DATE - 60),
           ($4,$2,$3,'expense','Fertilizer',320,'Organic compost 5kg',CURRENT_DATE - 45),
           ($5,$2,$3,'income','Crop Sale',1200,'Sold surplus tomatoes at local market',CURRENT_DATE - 10)`,
        [uuidv4(), farmBId, userId, uuidv4(), uuidv4()]
      );
      console.log(`✓ Financial records added for Rooftop Garden`);
    }

    // ── 10. Achievements ──────────────────────────────────────────────────────
    await client.query(
      `INSERT INTO achievements (user_id, badge_name, badge_icon, description)
       VALUES
         ($1,'First Seed','🌱','Planted your first crop'),
         ($1,'Diary Keeper','📓','Logged 5+ diary entries'),
         ($1,'Multi-Farmer','🚜','Managing 3 farms'),
         ($1,'Pro Grower','⭐','Upgraded to Pro')`,
      [userId]
    );
    console.log(`✓ Achievements unlocked`);

    await client.query('COMMIT');

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  TEST ACCOUNT READY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Email:    testpro@farmsync.app`);
    console.log(`  Password: TestPro@123`);
    console.log(`  Tier:     PRO`);
    console.log(`  Farms:    3 (50 / 150 / 400 sq ft)`);
    console.log(`  Crops:    12 total (various stages)`);
    console.log(`  Diary:    entries logged for all crops`);
    console.log('═══════════════════════════════════════════════════\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('✗ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
