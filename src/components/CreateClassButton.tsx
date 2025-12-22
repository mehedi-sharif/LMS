"use client";

import { useState } from "react";
import { Plus, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export function CreateClassButton() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState("");
    const [title, setTitle] = useState("");
    const [instructorId, setInstructorId] = useState("");
    const [instructorName, setInstructorName] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [meetLink, setMeetLink] = useState("");
    const [targetGender, setTargetGender] = useState("all");
    const [teachers, setTeachers] = useState<any[]>([]);

    useEffect(() => {
        async function fetchTeachers() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name")
                .eq("role", "teacher")
                .order("full_name");

            if (!error && data) {
                setTeachers(data);
            }
        }

        if (open) {
            fetchTeachers();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!date) {
                toast.error("Please select a date for the class");
                setLoading(false);
                return;
            }

            if (!time) {
                toast.error("Please select a time for the class");
                setLoading(false);
                return;
            }

            if (!title.trim()) {
                toast.error("Please enter a class title");
                setLoading(false);
                return;
            }

            if (!instructorId) {
                toast.error("Please select an instructor");
                setLoading(false);
                return;
            }

            if (!duration || parseInt(duration) <= 0) {
                toast.error("Please enter a valid duration");
                setLoading(false);
                return;
            }

            const supabase = createClient();

            // Get current user (to verify auth)
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be logged in to create a class");
                setLoading(false);
                return;
            }

            // Combine date and time
            const [hours, minutes] = time.split(':');
            const startDateTime = new Date(date);
            startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            // Calculate end time based on duration
            const endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + parseInt(duration));

            const { error } = await supabase.from('classes').insert({
                title,
                instructor_name: instructorName,
                description,
                duration: parseInt(duration),
                meet_link: meetLink || null,
                instructor_id: instructorId, // Now using the selected teacher's ID
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                status: 'upcoming',
                target_gender: targetGender
            });

            if (error) {
                toast.error("Failed to create class: " + error.message);
                console.error(error);
            } else {
                toast.success("Class created successfully! 🎉");
                setOpen(false);
                // Reset form
                setTitle("");
                setInstructorId("");
                setInstructorName("");
                setDescription("");
                setDuration("");
                setMeetLink("");
                setDate(undefined);
                setTime("");
                setTargetGender("all");
                // Refresh the page to show the new class
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl z-50 transition-transform hover:scale-110"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Class</DialogTitle>
                    <DialogDescription>
                        Schedule a new live session or lecture.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">

                    <div className="grid gap-2">
                        <Label htmlFor="title">Class Title *</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Introduction to Tajweed"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="instructor">Instructor *</Label>
                        <Select
                            onValueChange={(value) => {
                                setInstructorId(value);
                                const teacher = teachers.find(t => t.id === value);
                                if (teacher) setInstructorName(teacher.full_name);
                            }}
                            value={instructorId}
                        >
                            <SelectTrigger id="instructor">
                                <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                                {teachers.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground italic">No teachers found. Please add teachers first.</div>
                                ) : (
                                    teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                            {teacher.full_name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Brief overview of the session..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="duration">Duration (minutes) *</Label>
                            <Input
                                id="duration"
                                type="number"
                                placeholder="60"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="time">Time *</Label>
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Date *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-50">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="meetLink">Google Meet Link (optional)</Label>
                        <Input
                            id="meetLink"
                            type="url"
                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                            value={meetLink}
                            onChange={(e) => setMeetLink(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="gender">Target Audience</Label>
                        <Select onValueChange={setTargetGender} value={targetGender}>
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Select target gender" />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                                <SelectItem value="all">All (Mixed)</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </form>
                <DialogFooter>
                    <Button type="submit" disabled={loading} onClick={handleSubmit} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Class
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
