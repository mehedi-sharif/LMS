import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Mail, BookOpen, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface PageProps {
    params: Promise<{ slug: string }>;
}

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default async function TeacherSlugDetailsPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    try {
        console.log(`[DEBUG] Searching for teacher with slug/id: ${slug}`);

        // 1. Try finding by SLUG
        const { data: teacherBySlug, error: slugError } = await supabase
            .from("profiles")
            .select("*")
            .eq("slug", slug)
            .eq("role", "teacher")
            .maybeSingle();

        if (teacherBySlug) {
            console.log(`[DEBUG] Found by slug: ${teacherBySlug.full_name}`);
            return renderTeacherDetails(teacherBySlug, supabase);
        }

        // 2. Fallback: Try finding by ID
        if (isUUID(slug)) {
            const { data: teacherById, error: idError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", slug)
                .eq("role", "teacher")
                .maybeSingle();

            if (teacherById) {
                console.log(`[DEBUG] Found by ID: ${teacherById.full_name}`);
                return renderTeacherDetails(teacherById, supabase);
            }
        }

        // If we reach here, no teacher found
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold text-red-600">Teacher Not Found</h1>
                <p className="text-muted-foreground">We couldn't find a teacher with identifier: <code className="bg-muted p-1 rounded">{slug}</code></p>
                <div className="text-xs text-left max-w-md mx-auto bg-slate-100 p-4 rounded mt-4">
                    <p className="font-bold border-b mb-2">Debug Info:</p>
                    <pre>{JSON.stringify({
                        receivedSlug: slug,
                        isUUID: isUUID(slug),
                        slugError: slugError?.message || 'No error'
                    }, null, 2)}</pre>
                </div>
                <Link href="/admin/add-teacher">
                    <Button variant="outline" className="mt-4">Back to Teachers</Button>
                </Link>
            </div>
        );
    } catch (err: any) {
        return (
            <div className="p-8 text-center text-red-500">
                <h1 className="text-xl font-bold">Something went wrong</h1>
                <p>{err.message}</p>
            </div>
        );
    }
}

async function renderTeacherDetails(teacher: any, supabase: any) {
    // Fetch classes taught by this teacher using their ID
    const { data: classes } = await supabase
        .from("classes")
        .select("*")
        .eq("instructor_id", teacher.id)
        .order("start_time", { ascending: false });

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
            <Link href="/admin/add-teacher">
                <Button variant="ghost" className="mb-4">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Teachers
                </Button>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card className="md:col-span-1 shadow-md border-primary/10">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24 border-4 border-primary/10">
                                <AvatarFallback className="text-3xl bg-primary/5 text-primary">
                                    {teacher.full_name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="text-2xl">{teacher.full_name}</CardTitle>
                        <CardDescription className="flex items-center justify-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
                            {teacher.email}
                        </CardDescription>
                        {teacher.specialization && (
                            <div className="mt-4">
                                <Badge className="px-4 py-1">{teacher.specialization}</Badge>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">About</h3>
                            <p className="text-sm leading-relaxed">
                                {teacher.bio || "No biography provided for this instructor."}
                            </p>
                        </div>
                        <div className="space-y-2 pt-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Joined {format(new Date(teacher.created_at), 'MMMM yyyy')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics & Classes */}
                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-primary/5 border-primary/10">
                            <CardContent className="p-6 flex flex-col items-center justify-center gap-1">
                                <BookOpen className="h-8 w-8 text-primary mb-2" />
                                <span className="text-2xl font-bold">{classes?.length || 0}</span>
                                <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Classes Taught</span>
                            </CardContent>
                        </Card>
                        <Card className="bg-primary/5 border-primary/10">
                            <CardContent className="p-6 flex flex-col items-center justify-center gap-1">
                                <Clock className="h-8 w-8 text-primary mb-2" />
                                <span className="text-2xl font-bold">--</span>
                                <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Teaching Hours</span>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent Classes</CardTitle>
                            <CardDescription>Latest teaching sessions and lectures.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {classes && classes.length > 0 ? (
                                <div className="space-y-4">
                                    {classes.map((cls: any) => (
                                        <div key={cls.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                                            <div className="space-y-1">
                                                <h4 className="font-medium">{cls.title}</h4>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(cls.start_time), 'MMM d, yyyy')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Badge variant="outline" className="text-[10px] h-4">
                                                            {cls.status}
                                                        </Badge>
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">View</Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground italic">
                                    No classes recorded for this teacher yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
