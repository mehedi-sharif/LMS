import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { ScheduleClient } from "./ScheduleClient";

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
    const supabase = await createClient();

    // Fetch all classes with instructor profiles
    const { data: classes, error } = await supabase
        .from('classes')
        .select(`
            *,
            profiles:instructor_id (
                full_name,
                email
            )
        `)
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching classes:', error);
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Class Schedule</h1>
                        <p className="text-muted-foreground mt-2">Join live sessions or view upcoming lectures.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            {classes?.length || 0} Total Classes
                        </Badge>
                    </div>
                </div>

                {/* Client-side Filtering and Grid */}
                <ScheduleClient initialClasses={classes || []} />
            </div>
        </div>
    );
}
