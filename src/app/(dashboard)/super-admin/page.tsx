"use client";

import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Users, MessageSquare, AlertCircle, Building2, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

export default function SuperAdminDashboard() {
    const { useOrgStats } = useSuperAdmin();
    const { data: stats, isLoading, error } = useOrgStats();

    if (isLoading) return (
        <DashboardLayout pageTitle="Super Admin Dashboard">
            <div className="p-8 flex justify-center"><Spinner size="lg" /></div>
        </DashboardLayout>
    );
    
    if (error) return (
        <DashboardLayout pageTitle="Super Admin Dashboard">
            <Alert variant="destructive"><AlertDescription>Failed to load dashboard stats.</AlertDescription></Alert>
        </DashboardLayout>
    );

    const chartData = [
        { name: "Complaints", value: stats?.totalComplaints || 0 },
        { name: "Active", value: stats?.activeComplaints || 0 },
        { name: "Students", value: stats?.totalStudents || 0 },
        { name: "Admins", value: stats?.totalAdmins || 0 },
    ];

    return (
        <DashboardLayout pageTitle="Super Admin Dashboard">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organization Overview</h1>
                    <p className="text-muted-foreground">Manage your organization&apos;s performance and structure.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalComplaints}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.activeComplaints}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalStudents}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Admins Staff</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalAdmins}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                {stats && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Complaint Status Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.complaintStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.complaintStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Complaints Trend</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="complaints" stroke="#2563eb" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Departmental Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.departmentData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="complaints" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
