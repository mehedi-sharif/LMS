const { Client } = require('pg');

const projectRef = 'zpnnezphuxuhznllodhb';
const rawPassword = 'Tf2019@#$';

// List of potential pooler hosts
const regions = [
    'aws-0-eu-west-1.pooler.supabase.com',
    'aws-0-eu-west-2.pooler.supabase.com',
    'aws-0-eu-west-3.pooler.supabase.com',
    'aws-0-us-east-2.pooler.supabase.com',
    'aws-0-us-west-1.pooler.supabase.com',
    'aws-0-us-west-2.pooler.supabase.com',
    'aws-0-ap-south-1.pooler.supabase.com',
    'aws-0-ap-northeast-1.pooler.supabase.com',
    'aws-0-ap-northeast-2.pooler.supabase.com',
    'aws-0-ap-southeast-2.pooler.supabase.com',
    'aws-0-sa-east-1.pooler.supabase.com',
    'aws-0-ca-central-1.pooler.supabase.com'
];

async function checkConnection(host) {
    const user = `postgres.${projectRef}`;
    console.log(`Trying ${host}:6543 as ${user}...`);
    const client = new Client({
        host: host,
        port: 6543,
        user: user,
        password: rawPassword,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        await client.connect();
        console.log(`SUCCESS: Connected to ${host}`);
        await client.end();
        return { host, port: 6543, user, password: rawPassword };
    } catch (err) {
        if (err.message.includes('password authentication failed')) {
            console.log(`FAILED with Auth Error (Region might be correct!): ${err.message}`);
            // If auth fails but not tenant/user not found, it might be the right region but wrong password.
            // But usually it says Tenant or user not found if wrong region.
        } else {
            console.log(`FAILED: ${err.message}`);
        }
        await client.end().catch(() => { });
        return null;
    }
}

async function run() {
    for (const host of regions) {
        const success = await checkConnection(host);
        if (success) {
            console.log('Found working configuration:');
            console.log(JSON.stringify(success, null, 2));
            process.exit(0);
        }
    }
    console.error('All attempts failed.');
    process.exit(1);
}

run();
