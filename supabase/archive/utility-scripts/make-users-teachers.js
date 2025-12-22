const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zpnnezphuxuhznllodhb.supabase.co';
const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function makeAllUsersTeachers() {
    console.log('Updating all users to have teacher role...\n');

    try {
        // Get all profiles
        const { data: profiles, error: fetchError } = await supabase
            .from('profiles')
            .select('*');

        if (fetchError) {
            console.error('Error fetching profiles:', fetchError);
            return false;
        }

        console.log(`Found ${profiles.length} profile(s)\n`);

        if (profiles.length === 0) {
            console.log('No profiles found. Users need to sign up first.');
            return false;
        }

        // Update all profiles to teacher role
        const { data, error } = await supabase
            .from('profiles')
            .update({ role: 'teacher' })
            .neq('role', 'teacher'); // Only update non-teachers

        if (error) {
            console.error('Error updating profiles:', error);
            return false;
        }

        console.log('✓ All users updated to teacher role!');

        // Show updated profiles
        const { data: updated } = await supabase
            .from('profiles')
            .select('email, role');

        console.log('\nCurrent profiles:');
        updated.forEach(p => {
            console.log(`  - ${p.email}: ${p.role}`);
        });

        return true;
    } catch (error) {
        console.error('Error:', error.message);
        return false;
    }
}

makeAllUsersTeachers().then(success => {
    if (success) {
        console.log('\n✅ Done! You can now create classes.');
        process.exit(0);
    } else {
        console.log('\n⚠️  Could not update user roles.');
        console.log('Make sure you have signed up in the app first.');
        process.exit(1);
    }
});
