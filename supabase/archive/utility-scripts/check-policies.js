const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zpnnezphuxuhznllodhb.supabase.co';
const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkPolicies() {
    console.log('Checking current RLS policies on classes table...\n');

    try {
        // Query pg_policies to see what policies exist
        const { data, error } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'classes');

        if (error) {
            console.log('Could not query pg_policies directly.');
            console.log('Error:', error.message);
            console.log('\nTrying alternative approach...\n');

            // Try to insert a test record with service role (which bypasses RLS)
            const testClass = {
                title: 'Test Class',
                description: 'Testing RLS',
                instructor_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 3600000).toISOString()
            };

            const { data: insertData, error: insertError } = await supabase
                .from('classes')
                .insert(testClass)
                .select();

            if (insertError) {
                console.log('Even service role cannot insert:', insertError.message);
            } else {
                console.log('✓ Service role can insert (RLS bypassed)');
                // Clean up
                await supabase.from('classes').delete().eq('id', insertData[0].id);
                console.log('✓ Test record cleaned up\n');
            }
        } else {
            console.log('Current policies on classes table:');
            console.log(JSON.stringify(data, null, 2));
        }

        // Now let's check what the actual issue is
        console.log('\nThe issue is likely that the INSERT policy still has a conflict.');
        console.log('You need to run this SQL in Supabase Dashboard:\n');
        console.log('---SQL START---');
        console.log(`
-- First, drop ALL existing policies on classes
DROP POLICY IF EXISTS "Classes are viewable by everyone." ON public.classes;
DROP POLICY IF EXISTS "Authenticated users can create classes." ON public.classes;
DROP POLICY IF EXISTS "Teachers can manage classes." ON public.classes;
DROP POLICY IF EXISTS "Teachers can update classes." ON public.classes;
DROP POLICY IF EXISTS "Teachers can delete classes." ON public.classes;

-- Now create clean, non-conflicting policies
CREATE POLICY "Anyone can view classes"
  ON public.classes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create classes"
  ON public.classes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Teachers can update classes"
  ON public.classes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can delete classes"
  ON public.classes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );
    `);
        console.log('---SQL END---');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkPolicies();
