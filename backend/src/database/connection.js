import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function connectDatabase() {
  try {
    const client = await pool.connect();
    console.log('Database pool connected');
    client.release();
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export function getPool() {
  return pool;
}

export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, text);
    }
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}
