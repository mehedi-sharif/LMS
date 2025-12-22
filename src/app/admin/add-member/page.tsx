"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Check, X, Clock, Users, Edit, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { approveUserAction, rejectUserAction, deleteStudentAction } from "./actions";
import { EditStudentDialog } from "./EditMemberDialog";
import { AddStudentDialog } from "./AddMemberDialog";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function StudentManagementPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const fetchStudents = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq('role', 'student')
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Failed to fetch students");
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleApprove = async (id: string, name: string) => {
        setActionLoading(id);
        const result = await approveUserAction(id);
        if (result.success) {
            toast.success(`${name} approved successfully`);
            fetchStudents();
        } else {
            toast.error(result.error || "Approval failed");
        }
        setActionLoading(null);
    };

    const handleReject = async (id: string, name: string) => {
        setActionLoading(id);
        const result = await rejectUserAction(id);
        if (result.success) {
            toast.success(`${name} rejected`);
            fetchStudents();
        } else {
            toast.error(result.error || "Rejection failed");
        }
        setActionLoading(null);
    };

    const handleDelete = async (id: string) => {
        const result = await deleteStudentAction(id);
        if (result.success) {
            toast.success("Student deleted successfully");
            fetchStudents();
        } else {
            toast.error(result.error || "Delete failed");
        }
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    };

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
                    <p className="text-muted-foreground">Manage student registrations and site access.</p>
                </div>
                <AddStudentDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-panel border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Pending Approval
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter(u => u.status === 'pending').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-green-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" /> Total Students
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-panel shadow-md border-primary/10 overflow-hidden">
                <CardHeader>
                    <CardTitle>Students</CardTitle>
                    <CardDescription>Manage and approve student portal access.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                            {user.full_name?.[0]?.toUpperCase() || "S"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{user.full_name || "New Student"}</span>
                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        user.status === 'approved' ? 'default' :
                                                            user.status === 'pending' ? 'secondary' : 'destructive'
                                                    }
                                                    className="capitalize text-[10px]"
                                                >
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    {user.status !== 'approved' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleApprove(user.id, user.full_name)}
                                                            disabled={actionLoading === user.id}
                                                            title="Approve Student"
                                                        >
                                                            {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                        </Button>
                                                    )}

                                                    {user.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleReject(user.id, user.full_name)}
                                                            disabled={actionLoading === user.id}
                                                            title="Reject Student"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => handleEdit(user)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    <ConfirmModal
                                                        title="Delete Student"
                                                        description={`Are you sure you want to delete ${user.full_name}? This action cannot be undone.`}
                                                        onConfirm={() => handleDelete(user.id)}
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
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

            <EditStudentDialog
                user={selectedUser}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={fetchStudents}
            />
        </div>
    );
}
