"use client";

import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { useAdmin } from "@/hooks/useAdmin"; // To get list of admins to assign
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CategoriesManagement() {
    const { useCategories, useAssignAdmin, useCreateCategory } = useSuperAdmin();
    // Assuming useAdmin has a way to fetch all admins or we use a new hook
    // Let's assume useAdmin().useAdminsList() or similar exists, or we fetch from API directly here
    // For now, I'll mock the admin list fetch or use a simple fetch since I didn't verify useAdmin list capability fully
    // Actually, I added useStudents to useAdmin, but not getAllAdmins. 
    // I should probably add useAllAdmins to useSuperAdmin.
    
    const { data: categories, isLoading: catsLoading } = useCategories();
    const assignMutation = useAssignAdmin();
    const createMutation = useCreateCategory();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [selectedAdmin, setSelectedAdmin] = useState("");

    // Temporary: We need a way to enlist admins to assign them. 
    // I will use a placeholder or assume we can fetch them.
    // For this implementation, I will assume the user (Super Admin) knows the Admin ID 
    // or we implement a dropdown later. To make it usable now, I'll use a simple Input for Admin ID (or Email if supported).
    // Updating logic to use Text Input for Admin ID for now.

    const handleCreate = async () => {
        try {
            await createMutation.mutateAsync(newCategory);
            toast.success("Category created!");
            setIsCreateOpen(false);
            setNewCategory({ name: "", description: "" });
        } catch (e) {
            toast.error("Failed to create category");
        }
    };

    const handleAssign = async (categoryId: string, adminId: string) => {
        try {
            await assignMutation.mutateAsync({ categoryId, adminId });
            toast.success("Admin assigned successfully!");
        } catch (e) {
            toast.error("Failed to assign admin");
        }
    };

    if (catsLoading) return <div className="p-8 flex justify-center"><Spinner /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
                    <p className="text-muted-foreground">Create categories and assign admins to oversee them.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Category</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Category</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input 
                                    value={newCategory.name} 
                                    onChange={(e) => setNewCategory(prev => ({...prev, name: e.target.value}))}
                                    placeholder="e.g. Housing, Academic"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input 
                                    value={newCategory.description} 
                                    onChange={(e) => setNewCategory(prev => ({...prev, description: e.target.value}))}
                                    placeholder="Brief description..."
                                />
                            </div>
                            <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                                {createMutation.isPending ? "Creating..." : "Create Category"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Categories</CardTitle>
                    <CardDescription>View assigned admins and manage responsibilities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Assigned Admin</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories?.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    <TableCell>{cat.description || "-"}</TableCell>
                                    <TableCell>
                                        {cat.admin ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-600 font-medium">{cat.admin.fullName}</span>
                                            </div>
                                        ) : (
                                            <span className="text-yellow-600 italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {/* Simple input for Admin ID assignment for now */}
                                            <form 
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    // @ts-ignore
                                                    const adminId = e.target.elements.adminId.value;
                                                    handleAssign(cat.id, adminId);
                                                }}
                                                className="flex gap-2"
                                            >
                                                <Input name="adminId" placeholder="Admin ID to assign" className="w-[180px] h-8" />
                                                <Button size="sm" variant="outline" type="submit">Assign</Button>
                                            </form>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No categories found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
