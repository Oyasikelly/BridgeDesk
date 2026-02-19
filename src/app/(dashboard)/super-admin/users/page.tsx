"use client";

import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, ShieldCheck, GraduationCap, MoreHorizontal } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useState } from "react";

export default function UserManagement() {
    const { useUsers } = useSuperAdmin();
    const [activeTab, setActiveTab] = useState<"ADMIN" | "STUDENT">("ADMIN");
    
    const { data: users, isLoading } = useUsers(activeTab);

    return (
        <DashboardLayout pageTitle="User Management">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">Manage administrators and students in your organization.</p>
                </div>

                <Tabs defaultValue="ADMIN" onValueChange={(val) => setActiveTab(val as any)}>
                    <TabsList>
                        <TabsTrigger value="ADMIN" className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Admins
                        </TabsTrigger>
                        <TabsTrigger value="STUDENT" className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" /> Students
                        </TabsTrigger>
                    </TabsList>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>{activeTab === "ADMIN" ? "Administrators" : "Students"}</CardTitle>
                            <CardDescription>
                                {activeTab === "ADMIN" 
                                    ? "View and manage system administrators." 
                                    : "View and manage registered students."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8"><Spinner /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users?.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="w-4 h-4 text-primary" />
                                                        </div>
                                                        {u.fullName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{u.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{u.role}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={u.status === "Active" ? "default" : "secondary"}>
                                                        {u.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {users?.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No users found in this category.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
