"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Bell, MessageSquare, Menu, User, Settings as SettingsIcon, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "./sidebar";
import { useUser } from "@/context/userContext";
import { useNotifications } from "@/hooks/useShared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Header({ pageTitle }: { pageTitle: string }) {
	const [open, setOpen] = useState(false);
	const { userData, logout } = useUser();

    // Determine User ID based on Role
    const userId = userData?.role === "ADMIN" ? userData?.admin?.id : userData?.student?.id;
    // @ts-ignore - Role type mismatch fix
    const role = userData?.role as "ADMIN" | "STUDENT";

    const { notifications, unreadCount, markAsRead } = useNotifications(userId, role);

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
				
                <Link href={userData?.role === "ADMIN" ? "/admin/chat-with-student" : "/student/chat-with-admin"}>
                    <Button variant="ghost" size="icon">
                        <MessageSquare className="text-gray-500" />
                    </Button>
                </Link>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="text-gray-500" />
                            {unreadCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-[10px] rounded-full">
                                    {unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.length > 0 ? (
                            notifications.map((n: any) => (
                                <DropdownMenuItem 
                                    key={n.id} 
                                    className={cn("cursor-pointer flex flex-col items-start p-3", !n.isRead && "bg-muted/50")}
                                    onClick={() => !n.isRead && markAsRead(n.id)}
                                >
                                    <div className="flex justify-between w-full">
                                        <span className="font-semibold text-sm">{n.title}</span>
                                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                                    <span className="text-[10px] text-gray-400 mt-2 self-end">
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-500">
                                No new notifications
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

				<DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <Avatar>
                                <AvatarImage
                                    src={`${
                                        userData?.role === "STUDENT"
                                            ? userData?.student?.avatarUrl
                                            : userData?.admin?.avatarUrl
                                    }`}
                                    alt={`${
                                        userData?.role === "STUDENT"
                                            ? userData?.student?.fullName
                                            : userData?.admin?.fullName
                                    }`}
                                />
                                <AvatarFallback>
                                    {userData?.role === "STUDENT"
                                        ? userData?.student?.fullName
                                                ?.split(" ") 
                                                ?.map((word) => word[0]?.toUpperCase()) 
                                                ?.join("") 
                                        : userData?.role === "ADMIN"
                                        ? userData?.admin?.fullName
                                                .split(" ") 
                                                .map((word) => word[0]?.toUpperCase()) 
                                                .join("") 
                                        : "N/A"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold">
                                    {userData?.role === "STUDENT"
                                        ? userData?.student?.fullName
                                        : userData?.role === "ADMIN"
                                        ? userData?.admin?.fullName
                                        : ""}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {userData?.role
                                        ? userData.role.charAt(0).toUpperCase() +
                                        userData.role.slice(1).toLowerCase()
                                        : ""}
                                </p>
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={userData?.role === "ADMIN" ? "/admin/profile" : "/student/profile"}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={userData?.role === "ADMIN" ? "/admin/settings" : "/student/settings"}>
                                <SettingsIcon className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
			</div>
		</header>
	);
}
