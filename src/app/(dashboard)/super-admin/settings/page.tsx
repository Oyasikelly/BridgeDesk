"use client";

import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Settings, Building, Mail, Phone, MapPin, Save } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function SuperAdminSettings() {
    const { useOrgDetails, useUpdateOrg } = useSuperAdmin();
    const { data: org, isLoading } = useOrgDetails();
    const updateMutation = useUpdateOrg();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: ""
    });

    useEffect(() => {
        if (org) {
            setFormData({
                name: org.name || "",
                email: org.email || "",
                phone: org.phone || "",
                address: org.address || ""
            });
        }
    }, [org]);

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync(formData);
            toast.success("Settings updated successfully");
        } catch (error) {
            toast.error("Failed to update settings");
            console.error(error);
        }
    };

    if (isLoading) return (
        <DashboardLayout pageTitle="Settings">
            <div className="p-8 flex justify-center"><Spinner size="lg" /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout pageTitle="Settings">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">Manage your organization&apos;s global configuration.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-6 md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Organization Profile</CardTitle>
                                <CardDescription>Update your organization&apos;s public information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Organization Name</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="name"
                                            className="pl-10"
                                            value={formData.name}
                                            onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Contact Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="email"
                                                className="pl-10"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(p => ({...p, email: e.target.value}))}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Contact Phone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="phone"
                                                className="pl-10"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(p => ({...p, phone: e.target.value}))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Physical Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="address"
                                            className="pl-10"
                                            value={formData.address}
                                            onChange={(e) => setFormData(p => ({...p, address: e.target.value}))}
                                        />
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleSave} 
                                    disabled={updateMutation.isPending}
                                    className="flex items-center gap-2"
                                >
                                    {updateMutation.isPending ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-destructive/20 bg-destructive/5">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription>Actions that cannot be undone.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="destructive">Deactivate Organization</Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                    This will suspend all users and access for this organization instantly.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Org ID:</span>
                                    <span className="font-mono text-xs">{org?.id}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className={org?.isActive ? "text-green-600 font-medium" : "text-red-600"}>
                                        {org?.isActive ? "Active" : "Suspended"}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Platform Version:</span>
                                    <span>v1.2.4-stable</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
