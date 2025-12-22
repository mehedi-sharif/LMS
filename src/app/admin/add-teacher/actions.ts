"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { slugify, generateShortId } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

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

export async function addTeacherAction(formData: {
    fullName: string;
    email: string;
    specialization: string;
    bio: string;
}) {
    try {
        await checkAdmin();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createAdminClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const tempPassword = Math.random().toString(36).slice(-10);

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: formData.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                full_name: formData.fullName,
                role: 'teacher'
            }
        });

        if (authError) {
            return { success: false, error: authError.message };
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: formData.fullName,
                bio: formData.bio,
                specialization: formData.specialization,
                slug: `${slugify(formData.fullName)}-${generateShortId()}`,
                status: 'approved'
            })
            .eq('id', authData.user.id);

        if (profileError) {
            return { success: false, error: "Auth user created but profile update failed: " + profileError.message };
        }

        revalidatePath("/admin/add-teacher");
        return {
            success: true,
            message: `Teacher ${formData.fullName} added successfully.`
        };

    } catch (err: any) {
        return { success: false, error: err.message || "An unexpected error occurred" };
    }
}

export async function updateTeacherAction(id: string, formData: {
    fullName: string;
    specialization: string;
    bio: string;
}) {
    try {
        await checkAdmin();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createAdminClient(supabaseUrl, supabaseServiceKey);

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: formData.fullName,
                specialization: formData.specialization,
                bio: formData.bio,
                slug: `${slugify(formData.fullName)}-${id.substring(0, 4)}`
            })
            .eq('id', id);

        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/add-teacher");
        return { success: true, message: "Teacher updated successfully" };
    } catch (err: any) {
        return { success: false, error: err.message || "An unexpected error occurred" };
    }
}

export async function deleteTeacherAction(id: string) {
    try {
        await checkAdmin();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createAdminClient(supabaseUrl, supabaseServiceKey);

        // Check if teacher has any active or upcoming classes
        const { data: activeClasses, error: classesError } = await supabase
            .from('classes')
            .select('id, title')
            .eq('instructor_id', id)
            .in('status', ['upcoming', 'live']);

        if (classesError) {
            return { success: false, error: "Error checking teacher's classes: " + classesError.message };
        }

        if (activeClasses && activeClasses.length > 0) {
            return {
                success: false,
                error: `Cannot delete teacher. They have ${activeClasses.length} active or upcoming classes (e.g., "${activeClasses[0].title}"). Please reassign or end these classes first.`
            };
        }

        // Delete from Auth (this will cascade to profiles)
        const { error } = await supabase.auth.admin.deleteUser(id);

        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/add-teacher");
        return { success: true, message: "Teacher deleted successfully" };
    } catch (err: any) {
        return { success: false, error: err.message || "An unexpected error occurred" };
    }
}
