"use client";

import {
	Home,
	BarChart,
	User,
	Settings,
	LogOut,
	ClipboardList,
	MessageSquare,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/userContext";
import { Spinner } from "../ui/spinner";
import { useComplaints } from "@/hooks/useComplaintsApi";
import { useAdmin } from "@/hooks/useAdmin";

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

// ... inside Sidebar
export function Sidebar() {
	const { userData } = useUser();
    const { useAdminComplaints } = useAdmin();
    
    // Fetch stats for sidebar badges
    // Student: Use useComplaints
    const { data: studentData, isLoading: studentLoading } = useComplaints({
        studentId: userData?.student?.id,
    });
    const pendingComplaints = studentData?.pendingComplaints || 0;
    
    // Admin: Use useAdminComplaints
    const { data: adminStats, isLoading: adminLoading } = useAdminComplaints(userData?.admin?.id);
    const totalComplaints = adminStats?.complaints || []; 

	const activeLinks = userData?.role === "ADMIN" ? adminLinks : studentLinks;
	const pathname = usePathname();
    
    const loading = studentLoading || adminLoading;

	if (!userData) {
		return (
			<aside className="w-64 min-h-screen flex items-center justify-center">
				<Spinner
					size="sm"
					color="primary"
				/>
			</aside>
		);
	} else {
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
							<h2 className="text-2xl font-bold">{totalComplaints.length}</h2>
						</div>
					) : (
						<div className="bg-gradient-to-r from-primary/40 to-primary p-4 rounded-xl text-center mb-6">
							<p className="text-sm opacity-80">Pending Complaints</p>
							{!loading ? (
								<h2 className="text-2xl font-bold">{pendingComplaints}</h2>
							) : (
								<div className="flex justify-center mt-2">
									<Spinner
										size="sm"
										color="primary"
									/>
								</div>
							)}
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
									} w-full justify-start text-white hover:bg-primary/20 hover:text-white transition`}>
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
}
