"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, User, Key, Moon, LogOut, Save } from "lucide-react";
import { ModeToggle } from "@/components/ui/toggleMode-switch";

export default function StudentSettingsPage() {
	const [notifications, setNotifications] = useState(true);
	const [twoFactor, setTwoFactor] = useState(false);
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
		alert("Settings saved successfully!");
	};

	return (
		<div className="p-6 bg-background/30 min-h-screen">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Profile Settings */}
				<Card className="border border-primary-foreground shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<User
								size={18}
								className="text-primary"
							/>{" "}
							Account Preferences
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-foreground/80">
								Display Name
							</label>
							<Input
								placeholder="Kelly Bright"
								className="mt-1"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground/80">
								Email Address
							</label>
							<Input
								type="email"
								placeholder="kellybright@student.fupre.edu.ng"
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

				{/* Notification Settings */}
				<Card className="border border-primary-foreground shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<Bell
								size={18}
								className="text-primary"
							/>{" "}
							Notifications
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex justify-between items-center">
							<p className="text-foreground/80">
								Receive complaint status updates
							</p>
							<Switch
								checked={notifications}
								onCheckedChange={setNotifications}
							/>
						</div>
						<div className="flex justify-between items-center">
							<p className="text-foreground/80">Receive system announcements</p>
							<Switch checked />
						</div>
						<div className="flex justify-between items-center">
							<p className="text-foreground/80">Allow chat notifications</p>
							<Switch checked={notifications} />
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
							/>{" "}
							Security
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

				{/* Appearance Settings */}
				<Card className="border border-primary-foreground shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<Moon
								size={18}
								className="text-primary"
							/>{" "}
							Appearance
						</CardTitle>
					</CardHeader>
					<CardContent className="flex justify-between items-center">
						<p className="text-foreground/80">Enable Dark Mode</p>
						<ModeToggle />
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
							Log out of your account on this device. You’ll need to log in
							again to access your complaints or chats.
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
