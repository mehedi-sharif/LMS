import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export default function TeacherDashboard() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex">
            {/* Sidebar (Simplified) */}
            <aside className="w-64 border-r border-white/10 bg-card hidden md:flex flex-col p-6 space-y-8">
                <div className="text-xl font-bold tracking-tight text-primary">Instructor Portal</div>
                <nav className="flex flex-col gap-2">
                    <Button variant="secondary" className="justify-start">Dashboard</Button>
                    <Button variant="ghost" className="justify-start">My Courses</Button>
                    <Button variant="ghost" className="justify-start">Student Assignments</Button>
                    <Button variant="ghost" className="justify-start">Schedule</Button>
                </nav>
                <div className="mt-auto">
                    <Link href="/">
                        <Button variant="outline" className="w-full">Sign Out</Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                    <header className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">Good Morning, Shaykh Ahmad</h1>
                            <p className="text-muted-foreground">Manage your classes and students.</p>
                        </div>
                        <Avatar className="h-10 w-10 border border-primary/50">
                            <AvatarFallback className="bg-primary/20 text-primary">SA</AvatarFallback>
                        </Avatar>
                    </header>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button className="h-24 flex flex-col gap-2" variant="outline">
                            <span className="text-2xl">📹</span>
                            Start Live Session
                        </Button>
                        <Button className="h-24 flex flex-col gap-2" variant="outline">
                            <span className="text-2xl">📝</span>
                            Grade Assignments
                        </Button>
                        <Button className="h-24 flex flex-col gap-2" variant="outline">
                            <span className="text-2xl">📢</span>
                            Post Announcement
                        </Button>
                        <Button className="h-24 flex flex-col gap-2" variant="outline">
                            <span className="text-2xl">📅</span>
                            Update Schedule
                        </Button>
                    </div>

                    {/* Recent Activity */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
                        <Card className="glass-panel">
                            <CardContent className="p-0">
                                <div className="divide-y divide-white/10">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-4 flex justify-between items-center hover:bg-white/5">
                                            <div>
                                                <div className="font-semibold">Advanced Fiqh: Class {i}</div>
                                                <div className="text-sm text-muted-foreground">Today, 2:00 PM - 3:30 PM</div>
                                            </div>
                                            <Button size="sm">Manage</Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>
        </div>
    );
}
