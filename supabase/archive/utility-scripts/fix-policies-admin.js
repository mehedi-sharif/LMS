const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zpnnezphuxuhznllodhb.supabase.co';
const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function fixRLSPolicies() {
    console.log('Fixing RLS policies...\n');

    try {
        // Drop the conflicting policy
        const dropPolicy = `
      DROP POLICY IF EXISTS "Teachers can manage classes." ON public.classes;
    `;

        console.log('1. Dropping conflicting policy...');
        const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPolicy });

        // Since rpc might not exist, let's use direct SQL execution
        const { error: error1 } = await supabase.from('classes').select('id').limit(0);

        // Execute SQL directly using the REST API
        const sqlCommands = `
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

        // Use fetch to call the SQL endpoint directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`
            },
            body: JSON.stringify({ query: sqlCommands })
        });

        if (!response.ok) {
            console.log('Direct SQL execution not available via REST API.');
            console.log('Using alternative approach...\n');

            // Alternative: We'll need to use pg library
            console.log('Installing pg library for direct database access...');
            return 'NEED_PG';
        }

        console.log('✓ Policies updated successfully!');
        return 'SUCCESS';

    } catch (error) {
        console.error('Error:', error.message);
        return 'ERROR';
    }
}

fixRLSPolicies().then(result => {
    if (result === 'NEED_PG') {
        console.log('\nWe need to use direct PostgreSQL connection.');
        console.log('Switching to pg-based approach...');
        process.exit(2);
    } else if (result === 'SUCCESS') {
        console.log('\n✓ All done! You can now create classes.');
        process.exit(0);
    } else {
        process.exit(1);
    }
});
