const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.zpnnezphuxuhznllodhb',
    password: 'Tf2019@#$',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
};

console.log(`Connecting to ${config.host} as ${config.user}...`);

const client = new Client(config);

client.connect()
    .then(async () => {
        console.log("Connected successfully!");

        // Read the migration file
        const sqlPath = path.join(__dirname, '../supabase/migrations/20250101000000_initial_schema.sql');
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`Migration file not found at ${sqlPath}`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Applying migration...');

        await client.query(sql);
        console.log('Migration applied successfully!');
        await client.end();
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection/Migration failed:");
        console.error(err);
        client.end().catch(() => { });
        process.exit(1);
    });
