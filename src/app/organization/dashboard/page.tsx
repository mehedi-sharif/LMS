import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, GraduationCap, DollarSign, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function OrgDashboard() {
    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
                    <p className="text-muted-foreground">Welcome to your administrative control center. Here's what's happening today.</p>
                </header>

                {/* KPIS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="glass-panel border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Users className="h-4 w-4" /> Total Students
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,204</div>
                            <p className="text-[10px] text-green-600 font-medium">+12% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-panel border-l-4 border-l-green-500 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Active Courses
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">48</div>
                            <p className="text-[10px] text-blue-600 font-medium">6 new this week</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-panel border-l-4 border-l-purple-500 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" /> Instructors
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                            <p className="text-[10px] text-muted-foreground italic">2 pending review</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-panel border-l-4 border-l-yellow-500 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> Revenue (Mo)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$12,400</div>
                            <p className="text-[10px] text-yellow-600 font-medium">+8.2% growth</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="glass-panel shadow-sm border-primary/10 h-[300px]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" /> Enrollment Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground italic text-sm">
                            [Interactive chart visualization placeholder]
                        </CardContent>
                    </Card>
                    <Card className="glass-panel shadow-sm border-primary/10 h-[300px]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-green-500" /> System Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm py-2 border-b">
                                <span className="text-muted-foreground">Database Status</span>
                                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Operational</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b">
                                <span className="text-muted-foreground">Auth Service</span>
                                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Operational</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b">
                                <span className="text-muted-foreground">Storage (S3)</span>
                                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">98% Efficient</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
