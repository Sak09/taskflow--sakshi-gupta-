const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
];
for (const envPath of envPaths) {
  console.log('check', envPath, fs.existsSync(envPath));
}
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('loaded', envPath);
    break;
  }
}
console.log('DB_HOST=' + process.env.DB_HOST);
console.log('DB_USER=' + process.env.DB_USER);
console.log('DB_PASSWORD=' + process.env.DB_PASSWORD);
console.log('DB_NAME=' + process.env.DB_NAME);
const { Pool } = require('pg');
(async () => {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'taskflow',
    password: process.env.DB_PASSWORD || 'taskflow_secret',
    database: process.env.DB_NAME || 'taskflow',
  });
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT 1');
    console.log('connected', res.rows);
    client.release();
  } catch (err) {
    console.error('connect error', err.message);
  } finally {
    await pool.end();
  }
})();
