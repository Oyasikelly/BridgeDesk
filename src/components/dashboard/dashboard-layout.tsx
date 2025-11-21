"use client";

import * as React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

interface DashboardLayoutProps {
	children: React.ReactNode;
	className?: string;
	pageTitle?: string;
}

export function DashboardLayout({
	children,
	className,
	pageTitle,
}: DashboardLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = React.useState(false);

	return (
		<div className="min-h-screen bg-background dark:bg-background">
			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-background border-r transition-transform duration-200 ease-in-out md:translate-x-0 ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}>
				<Sidebar />
			</div>

			{/* Main content */}
			<div className="md:pl-64 bg-background dark:bg-background">
				{/* Header */}
				<Header
					// onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
					pageTitle={pageTitle || "dashboard"}
				/>

				{/* Page content with proper spacing */}
				<main className={`flex-1 p-4 md:p-6 lg:p-8 ${className}`}>
					<div className="mx-auto max-w-7xl scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 scrollbar-track-gray-100 overflow-x-auto">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
