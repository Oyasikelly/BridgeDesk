"use client";

import {
	Home,
	BarChart,
	User,
	Settings,
	LogOut,
	Plus,
	SwitchCamera,
	ClipboardList,
	MessageSquare,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/userContext";

type UserRole = "student" | "admin";

export const studentLinks = [
	{ label: "Dashboard", icon: Home, url: "/student" },
	{
		label: "My Complaints",
		icon: ClipboardList,
		url: "/student/my-complaints",
	},
	{
		label: "Chat with Admin",
		icon: MessageSquare,
		url: "/student/chat-with-admin",
	},
	{ label: "Profile", icon: User, url: "/student/profile" },
	{ label: "Settings", icon: Settings, url: "/student/settings" },
];

export const adminLinks = [
	{ label: "Dashboard", icon: Home, url: "/admin" },
	{
		label: "All Complaints",
		icon: ClipboardList,
		url: "/admin/all-complaints",
	},
	{
		label: "Chat with Student",
		icon: MessageSquare,
		url: "/admin/chat-with-student",
	},
	{ label: "Students", icon: Users, url: "/admin/students" },
	{ label: "Analytics", icon: BarChart, url: "/admin/analytics" },
	{ label: "Profile", icon: User, url: "/admin/profile" },
	{ label: "Settings", icon: Settings, url: "/admin/settings" },
];

export function Sidebar() {
	const { userData } = useUser();

	const activeLinks = userData?.role === "ADMIN" ? adminLinks : studentLinks;
	const pathname = usePathname();

	return (
		<aside className="bg-foreground dark:bg-background text-background/90 w-64 min-h-screen flex flex-col justify-between p-4">
			<div>
				{/* Header */}
				<h1 className="text-xl font-bold mb-6 text-background/90 dark:text-foreground">
					BridgeDeck<span className="text-primary">.</span>
				</h1>

				{/* Optional Overview */}
				{userData?.role === "ADMIN" ? (
					<div className="bg-gradient-to-r from-primary/40 to-primary p-4 rounded-xl text-center mb-6">
						<p className="text-sm opacity-80">Active Complaints</p>
						<h2 className="text-2xl font-bold">24</h2>
					</div>
				) : (
					<div className="bg-gradient-to-r from-primary/40 to-primary p-4 rounded-xl text-center mb-6">
						<p className="text-sm opacity-80">Pending Complaints</p>
						<h2 className="text-2xl font-bold">3</h2>
					</div>
				)}

				{/* Navigation */}
				<nav className="space-y-3">
					{activeLinks.map(({ label, icon: Icon, url }) => (
						<Link
							href={url}
							key={label}>
							<Button
								key={label}
								variant="ghost"
								className={`${
									pathname === url ? "bg-primary" : ""
								} w-full justify-start text-white hover:bg-primary transition`}>
								<Icon className="mr-2 h-5 w-5" /> {label}
							</Button>
						</Link>
					))}
				</nav>
			</div>

			{/* Footer Actions */}
			<div className="border-t border-gray-700 mt-6 pt-4 space-y-2">
				<Link href="/logout">
					<Button
						variant="ghost"
						className="w-full justify-start text-destructive hover:bg-destructive">
						<LogOut className="mr-2 h-5 w-5" /> Log Out
					</Button>
				</Link>
			</div>
		</aside>
	);
}
