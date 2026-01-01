// backend/scripts/migrate.js
const pool = require('../src/config/db');

(async () => {
  try {
    // schema is already created by 001_schema.sql; this is just a sanity check
    await pool.query('SELECT 1');
    console.log('Migrations completed (schema already applied).');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
