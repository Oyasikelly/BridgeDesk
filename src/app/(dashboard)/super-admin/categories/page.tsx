"use client";

import { useSuperAdmin, Category } from "@/hooks/useSuperAdmin";
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
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function CategoriesManagement() {
    const { useCategories, useAssignAdmin, useCreateCategory, useAllAdmins } = useSuperAdmin();
    
    const { data: categories, isLoading: catsLoading } = useCategories();
    const { data: admins, isLoading: adminsLoading } = useAllAdmins();
    const assignMutation = useAssignAdmin();
    const createMutation = useCreateCategory();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });

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
        if (!adminId) return;
        try {
            await assignMutation.mutateAsync({ categoryId, adminId });
            toast.success("Admin assigned successfully!");
        } catch (e) {
            toast.error("Failed to assign admin");
        }
    };

    const handleUnassign = async (categoryId: string, adminId: string) => {
        try {
            // @ts-expect-error - Action property added to PATCH
            await assignMutation.mutateAsync({ categoryId, adminId, action: "disconnect" });
            toast.success("Admin unassigned!");
        } catch (e) {
            toast.error("Failed to unassign admin");
        }
    };

    if (catsLoading || adminsLoading) return (
        <DashboardLayout pageTitle="Category Management">
            <div className="p-8 flex justify-center"><Spinner /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout pageTitle="Category Management">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
                        <p className="text-muted-foreground">Create categories and assign multiple admins to oversee them.</p>
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
                                    <TableHead>Assigned Admins</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories?.map((cat: Category) => (
                                    <TableRow key={cat.id}>
                                        <TableCell className="font-medium">{cat.name}</TableCell>
                                        <TableCell>{cat.description || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                {cat.admin && cat.admin.length > 0 ? (
                                                    cat.admin.map((admin: any) => (
                                                        <div key={admin.id} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                                            {admin.fullName}
                                                            <button 
                                                                onClick={() => handleUnassign(cat.id, admin.id)}
                                                                className="hover:text-destructive transition-colors"
                                                                title="Unassign"
                                                            >
                                                                <Plus className="w-3 h-3 rotate-45" />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-yellow-600 italic text-sm">No admins assigned</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Select onValueChange={(val) => handleAssign(cat.id, val)}>
                                                    <SelectTrigger className="w-[180px] h-8">
                                                        <SelectValue placeholder="Assign Admin" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {admins?.filter((a: any) => !cat.admin?.some((ca: any) => ca.id === a.id)).map((admin: any) => (
                                                            <SelectItem key={admin.id} value={admin.id}>
                                                                {admin.fullName}
                                                            </SelectItem>
                                                        ))}
                                                        {admins?.filter(a => !cat.admin?.some(ca => ca.id === a.id)).length === 0 && (
                                                            <p className="p-2 text-xs text-muted-foreground text-center">All admins assigned</p>
                                                        )}
                                                    </SelectContent>
                                                </Select>
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
        </DashboardLayout>
    );
}
