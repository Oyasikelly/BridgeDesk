"use client";

import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, User, Clock, Shield } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { format } from "date-fns";

export default function AuditLogs() {
    const { useActivityLogs } = useSuperAdmin();
    const { data: logs, isLoading } = useActivityLogs();

    return (
        <DashboardLayout pageTitle="Audit Logs">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">Monitor system activity and administrative actions.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            System Activity
                        </CardTitle>
                        <CardDescription>A chronological record of actions performed in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8"><Spinner /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>IP Address</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs?.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                                        {log.admin ? <Shield className="w-4 h-4 text-blue-500" /> : <User className="w-4 h-4 text-orange-500" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {log.admin?.fullName || log.student?.fullName || "System"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {log.admin?.email || log.student?.email || "-"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal">
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                                    {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm font-mono text-muted-foreground">
                                                {log.ipAddress || "Internal"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {logs?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No activity logs found.
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
