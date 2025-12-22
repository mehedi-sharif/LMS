const { Client } = require('pg');

const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

async function fixPoliciesWithHTTP() {
    console.log('Fixing RLS policies using Supabase REST API...\n');

    const supabaseUrl = 'https://zpnnezphuxuhznllodhb.supabase.co';

    const sqlQuery = `
DROP POLICY IF EXISTS "Teachers can manage classes." ON public.classes;

CREATE POLICY "Teachers can update classes."
  ON public.classes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can delete classes."
  ON public.classes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );
`;

    try {
        // Try using the query endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ query: sqlQuery })
        });

        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Response:', text);

        if (response.ok) {
            console.log('\n✓ Policies fixed successfully!');
            return true;
        } else {
            console.log('\nREST API approach failed. Trying direct database connection...');
            return false;
        }
    } catch (error) {
        console.error('Fetch error:', error.message);
        return false;
    }
}

async function fixPoliciesWithPG() {
    console.log('\nUsing direct PostgreSQL connection...\n');

    // We need the database password
    const password = 'Tf2019@#$';
    const projectRef = 'zpnnezphuxuhznllodhb';

    // Try multiple connection approaches
    const configs = [
        {
            host: 'db.zpnnezphuxuhznllodhb.supabase.co',
            port: 5432,
            user: 'postgres',
            password: password,
            database: 'postgres'
        },
        {
            host: 'aws-0-ap-south-1.pooler.supabase.com',
            port: 6543,
            user: `postgres.${projectRef}`,
            password: password,
            database: 'postgres'
        },
        {
            host: 'aws-0-ap-south-1.pooler.supabase.com',
            port: 5432,
            user: `postgres.${projectRef}`,
            password: password,
            database: 'postgres'
        }
    ];

    for (const config of configs) {
        console.log(`Trying ${config.host}:${config.port}...`);
        const client = new Client({
            ...config,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        });

        try {
            await client.connect();
            console.log('✓ Connected!\n');

            const sql = `
DROP POLICY IF EXISTS "Teachers can manage classes." ON public.classes;

CREATE POLICY "Teachers can update classes."
  ON public.classes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can delete classes."
  ON public.classes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );
`;

            console.log('Executing SQL...');
            await client.query(sql);
            console.log('✓ Policies fixed successfully!');

            await client.end();
            return true;
        } catch (error) {
            console.log(`Failed: ${error.message}`);
            await client.end().catch(() => { });
        }
    }

    return false;
}

async function main() {
    const httpSuccess = await fixPoliciesWithHTTP();

    if (!httpSuccess) {
        const pgSuccess = await fixPoliciesWithPG();

        if (!pgSuccess) {
            console.error('\n❌ All connection attempts failed.');
            console.error('You will need to run the SQL manually in the Supabase Dashboard.');
            process.exit(1);
        }
    }

    console.log('\n✅ Done! You can now create classes in your app.');
    process.exit(0);
}

main();
