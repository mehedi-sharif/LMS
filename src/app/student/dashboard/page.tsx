"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Calendar, Video, LogOut, LayoutDashboard, FileText, GraduationCap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function StudentDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                setProfile(profileData || { email: user.email });
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const displayName = profile?.full_name || profile?.email?.split('@')[0] || "User";
    const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex">
            {/* Sidebar (Premium Style) */}
            <aside className="w-64 border-r border-white/10 bg-card hidden md:flex flex-col p-6 space-y-8">
                <div className="text-xl font-bold tracking-tight text-gradient">Darus Almutun</div>
                <nav className="flex flex-col gap-2">
                    <Button variant="secondary" className="justify-start gap-2">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2">
                        <BookOpen className="h-4 w-4" /> My Classes
                    </Button>
                    <Link href="/student/settings" className="w-full">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Settings className="h-4 w-4" /> Settings
                        </Button>
                    </Link>
                </nav>
                <div className="mt-auto">
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={async () => {
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            window.location.href = "/auth";
                        }}
                    >
                        <LogOut className="h-4 w-4" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                    <header className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {displayName}!</h1>
                            <p className="text-muted-foreground flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4" /> Here is your learning summary.
                            </p>
                        </div>
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20 p-0.5">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                        </Avatar>
                    </header>


                    {/* Today's Schedule (Standardized 3-Grid) */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
                                <Video className="h-5 w-5 text-red-500" /> Today's Schedule
                            </h2>
                            <Button variant="link" className="text-sm font-medium text-primary p-0 h-auto">View Calendar</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Live Class Card */}
                            <Card className="glass-panel border-l-4 border-l-red-500 shadow-sm transition-all hover:shadow-md group cursor-pointer h-full flex flex-col">
                                <CardHeader className="py-4 pb-2">
                                    <CardTitle className="text-[10px] font-bold text-muted-foreground flex items-center justify-between gap-2 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Video className="h-3.5 w-3.5 text-red-500 animate-pulse group-hover:scale-110 transition-transform" />
                                            <span className="text-red-600">Live Now</span>
                                        </div>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 02:30 PM</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <div className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">Fiqh of Transactions</div>
                                        <p className="text-xs text-muted-foreground font-medium">Shaykh Ahmad Abdullah</p>
                                    </div>
                                    <div className="pt-3 border-t flex items-center justify-between gap-2">
                                        <span className="text-[10px] text-muted-foreground font-medium truncate">Room 101-Virtual</span>
                                        <Button size="sm" className="h-7 px-3 text-[10px] bg-red-600 hover:bg-red-700 shadow-sm transition-transform active:scale-95 shrink-0">Join Now</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Upcoming Class Card 1 */}
                            <Card className="glass-panel border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md group cursor-pointer h-full flex flex-col">
                                <CardHeader className="py-4 pb-2">
                                    <CardTitle className="text-[10px] font-bold text-muted-foreground flex items-center justify-between gap-2 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-3.5 w-3.5 group-hover:text-blue-500 group-hover:scale-110 transition-transform" />
                                            <span>Starts Soon</span>
                                        </div>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 04:30 PM</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <div className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">Intermediate Arabic</div>
                                        <p className="text-xs text-muted-foreground font-medium">Ustadh Salman Faris</p>
                                    </div>
                                    <div className="pt-3 border-t flex items-center justify-between gap-2">
                                        <span className="text-[10px] text-muted-foreground font-medium truncate">Room 202-Virtual</span>
                                        <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] border-blue-200 text-blue-600 hover:bg-blue-50 shrink-0">Details</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Upcoming Class Card 2 */}
                            <Card className="glass-panel border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md group cursor-pointer h-full flex flex-col">
                                <CardHeader className="py-4 pb-2">
                                    <CardTitle className="text-[10px] font-bold text-muted-foreground flex items-center justify-between gap-2 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-3.5 w-3.5 group-hover:text-blue-500 group-hover:scale-110 transition-transform" />
                                            <span>Evening</span>
                                        </div>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 06:15 PM</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <div className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">History of Islam</div>
                                        <p className="text-xs text-muted-foreground font-medium">Dr. Khalid Mansour</p>
                                    </div>
                                    <div className="pt-3 border-t flex items-center justify-between gap-2">
                                        <span className="text-[10px] text-muted-foreground font-medium truncate">Room 305-Virtual</span>
                                        <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] border-blue-200 text-blue-600 hover:bg-blue-50 shrink-0">Details</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
