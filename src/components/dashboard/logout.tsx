"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { LogOut, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
export default function LogoutPage({
	userType = "student",
}: {
	userType?: "student" | "admin";
}) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const handleLogout = () => {
		// ✅ Simulate logout logic (replace with your real logout function)
		setTimeout(() => {
			setOpen(false);
			router.push("/login");
		}, 1000);
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-background">
			<Card className="w-full max-w-md shadow-md border border-primary/20 bg-primary-foreground">
				<CardHeader className="flex flex-col items-center gap-3">
					<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
						{userType === "admin" ? (
							<Shield className="text-primary h-8 w-8" />
						) : (
							<User className="text-primary h-8 w-8" />
						)}
					</div>
					<CardTitle className="text-2xl font-semibold text-foreground">
						{userType === "admin" ? "Admin Logout" : "Student Logout"}
					</CardTitle>
				</CardHeader>

				<CardContent className="text-center space-y-4">
					<p className="text-gray-600">
						Are you sure you want to log out of your{" "}
						<span className="font-semibold text-primary">{userType}</span>{" "}
						account?
					</p>

					<Button
						onClick={() => setOpen(true)}
						className="bg-primary hover:bg-primary/90 text-white w-full flex items-center justify-center gap-2">
						<LogOut className="h-4 w-4" /> Log Out
					</Button>
				</CardContent>
			</Card>

			{/* Modal Drawer */}
			<Dialog
				open={open}
				onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
							<LogOut className="h-5 w-5 text-primary" /> Confirm Logout
						</DialogTitle>
						<DialogDescription className="text-gray-500">
							You are about to log out of your {userType} account. Make sure you
							have saved your progress or pending tasks.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter className="flex justify-end gap-3 mt-4">
						<Button
							variant="outline"
							onClick={() => setOpen(false)}
							className="border-gray-300 hover:bg-gray-100">
							Cancel
						</Button>
						<Button
							onClick={handleLogout}
							className="bg-primary hover:bg-primary/90 text-white">
							Yes, Log Out
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
