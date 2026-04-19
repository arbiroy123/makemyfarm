import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('farmsync.db');

// Initialize database
export async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Users cache
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT,
          firstName TEXT,
          lastName TEXT,
          experienceLevel TEXT,
          profileImageUrl TEXT
        );`
      );

      // Farms cache
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS farms (
          id TEXT PRIMARY KEY,
          name TEXT,
          description TEXT,
          farmType TEXT,
          sizeSqft REAL,
          address TEXT,
          climateZone TEXT,
          isPublic INTEGER,
          lastSynced INTEGER
        );`
      );

      // Crops cache
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS crops (
          id TEXT PRIMARY KEY,
          farmId TEXT,
          vegetableId TEXT,
          quantityPlanted INTEGER,
          plantingDate TEXT,
          expectedHarvestDate TEXT,
          status TEXT,
          growingMethod TEXT,
          notes TEXT,
          lastSynced INTEGER
        );`
      );

      // Vegetables database
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS vegetables (
          id TEXT PRIMARY KEY,
          name TEXT,
          difficulty TEXT,
          daysToHarvest INTEGER,
          minTemp INTEGER,
          maxTemp INTEGER,
          waterFrequency INTEGER,
          sunlight INTEGER,
          imageUrl TEXT
        );`
      );

      // Sync queue (for offline changes)
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY,
          entityType TEXT,
          entityId TEXT,
          operation TEXT,
          payload TEXT,
          synced INTEGER DEFAULT 0,
          createdAt INTEGER
        );`
      );

      resolve();
    }, reject);
  });
}

// Sync queue operations
export async function addToSyncQueue(entityType, entityId, operation, payload) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO sync_queue (id, entityType, entityId, operation, payload, synced, createdAt)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [
          Math.random().toString(36),
          entityType,
          entityId,
          operation,
          JSON.stringify(payload),
          Date.now()
        ]
      );
      resolve();
    }, reject);
  });
}

export async function getPendingSyncQueue() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM sync_queue WHERE synced = 0 ORDER BY createdAt`,
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
}

export async function markSyncQueueAsSynced(queueIds) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE sync_queue SET synced = 1 WHERE id IN (${queueIds.map(() => '?').join(',')})`,
        queueIds
      );
      resolve();
    }, reject);
  });
}

// Farms cache
export async function cacheFarms(farms) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      farms.forEach(farm => {
        tx.executeSql(
          `INSERT OR REPLACE INTO farms VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            farm.id,
            farm.name,
            farm.description,
            farm.farmType,
            farm.sizeSqft,
            farm.address,
            farm.climateZone,
            farm.isPublic ? 1 : 0,
            Date.now()
          ]
        );
      });
      resolve();
    }, reject);
  });
}

export async function getCachedFarms() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM farms`,
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
}

// Crops cache
export async function cacheCrops(crops) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      crops.forEach(crop => {
        tx.executeSql(
          `INSERT OR REPLACE INTO crops VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            crop.id,
            crop.farmId,
            crop.vegetableId,
            crop.quantityPlanted,
            crop.plantingDate,
            crop.expectedHarvestDate,
            crop.status,
            crop.growingMethod,
            crop.notes,
            Date.now()
          ]
        );
      });
      resolve();
    }, reject);
  });
}

export async function getCachedCrops(farmId) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM crops WHERE farmId = ?`,
        [farmId],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
}

// Vegetables database
export async function cacheVegetables(vegetables) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      vegetables.forEach(veg => {
        tx.executeSql(
          `INSERT OR REPLACE INTO vegetables VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            veg.id,
            veg.name,
            veg.difficultyLevel,
            veg.daysToHarvest,
            veg.minTempCelsius,
            veg.maxTempCelsius,
            veg.waterFrequencyDays,
            veg.sunlightHours,
            veg.imageUrl
          ]
        );
      });
      resolve();
    }, reject);
  });
}

export async function searchVegetables(query) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM vegetables WHERE name LIKE ?`,
        [`%${query}%`],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
}
