const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Encoded password: Tf2019@#$ -> Tf2019%40%23%24
const connectionString = 'postgresql://postgres:Tf2019%40%23%24@db.zpnnezphuxuhznllodhb.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database.');

    const sqlPath = path.join(__dirname, '../supabase/migrations/20250101000000_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying migration...');
    await client.query(sql);
    console.log('Migration applied successfully!');
  } catch (err) {
    console.error('Error applying migration:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
