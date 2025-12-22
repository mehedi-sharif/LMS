import { createClient } from "@/lib/supabase/server";
import { ClassTable } from "./ClassTable";
import { CreateClassButton } from "@/components/CreateClassButton";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
    const supabase = await createClient();

    // Fetch classes
    const { data: classes, error: classesError } = await supabase
        .from("classes")
        .select("*")
        .order("start_time", { ascending: false });

    // Fetch teachers for the select dropdowns
    const { data: teachers, error: teachersError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "teacher")
        .order("full_name");

    const upcomingCount = classes?.filter(c => c.status === 'upcoming').length || 0;
    const liveCount = classes?.filter(c => c.status === 'live').length || 0;

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Manage Classes</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Total of {classes?.length || 0} classes in the system.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-panel border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Upcoming Classes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingCount}</div>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-red-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Radio className="h-4 w-4 animate-pulse" /> Live Now
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{liveCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-panel shadow-md border-primary/10 overflow-hidden">
                <CardContent className="p-0">
                    <ClassTable
                        classes={classes || []}
                        teachers={teachers || []}
                    />
                </CardContent>
            </Card>

            {/* Reuse the existing floating action button for adding new classes */}
            <CreateClassButton />
        </div>
    );
}
