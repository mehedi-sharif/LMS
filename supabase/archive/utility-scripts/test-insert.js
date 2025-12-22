const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zpnnezphuxuhznllodhb.supabase.co';
const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testInsert() {
    console.log('Testing class creation with service role key...\n');

    try {
        // First, let's try to insert with the service role (which bypasses RLS)
        const testClass = {
            title: 'Test Class via Service Role',
            description: 'Testing if service role can insert',
            instructor_id: 'f503e712-5a1c-42ef-a105-cca928f38382', // Your first user ID
            start_time: new Date().toISOString(),
            status: 'upcoming'
        };

        console.log('Attempting to insert with service role...');
        const { data, error } = await supabase
            .from('classes')
            .insert(testClass)
            .select();

        if (error) {
            console.error('❌ Service role insert failed:', error.message);
            console.error('Full error:', error);

            console.log('\n⚠️  This means there might be a database constraint issue.');
            console.log('Please run this SQL in your Supabase Dashboard:\n');
            console.log('---SQL---');
            console.log('-- Temporarily disable RLS for testing');
            console.log('ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;');
            console.log('---END SQL---');
        } else {
            console.log('✅ Service role insert succeeded!');
            console.log('Inserted class:', data[0]);

            // Clean up
            await supabase.from('classes').delete().eq('id', data[0].id);
            console.log('✓ Test record cleaned up\n');

            console.log('The issue is with the RLS policies, not the database structure.');
            console.log('\nPlease run this SQL to fix the policies:\n');
            console.log('---SQL---');
            console.log(`
-- Drop all existing policies
DROP POLICY IF EXISTS "Classes are viewable by everyone." ON public.classes;
DROP POLICY IF EXISTS "Authenticated users can create classes." ON public.classes;
DROP POLICY IF EXISTS "Teachers can manage classes." ON public.classes;
DROP POLICY IF EXISTS "Teachers can update classes." ON public.classes;
DROP POLICY IF EXISTS "Teachers can delete classes." ON public.classes;
DROP POLICY IF EXISTS "Anyone can view classes" ON public.classes;
DROP POLICY IF EXISTS "Authenticated users can create classes" ON public.classes;

-- Temporarily disable RLS
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
      `);
            console.log('---END SQL---');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testInsert();
