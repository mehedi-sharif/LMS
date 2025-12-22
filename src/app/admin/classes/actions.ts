"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteClass(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/classes");
    revalidatePath("/schedule");
    return { success: true };
}

export async function updateClass(id: string, data: any) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("classes")
        .update(data)
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/classes");
    revalidatePath("/schedule");
    return { success: true };
}
