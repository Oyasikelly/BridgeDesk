"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Bell,
	Shield,
	UserCog,
	Key,
	Moon,
	Database,
	Globe,
	LogOut,
	Save,
	Settings,
	Server,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/toggleMode-switch";

export default function AdminSettingsPage() {
	const [systemAlerts, setSystemAlerts] = useState(true);
	const [twoFactor, setTwoFactor] = useState(false);
	const [maintenanceMode, setMaintenanceMode] = useState(false);
	const [autoBackup, setAutoBackup] = useState(true);
	const [passwords, setPasswords] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setPasswords((prev) => ({ ...prev, [name]: value }));
	};

	const handleSave = () => {
		alert("Admin settings saved successfully!");
	};

	return (
		<div className="p-6 bg-background/30 min-h-screen">
			<div className="max-w-5xl mx-auto space-y-8">
				{/* Admin Profile Settings */}
				<Card className="border border-primary-foreground shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<UserCog
								size={18}
								className="text-primary"
							/>
							Admin Account
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-foreground/80">
								Full Name
							</label>
							<Input
								placeholder="Admin Name"
								className="mt-1"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground/80">
								Email Address
							</label>
							<Input
								type="email"
								placeholder="admin@complaints-system.edu.ng"
								className="mt-1"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground/80">
								Phone Number
							</label>
							<Input
								type="tel"
								placeholder="+234 800 000 0000"
								className="mt-1"
							/>
						</div>
						<Button className="bg-primary text-white hover:bg-primary/90">
							<Save
								size={16}
								className="mr-2"
							/>{" "}
							Save Profile
						</Button>
					</CardContent>
				</Card>

				{/* System Settings */}
				<Card className="border border-primary-foreground shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<Server
								size={18}
								className="text-primary"
							/>
							System Controls
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex justify-between items-center">
							<p className="text-foreground/80">
								Activate Maintenance Mode (temporarily disable student access)
							</p>
							<Switch
								checked={maintenanceMode}
								onCheckedChange={setMaintenanceMode}
							/>
						</div>
						<div className="flex justify-between items-center">
							<p className="text-foreground/80">
								Enable Automatic System Backups
							</p>
							<Switch
								checked={autoBackup}
								onCheckedChange={setAutoBackup}
							/>
						</div>
						<div className="flex justify-between items-center">
							<p className="text-foreground/80">
								Allow Admins to Edit or Delete Complaints
							</p>
							<Switch checked />
						</div>
						<Button className="bg-primary text-white hover:bg-primary/90 mt-2">
							<Save
								size={16}
								className="mr-2"
							/>{" "}
							Update System
						</Button>
					</CardContent>
				</Card>

				{/* Notification & Alerts */}
				<Card className="border border-primary-foreground shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<Bell
								size={18}
								className="text-primary"
							/>
							Notifications & Alerts
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex justify-between items-center">
							<p className="text-foreground/80">
								System error or downtime alerts
							</p>
							<Switch
								checked={systemAlerts}
								onCheckedChange={setSystemAlerts}
							/>
						</div>
						<div className="flex justify-between items-center">
							<p className="text-foreground/80">
								New student complaints notification
							</p>
							<Switch checked />
						</div>
						<div className="flex justify-between items-center">
							<p className="text-foreground/80">Weekly system report summary</p>
							<Switch checked={systemAlerts} />
						</div>
					</CardContent>
				</Card>

				{/* Security Settings */}
				<Card className="border border-primary-foreground shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<Shield
								size={18}
								className="text-primary"
							/>
							Security & Authentication
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex justify-between items-center">
							<p className="text-foreground/80">
								Enable Two-Factor Authentication
							</p>
							<Switch
								checked={twoFactor}
								onCheckedChange={setTwoFactor}
							/>
						</div>
						<Separator className="my-4" />
						<h3 className="font-semibold text-foreground/70 flex items-center gap-2">
							<Key size={16} /> Change Password
						</h3>
						<div className="space-y-3">
							<Input
								type="password"
								name="currentPassword"
								placeholder="Current Password"
								value={passwords.currentPassword}
								onChange={handlePasswordChange}
							/>
							<Input
								type="password"
								name="newPassword"
								placeholder="New Password"
								value={passwords.newPassword}
								onChange={handlePasswordChange}
							/>
							<Input
								type="password"
								name="confirmPassword"
								placeholder="Confirm New Password"
								value={passwords.confirmPassword}
								onChange={handlePasswordChange}
							/>
						</div>
						<Button
							className="bg-primary text-white hover:bg-primary/90 mt-2"
							onClick={handleSave}>
							Update Password
						</Button>
					</CardContent>
				</Card>

				{/* System Appearance */}
				<Card className="border border-primary-foreground shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<Moon
								size={18}
								className="text-primary"
							/>
							Appearance
						</CardTitle>
					</CardHeader>
					<CardContent className="flex justify-between items-center">
						<p className="text-foreground/80">Enable Dark Mode</p>
						<ModeToggle />
					</CardContent>
				</Card>

				{/* Database Management */}
				<Card className="border border-primary-foreground shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<Database
								size={18}
								className="text-primary"
							/>
							Database Management
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-foreground/80">
							Manage complaint data, export reports, or reset the system.
						</p>
						<div className="flex flex-wrap gap-3">
							<Button variant="outline">Export Complaints CSV</Button>
							<Button variant="outline">Backup Database</Button>
							<Button variant="destructive">Reset Database</Button>
						</div>
					</CardContent>
				</Card>

				{/* Logout */}
				<Card className="border border-primary-foreground shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold text-destructive">
							<LogOut size={18} /> Log Out
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground/80 mb-4">
							Log out of your admin account. You’ll need to log in again to
							access system functionalities.
						</p>
						<Button
							variant="destructive"
							className="w-full">
							Log Out
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
