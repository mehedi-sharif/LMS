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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateTeacherAction } from "./actions";

interface EditTeacherDialogProps {
    teacher: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditTeacherDialog({ teacher, open, onOpenChange }: EditTeacherDialogProps) {
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState(teacher?.full_name || "");
    const [specialization, setSpecialization] = useState(teacher?.specialization || "");
    const [bio, setBio] = useState(teacher?.bio || "");

    useEffect(() => {
        if (teacher) {
            setFullName(teacher.full_name || "");
            setSpecialization(teacher.specialization || "");
            setBio(teacher.bio || "");
        }
    }, [teacher]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await updateTeacherAction(teacher.id, {
                fullName,
                specialization,
                bio
            });

            if (result.success) {
                toast.success("Teacher updated successfully");
                onOpenChange(false);
            } else {
                toast.error(result.error || "Failed to update teacher");
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
                    <DialogTitle>Edit Teacher</DialogTitle>
                    <DialogDescription>
                        Update profile information for {teacher?.full_name}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-fullName">Full Name</Label>
                        <Input
                            id="edit-fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-specialization">Specialization</Label>
                        <Input
                            id="edit-specialization"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-bio">Biography</Label>
                        <Textarea
                            id="edit-bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Teacher Profile"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
