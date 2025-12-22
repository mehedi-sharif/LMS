const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPolicies() {
    console.log('Attempting to fix RLS policies...');

    // Note: We can't drop/create policies with the anon key
    // We need to use the service role key or run SQL directly

    console.error('ERROR: Cannot modify RLS policies with the anon key.');
    console.error('You need to run the SQL in the Supabase Dashboard SQL Editor.');
    console.error('\nSQL to run:');
    console.error('---');
    console.error(`
DROP POLICY IF EXISTS "Teachers can manage classes." ON public.classes;

CREATE POLICY "Teachers can update classes."
  ON public.classes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can delete classes."
  ON public.classes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );
  `);
    console.error('---');
}

fixPolicies();
