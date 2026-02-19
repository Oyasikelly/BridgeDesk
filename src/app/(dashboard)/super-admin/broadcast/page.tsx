"use client";

import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Megaphone, Send, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function BroadcastNotifications() {
    const { useSendBroadcast } = useSuperAdmin();
    const sendMutation = useSendBroadcast();

    const [formData, setFormData] = useState({
        title: "",
        message: "",
        type: "INFO",
        target: "ALL"
    });

    const handleSend = async () => {
        if (!formData.title.trim() || !formData.message.trim()) {
            toast.error("Please fill in both title and message");
            return;
        }

        try {
            const res = await sendMutation.mutateAsync(formData);
            toast.success(`Broadcast sent successfully to ${res.recipients} users!`);
            setFormData({
                title: "",
                message: "",
                type: "INFO",
                target: "ALL"
            });
        } catch (error) {
            toast.error("Failed to send broadcast");
            console.error(error);
        }
    };

    return (
        <DashboardLayout pageTitle="Broadcast & Notifications">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Megaphone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Broadcast</h1>
                        <p className="text-muted-foreground">Send notifications to groups of users across the organization.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Compose Broadcast</CardTitle>
                            <CardDescription>Create a new notification that will be sent to selected users.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Notification Type</Label>
                                    <Select 
                                        value={formData.type} 
                                        onValueChange={(val) => setFormData(prev => ({...prev, type: val}))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INFO">Information</SelectItem>
                                            <SelectItem value="WARNING">Warning</SelectItem>
                                            <SelectItem value="SUCCESS">Success</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Audience</Label>
                                    <Select 
                                        value={formData.target} 
                                        onValueChange={(val) => setFormData(prev => ({...prev, target: val}))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Users</SelectItem>
                                            <SelectItem value="STUDENTS">Students Only</SelectItem>
                                            <SelectItem value="ADMINS">Administrators Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input 
                                    value={formData.title} 
                                    onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                                    placeholder="Brief subject of the notification"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Message Content</Label>
                                <Textarea 
                                    value={formData.message} 
                                    onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                                    placeholder="Enter the full message details..."
                                    rows={6}
                                />
                            </div>

                            <Button onClick={handleSend} disabled={sendMutation.isPending} className="w-full md:w-auto px-8">
                                {sendMutation.isPending ? (
                                    "Sending..."
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" /> Send Broadcast
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Preview</CardTitle>
                            <CardDescription>How the notification will appear to users.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`p-4 rounded-lg border flex gap-3 ${
                                formData.type === "WARNING" ? "bg-orange-50 border-orange-200" : 
                                formData.type === "SUCCESS" ? "bg-green-50 border-green-200" : 
                                "bg-blue-50 border-blue-200"
                            }`}>
                                <div className="mt-1">
                                    {formData.type === "WARNING" ? <AlertTriangle className="w-5 h-5 text-orange-600" /> : 
                                     formData.type === "SUCCESS" ? <CheckCircle className="w-5 h-5 text-green-600" /> : 
                                     <Info className="w-5 h-5 text-blue-600" />}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">
                                        {formData.title || "Subject Goes Here"}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {formData.message || "The message content will appear here once you start typing..."}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 space-y-2">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sending To:</h4>
                                <div className="text-sm font-medium">
                                    {formData.target === "ALL" ? "Every active user in the organization" : 
                                     formData.target === "STUDENTS" ? "All registered students only" : 
                                     "All assigned staff and administrators"}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
