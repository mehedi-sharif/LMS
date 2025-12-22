"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function signUpAction(formData: {
    email: string;
    password: string;
    fullName: string;
    role: string;
}) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Create a Supabase client with the service role key (admin privileges)
    const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    // Create the user and automatically confirm their email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true, // This bypasses email confirmation
        user_metadata: {
            full_name: formData.fullName,
            role: formData.role
        }
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
