"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Bell, MessageSquare, Menu } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export function Header({ pageTitle }: { pageTitle: string }) {
	const [open, setOpen] = useState(false);

	return (
		<header className="flex justify-between items-center py-4 px-4 md:px-6 bg-background/80 shadow-sm">
			{/* Left Section */}
			<div className="flex items-center gap-3">
				{/* Hamburger - Visible on Mobile */}
				<Sheet
					open={open}
					onOpenChange={setOpen}>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden">
							<Menu className="h-6 w-6 text-gray-700" />
						</Button>
					</SheetTrigger>
					<SheetContent
						side="left"
						className="p-0 w-64">
						<Sidebar />
					</SheetContent>
				</Sheet>
				<h1 className="text-lg md:text-xl font-semibold text-primary">
					{pageTitle}
				</h1>
			</div>

			{/* Right Section */}
			<div className="flex items-center gap-3 md:gap-4">
				<Input
					placeholder="Search here..."
					className="hidden md:block w-64"
				/>
				<MessageSquare className="text-gray-500" />
				<Bell className="text-gray-500" />
				<div className="flex items-center gap-2">
					<Avatar>
						<AvatarImage
							src="https://i.pravatar.cc/150?img=3"
							alt="Claudia Alves"
						/>
						<AvatarFallback>CA</AvatarFallback>
					</Avatar>
					<div className="hidden md:block">
						<p className="text-sm font-semibold">Claudia Alves</p>
						<p className="text-xs text-gray-500">Administrator</p>
					</div>
				</div>
			</div>
		</header>
	);
}
