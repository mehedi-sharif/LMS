const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zpnnezphuxuhznllodhb.supabase.co';
const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkUsersAndProfiles() {
    console.log('Checking users and profiles...\n');

    try {
        // Check auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('Error fetching auth users:', authError.message);
        } else {
            console.log(`Found ${authData.users.length} auth user(s):`);
            authData.users.forEach(user => {
                console.log(`  - ${user.email} (ID: ${user.id})`);
            });
        }

        console.log('');

        // Check profiles
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*');

        if (profileError) {
            console.error('Error fetching profiles:', profileError.message);
        } else {
            console.log(`Found ${profiles.length} profile(s):`);
            profiles.forEach(profile => {
                console.log(`  - ${profile.email} (ID: ${profile.id}, Role: ${profile.role})`);
            });
        }

        // If there are auth users but no profiles, the trigger might not have fired
        if (authData && authData.users.length > 0 && profiles && profiles.length === 0) {
            console.log('\n⚠️  WARNING: You have auth users but no profiles!');
            console.log('The trigger might not have fired. Creating profiles manually...\n');

            for (const user of authData.users) {
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || null,
                        role: 'teacher' // Make them teachers so they can create classes
                    });

                if (insertError) {
                    console.error(`Failed to create profile for ${user.email}:`, insertError.message);
                } else {
                    console.log(`✓ Created profile for ${user.email} with teacher role`);
                }
            }
        }

        console.log('\n✅ Check complete!');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkUsersAndProfiles();
