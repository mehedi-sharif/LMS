"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') throw new Error("Unauthorized: Admin access required");
    return user;
}

export async function approveUserAction(userId: string) {
    try {
        await checkAdmin();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey);

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ status: 'approved' })
            .eq('id', userId);

        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/add-member");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function rejectUserAction(userId: string) {
    try {
        await checkAdmin();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey);

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ status: 'rejected' })
            .eq('id', userId);

        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/add-member");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function addStudentAction(data: { fullName: string; email: string }) {
    try {
        await checkAdmin();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const tempPassword = Math.random().toString(36).slice(-10);

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                full_name: data.fullName,
                role: 'student'
            }
        });

        if (authError) return { success: false, error: authError.message };

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ status: 'approved' })
            .eq('id', authData.user.id);

        if (profileError) return { success: false, error: "Auth user created but status update failed: " + profileError.message };

        revalidatePath("/admin/add-member");
        return { success: true, message: `Student ${data.fullName} added successfully. Password: ${tempPassword}` };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function updateStudentAction(id: string, data: { fullName: string }) {
    try {
        await checkAdmin();
        const supabase = await createClient();

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: data.fullName
            })
            .eq('id', id);

        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/add-member");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function deleteStudentAction(id: string) {
    try {
        await checkAdmin();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey);

        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/add-member");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
