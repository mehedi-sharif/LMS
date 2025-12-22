"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { deleteClass } from "./actions";
import { toast } from "sonner";
import { EditClassDialog } from "./EditClassDialog";
import { ConfirmModal } from "@/components/ConfirmModal";

interface ClassTableProps {
    classes: any[];
    teachers: any[];
}

export function ClassTable({ classes, teachers }: ClassTableProps) {
    const [editingClass, setEditingClass] = useState<any>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const [deleteLoading, setDeleteLoading] = useState(false);
    const handleConfirmDelete = async (id: string) => {
        setDeleteLoading(true);
        const result = await deleteClass(id);
        setDeleteLoading(false);

        if (result.success) {
            toast.success("Class deleted successfully");
        } else {
            toast.error(result.error || "Failed to delete class");
        }
    };
    const handleEdit = (cls: any) => {
        setEditingClass(cls);
        setIsEditDialogOpen(true);
    };

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Class Name</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {classes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No classes found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        classes.map((cls) => (
                            <TableRow key={cls.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{cls.title}</span>
                                        {cls.meet_link && (
                                            <a
                                                href={cls.meet_link}
                                                target="_blank"
                                                className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                                            >
                                                <ExternalLink className="h-3 w-3" /> Meet Link
                                            </a>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{cls.instructor_name || "Unknown"}</TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        {format(new Date(cls.start_time), "MMM d, yyyy")}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {format(new Date(cls.start_time), "h:mm a")} ({cls.duration} min)
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            cls.status === "live" ? "destructive" :
                                                cls.status === "upcoming" ? "secondary" : "outline"
                                        }
                                        className="capitalize"
                                    >
                                        {cls.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(cls)}
                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <ConfirmModal
                                            title="Delete Class"
                                            description={`Are you sure you want to delete "${cls.title}"? This action cannot be undone.`}
                                            onConfirm={() => handleConfirmDelete(cls.id)}
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

            {editingClass && (
                <EditClassDialog
                    cls={editingClass}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    teachers={teachers}
                />
            )}
        </div>
    );
}
