"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Edit, Loader2, Plus, Trash2, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addTeacherAction, deleteTeacherAction } from "./actions";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ConfirmModal";
import { EditTeacherDialog } from "./EditTeacherDialog";

export default function AddTeacherPage() {
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [open, setOpen] = useState(false);

    // Edit/Delete state
    const [teacherToEdit, setTeacherToEdit] = useState<any>(null);
    const [teacherToDelete, setTeacherToDelete] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Form state
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [bio, setBio] = useState("");

    const fetchTeachers = async () => {
        setFetching(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "teacher")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setTeachers(data);
        }
        setFetching(false);
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await addTeacherAction({
            fullName,
            email,
            specialization,
            bio
        });

        if (result.success) {
            toast.success(result.message);
            setFullName("");
            setEmail("");
            setSpecialization("");
            setBio("");
            setOpen(false); // Close dialog
            fetchTeachers(); // Refresh the list
        } else {
            toast.error(result.error || "Failed to add teacher");
        }
        setLoading(false);
    };

    const handleConfirmDelete = async (id: string) => {
        setDeleteLoading(true);
        const result = await deleteTeacherAction(id);
        if (result.success) {
            toast.success("Teacher deleted successfully");
            fetchTeachers();
        } else {
            toast.error(result.error || "Failed to delete teacher");
        }
        setDeleteLoading(false);
    };

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Teacher Management</h1>
                    <p className="text-muted-foreground">Add new instructors to your organization and manage their profiles.</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add New Teacher
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Teacher</DialogTitle>
                            <DialogDescription>
                                Enter the details below to create a new teacher account.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="e.g. Dr. Muhammad Abdullah"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="teacher@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input
                                    id="specialization"
                                    placeholder="e.g. Fiqh, Tajweed, Arabic"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Biography</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="A short description of the instructor's background..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    "Create Teacher Account"
                                )}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="glass-panel shadow-md border-primary/10 border-l-4 border-l-purple-500 overflow-hidden">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Organization Teachers</CardTitle>
                                <CardDescription>All instructors currently registered under Darus Almutun.</CardDescription>
                            </div>
                            <Badge variant="outline" className="px-3">
                                {teachers.length} Active
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[250px]">Instructor</TableHead>
                                        <TableHead>Specialization</TableHead>
                                        <TableHead className="hidden md:table-cell">Joined Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetching ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    ) : teachers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                                                No teachers found in the organization.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        teachers.map((teacher) => (
                                            <TableRow key={teacher.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell>
                                                    <Link
                                                        href={`/admin/teacher/${teacher.slug || teacher.id}`}
                                                        className="flex items-center gap-3 group"
                                                    >
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {teacher.full_name?.[0]?.toUpperCase() || <UserCircle className="h-5 w-5" />}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium group-hover:text-primary transition-colors">{teacher.full_name}</span>
                                                            <span className="text-xs text-muted-foreground">{teacher.email}</span>
                                                        </div>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    {teacher.specialization ? (
                                                        <span className="text-sm">{teacher.specialization}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">Not specified</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                                    {new Date(teacher.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => {
                                                                setTeacherToEdit(teacher);
                                                                setIsEditOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <ConfirmModal
                                                            title="Delete Teacher"
                                                            description={`Are you sure you want to delete ${teacher.full_name}? This will permanently remove their account and profile. This action cannot be undone.`}
                                                            onConfirm={() => handleConfirmDelete(teacher.id)}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </ConfirmModal>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <EditTeacherDialog
                teacher={teacherToEdit}
                open={isEditOpen}
                onOpenChange={(open) => {
                    setIsEditOpen(open);
                    if (!open) fetchTeachers();
                }}
            />
        </div>
    );
}
