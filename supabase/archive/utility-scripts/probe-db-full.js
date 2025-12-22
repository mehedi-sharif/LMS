const { Client } = require('pg');

const projectRef = 'zpnnezphuxuhznllodhb';
const rawPassword = 'Tf2019@#$';

// Comprehensive list of Supabase/AWS regions
const regions = [
    'aws-0-ap-south-1.pooler.supabase.com',      // Mumbai (India)
    'aws-0-ap-southeast-1.pooler.supabase.com',  // Singapore
    'aws-0-us-east-1.pooler.supabase.com',       // N. Virginia
    'aws-0-eu-central-1.pooler.supabase.com',    // Frankfurt
    'aws-0-eu-west-1.pooler.supabase.com',       // Ireland
    'aws-0-eu-west-2.pooler.supabase.com',       // London
    'aws-0-us-west-1.pooler.supabase.com',       // N. California
    'aws-0-us-west-2.pooler.supabase.com',       // Oregon
    'aws-0-ap-northeast-1.pooler.supabase.com',  // Tokyo
    'aws-0-ap-northeast-2.pooler.supabase.com',  // Seoul
    'aws-0-ap-southeast-2.pooler.supabase.com',  // Sydney
    'aws-0-sa-east-1.pooler.supabase.com',       // Sao Paulo
    'aws-0-ca-central-1.pooler.supabase.com',    // Canada
    'aws-0-eu-west-3.pooler.supabase.com',       // Paris
    'aws-0-eu-north-1.pooler.supabase.com',      // Stockholm
    'aws-0-me-central-1.pooler.supabase.com',    // Bahrain
    // Try direct db DNS one more time just in case
    'db.zpnnezphuxuhznllodhb.supabase.co'
];

async function checkConnection(host) {
    const isDirect = host.startsWith('db.');
    const port = isDirect ? 5432 : 6543;
    const user = isDirect ? 'postgres' : `postgres.${projectRef}`;

    console.log(`Trying ${host}:${port} as ${user}...`);

    const client = new Client({
        host: host,
        port: port,
        user: user,
        password: rawPassword,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 3000 // fail fast
    });

    try {
        await client.connect();
        console.log(`SUCCESS: Connected to ${host}`);
        await client.end();
        return { host, port, user, password: rawPassword };
    } catch (err) {
        const msg = err.message;
        if (msg.includes('password authentication failed')) {
            console.log(`AUTH ERROR (Likely Correct Region!): ${msg}`);
            // Return this as a "partial success" so we know we hit the right server
            return { host, port, user, password: rawPassword, authFailed: true };
        } else if (msg.includes('ENOTFOUND')) {
            console.log(`DNS ERROR: ${msg}`);
        } else {
            console.log(`FAILED: ${msg}`);
        }
        await client.end().catch(() => { });
        return null;
    }
}

async function run() {
    for (const host of regions) {
        const result = await checkConnection(host);
        if (result) {
            if (result.authFailed) {
                console.log('FOUND correctly located server, but PASSWORD FAILED.');
                console.log(JSON.stringify(result, null, 2));
                process.exit(2);
            }
            console.log('Found working configuration:');
            console.log(JSON.stringify(result, null, 2));
            process.exit(0);
        }
    }
    console.error('All attempts failed.');
    process.exit(1);
}

run();
