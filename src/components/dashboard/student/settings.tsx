"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, Key, Moon, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/ui/toggleMode-switch";
import toast from "react-hot-toast";
import Link from "next/link";

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

	const handleSave = async () => {
		if (passwords.newPassword !== passwords.confirmPassword) {
			toast("❌ New passwords do not match!");
			return;
		}

		if (!passwords.currentPassword || !passwords.newPassword) {
			toast("⚠️ Please fill in all password fields.");
			return;
		}

		await handleChangePassword(
			passwords.currentPassword,
			passwords.newPassword
		);
	};

	async function handleChangePassword(
		currentPassword: string,
		newPassword: string
	) {
		try {
			const res = await fetch("/api/auth/change-password", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ currentPassword, newPassword }),
			});

			const data = await res.json();

			if (!res.ok) throw new Error(data.error || "Something went wrong");

			toast(data.message);
		} catch (err: unknown) {
			if (err instanceof Error) {
				toast(err.message);
			} else {
				toast("An unknown error occurred.");
			}
		}
	}

	const handle2FAToggle = async (enabled: boolean) => {
		setTwoFactor(enabled);
		if (enabled) {
			const res = await fetch("/api/auth/enable-2fa", { method: "POST" });
			const data = await res.json();

			if (data.qrCode) {
				toast("📲 Scan the QR code with your authenticator app.");
				console.log("2FA Secret:", data.secret);
				// Optionally show the QR code in a modal or component
			}
		} else {
			toast("2FA disabled.");
		}
	};

	return (
		<motion.div
			className="p-6 bg-gradient-to-br from-background/40 via-background/20 to-background/40 min-h-screen"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6 }}>
			<motion.div
				className="max-w-4xl mx-auto space-y-8"
				initial={{ y: 15, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.7 }}>
				{/* Notification Settings */}
				<Card className="border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<Bell
								className="text-primary"
								size={18}
							/>{" "}
							Notifications
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{[
							{
								label: "Receive complaint status updates",
								state: notifications,
								setter: setNotifications,
							},
							{ label: "Receive system announcements", state: true },
							{
								label: "Allow chat notifications",
								state: notifications,
								setter: setNotifications,
							},
						].map((item, i) => (
							<motion.div
								key={i}
								className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition"
								whileHover={{ scale: 1.01 }}>
								<p className="text-foreground/80">{item.label}</p>
								<Switch
									checked={item.state}
									onCheckedChange={item.setter}
								/>
							</motion.div>
						))}
					</CardContent>
				</Card>

				{/* Security Settings */}
				<Card className="border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<Shield
								className="text-primary"
								size={18}
							/>{" "}
							Security
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<motion.div
							className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition"
							whileHover={{ scale: 1.01 }}>
							<p className="text-foreground/80">
								Enable Two-Factor Authentication
							</p>
							<Switch
								checked={twoFactor}
								onCheckedChange={handle2FAToggle}
							/>
						</motion.div>

						<Separator className="my-4" />

						<h3 className="font-semibold text-foreground/70 flex items-center gap-2">
							<Key size={16} /> Change Password
						</h3>
						<div className="space-y-3">
							{["currentPassword", "newPassword", "confirmPassword"].map(
								(name, index) => (
									<Input
										key={index}
										type="password"
										name={name}
										placeholder={
											name === "currentPassword"
												? "Current Password"
												: name === "newPassword"
												? "New Password"
												: "Confirm New Password"
										}
										value={passwords[name as keyof typeof passwords]}
										onChange={handlePasswordChange}
									/>
								)
							)}
						</div>
						<Button
							className="bg-primary text-white hover:bg-primary/90 mt-2 w-full sm:w-auto"
							onClick={handleSave}>
							Save Changes
						</Button>
					</CardContent>
				</Card>

				{/* Appearance Settings */}
				<Card className="border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<Moon
								className="text-primary"
								size={18}
							/>{" "}
							Appearance
						</CardTitle>
					</CardHeader>
					<CardContent className="flex justify-between items-center p-2 rounded-lg">
						<p className="text-foreground/80">Toggle Dark Mode</p>
						<ModeToggle />
					</CardContent>
				</Card>

				{/* Logout */}
				<motion.div
					whileHover={{ scale: 1.02 }}
					transition={{ type: "spring", stiffness: 200 }}>
					<Card className="border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
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
							<Link href="/logout">
								<Button
									variant="destructive"
									className="w-full">
									Log Out
								</Button>
							</Link>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>
		</motion.div>
	);
}
