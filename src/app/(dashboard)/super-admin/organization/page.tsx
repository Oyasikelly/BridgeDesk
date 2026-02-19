"use client";

import { useSuperAdmin } from "@/hooks/useSuperAdmin";
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
import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function OrganizationManagement() {
    const { useDepartments, useCreateDepartment } = useSuperAdmin();
    
    const { data: departments, isLoading } = useDepartments();
    const createMutation = useCreateDepartment();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newDept, setNewDept] = useState({ name: "", description: "" });

    const handleCreate = async () => {
        if (!newDept.name.trim()) {
            toast.error("Department name is required");
            return;
        }
        try {
            await createMutation.mutateAsync(newDept);
            toast.success("Department created successfully");
            setNewDept({ name: "", description: "" });
            setIsCreateOpen(false);
        } catch (error) {
            toast.error("Failed to create department");
            console.error(error);
        }
    };

    return (
        <DashboardLayout pageTitle="Organization Management">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Organization</h1>
                        <p className="text-muted-foreground">Manage your departments and organizational structure.</p>
                    </div>
                    
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Add Department</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Department</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Department Name</Label>
                                    <Input 
                                        value={newDept.name} 
                                        onChange={(e) => setNewDept(prev => ({...prev, name: e.target.value}))}
                                        placeholder="e.g. Engineering, Finance"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input 
                                        value={newDept.description} 
                                        onChange={(e) => setNewDept(prev => ({...prev, description: e.target.value}))}
                                        placeholder="Brief description..."
                                    />
                                </div>
                                <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                                    {createMutation.isPending ? "Adding..." : "Add Department"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Departments</CardTitle>
                        <CardDescription>Manage the departments within your organization.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8"><Spinner /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments?.map((dept: any) => (
                                        <TableRow key={dept.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                                {dept.name}
                                            </TableCell>
                                            <TableCell>{dept.description || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {departments?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                No departments found. Create one to get started.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
