"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Filter, Users } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ScheduleClientProps {
    initialClasses: any[];
}

export function ScheduleClient({ initialClasses }: ScheduleClientProps) {
    const [timeFilter, setTimeFilter] = useState("all");
    const [genderFilter, setGenderFilter] = useState("all");

    const now = new Date();

    const filteredClasses = useMemo(() => {
        return initialClasses.filter((cls) => {
            const startTime = new Date(cls.start_time);

            // Time filter
            let timeMatch = true;
            if (timeFilter === "today") {
                timeMatch = isToday(startTime);
            } else if (timeFilter === "tomorrow") {
                timeMatch = isTomorrow(startTime);
            }

            // Gender filter
            let genderMatch = true;
            if (genderFilter !== "all") {
                // Check if class target_gender matches or is 'all'
                genderMatch = cls.target_gender === genderFilter || cls.target_gender === "all";
            }

            return timeMatch && genderMatch;
        });
    }, [initialClasses, timeFilter, genderFilter]);

    const liveClasses = useMemo(() => {
        return initialClasses.filter((cls) => {
            const startTime = new Date(cls.start_time);
            const endTime = cls.end_time ? new Date(cls.end_time) : new Date(startTime.getTime() + 3600000);
            return startTime <= now && endTime >= now;
        });
    }, [initialClasses, now]);

    return (
        <div className="space-y-8">
            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pb-6 border-b-2 border-primary/5">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-background">
                            <SelectValue placeholder="Time filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            <SelectItem value="today">Today's Classes</SelectItem>
                            <SelectItem value="tomorrow">Tomorrow's Classes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-background">
                            <SelectValue placeholder="Gender filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All (Male & Female)</SelectItem>
                            <SelectItem value="male">For Men</SelectItem>
                            <SelectItem value="female">For Women</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Classes Grid */}
            <section className="space-y-6">
                {filteredClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClasses.map((cls) => {
                            const startTime = new Date(cls.start_time);
                            const isLive = liveClasses.some((lc) => lc.id === cls.id);

                            return (
                                <Card key={cls.id} className={cn(
                                    "overflow-hidden group transition-all hover:shadow-md border-primary/5",
                                    isLive ? "border-primary/30 ring-1 ring-primary/20 bg-primary/[0.01]" : ""
                                )}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                                            {cls.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Avatar className="h-5 w-5">
                                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                    {cls.instructor_name?.[0] || 'I'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{cls.instructor_name || 'Organization'}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-4">
                                            {cls.description || "Join us for this insightful session on classical texts and preserving wisdom."}
                                        </p>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-[11px] border-t pt-3 border-primary/5">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(startTime, 'dd, MMM')}
                                                </span>
                                                <span className="text-muted-foreground flex items-center gap-1 font-medium">
                                                    <Clock className="h-3 w-3" />
                                                    {format(startTime, 'h:mm a')} • {cls.duration}m
                                                </span>
                                            </div>

                                            <a
                                                href={cls.meet_link || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn("block w-full", !cls.meet_link && "cursor-not-allowed")}
                                            >
                                                <Button
                                                    className={cn(
                                                        "w-full font-bold shadow-sm transition-all h-9 text-sm",
                                                        cls.meet_link ? "bg-blue-600 hover:bg-blue-700 text-white border-none" : ""
                                                    )}
                                                    disabled={!cls.meet_link}
                                                >
                                                    Join
                                                </Button>
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="border-dashed py-16 bg-muted/20">
                        <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
                            <Filter className="h-10 w-10 text-muted-foreground/30" />
                            <div>
                                <p className="text-muted-foreground text-lg font-medium">No classes match your filters.</p>
                                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters to see more results.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { setTimeFilter('all'); setGenderFilter('all'); }}>
                                Reset Filters
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </section>
        </div>
    );
}
