"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { updateClass } from "./actions";

interface EditClassDialogProps {
    cls: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teachers: any[];
}

export function EditClassDialog({ cls, open, onOpenChange, teachers }: EditClassDialogProps) {
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date | undefined>(cls ? new Date(cls.start_time) : undefined);
    const [time, setTime] = useState(cls ? format(new Date(cls.start_time), "HH:mm") : "");
    const [title, setTitle] = useState(cls?.title || "");
    const [instructorId, setInstructorId] = useState(cls?.instructor_id || "");
    const [instructorName, setInstructorName] = useState(cls?.instructor_name || "");
    const [description, setDescription] = useState(cls?.description || "");
    const [duration, setDuration] = useState(cls?.duration?.toString() || "");
    const [meetLink, setMeetLink] = useState(cls?.meet_link || "");
    const [status, setStatus] = useState(cls?.status || "upcoming");
    const [targetGender, setTargetGender] = useState(cls?.target_gender || "all");

    // Update state when cls changes
    useEffect(() => {
        if (cls) {
            setTitle(cls.title || "");
            setInstructorId(cls.instructor_id || "");
            setInstructorName(cls.instructor_name || "");
            setDescription(cls.description || "");
            setDuration(cls.duration?.toString() || "");
            setMeetLink(cls.meet_link || "");
            setStatus(cls.status || "upcoming");
            setTargetGender(cls.target_gender || "all");
            const d = new Date(cls.start_time);
            setDate(d);
            setTime(format(d, "HH:mm"));
        }
    }, [cls]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!date) {
                toast.error("Please select a date");
                setLoading(false);
                return;
            }

            const [hours, minutes] = time.split(':');
            const startDateTime = new Date(date);
            startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + parseInt(duration));

            const result = await updateClass(cls.id, {
                title,
                instructor_name: instructorName,
                instructor_id: instructorId,
                description,
                duration: parseInt(duration),
                meet_link: meetLink || null,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                status,
                target_gender: targetGender
            });

            if (result.success) {
                toast.success("Class updated successfully");
                onOpenChange(false);
            } else {
                toast.error(result.error || "Failed to update class");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Class</DialogTitle>
                    <DialogDescription>
                        Update class details and schedule.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-title">Class Title *</Label>
                        <Input
                            id="edit-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-instructor">Instructor *</Label>
                        <Select
                            onValueChange={(value) => {
                                setInstructorId(value);
                                const teacher = teachers.find(t => t.id === value);
                                if (teacher) setInstructorName(teacher.full_name);
                            }}
                            value={instructorId}
                        >
                            <SelectTrigger id="edit-instructor">
                                <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                                {teachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id}>
                                        {teacher.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-status">Status</Label>
                        <Select onValueChange={setStatus} value={status}>
                            <SelectTrigger id="edit-status">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="live">Live</SelectItem>
                                <SelectItem value="ended">Ended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-duration">Duration (mins)</Label>
                            <Input
                                id="edit-duration"
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-time">Time</Label>
                            <Input
                                id="edit-time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Date</Label>
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
                        <Label htmlFor="edit-meetLink">Meet Link</Label>
                        <Input
                            id="edit-meetLink"
                            type="url"
                            value={meetLink}
                            onChange={(e) => setMeetLink(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-gender">Target Audience</Label>
                        <Select onValueChange={setTargetGender} value={targetGender}>
                            <SelectTrigger id="edit-gender">
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
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Class"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
