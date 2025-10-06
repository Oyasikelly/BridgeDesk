"use client";

import { useState } from "react";
import {
	Search,
	User,
	Send,
	ArrowLeft,
	MessageSquare,
	Circle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import MessageStatus from "../MessageStatus";

type MessageStatusType = "sent" | "delivered" | "read";

interface Message {
	from: "student" | "admin";
	text: string;
	time: string;
	status: MessageStatusType;
}

type Student = {
	id: string;
	name: string;
	department: string;
	level: string;
	lastMessage?: string;
	active: boolean;
};

const studentList: Student[] = [
	{
		id: "STU001",
		name: "John Doe",
		department: "Electrical Engineering",
		level: "400",
		lastMessage: "Thanks for the update!",
		active: true,
	},
	{
		id: "STU002",
		name: "Mary Ann",
		department: "Computer Science",
		level: "300",
		lastMessage: "When will my complaint be resolved?",
		active: false,
	},
	{
		id: "STU003",
		name: "David Green",
		department: "Mechanical Engineering",
		level: "500",
		lastMessage: "Got it, sir. Appreciate!",
		active: true,
	},
];

// ✅ each student will have their own message history
const initialMessages: Record<string, Message[]> = {
	STU001: [
		{
			from: "student",
			text: "Good morning, sir.",
			time: "9:02 AM",
			status: "delivered",
		},
		{
			from: "admin",
			text: "Good morning, John. How may I help you today?",
			time: "9:05 AM",
			status: "sent",
		},
	],
	STU002: [
		{
			from: "student",
			text: "When will my complaint be resolved?",
			time: "8:35 AM",
			status: "delivered",
		},
	],
	STU003: [
		{
			from: "student",
			text: "Good afternoon, sir.",
			time: "2:10 PM",
			status: "sent",
		},
		{
			from: "admin",
			text: "Good afternoon, David!",
			time: "2:12 PM",
			status: "read",
		},
	],
};

export default function AdminChatPage() {
	const [search, setSearch] = useState("");
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [message, setMessage] = useState("");
	const [chatHistory, setChatHistory] = useState(initialMessages);

	const filteredStudents = studentList.filter((student) =>
		student.name.toLowerCase().includes(search.toLowerCase())
	);

	const handleSend = () => {
		if (!selectedStudent || !message.trim()) return;
		const newMessage = {
			from: "admin" as const,
			text: message,
			time: new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			status: "sent" as const,
		};

		// ✅ Update chat history for the current student
		setChatHistory(
			(prev): Record<string, Message[]> => ({
				...prev,
				[selectedStudent.id]: [...(prev[selectedStudent.id] || []), newMessage],
			})
		);
		setMessage("");
	};

	return (
		<div className="flex h-[calc(100vh-80px)] bg-background/30">
			{/* Sidebar - Student list */}
			<div
				className={cn(
					"w-full md:w-1/3 border-r bg-primary-foreground flex flex-col transition-all duration-300",
					selectedStudent ? "hidden md:flex" : "flex"
				)}>
				<CardHeader className="flex items-center justify-between border-b p-4">
					<CardTitle className="text-lg font-semibold flex items-center gap-2">
						<MessageSquare className="text-primary" /> Chat with Students
					</CardTitle>
				</CardHeader>

				<div className="p-4">
					<div className="relative">
						<Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search student..."
							className="pl-9"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto space-y-2 px-4 pb-4 hide-scrollbar">
					{filteredStudents.length > 0 ? (
						filteredStudents.map((student) => (
							<Card
								key={student.id}
								onClick={() => setSelectedStudent(student)}
								className="cursor-pointer p-3 hover:bg-muted transition rounded-lg">
								<div className="flex justify-between items-center">
									<div>
										<p className="font-medium">{student.name}</p>
										<p className="text-xs text-muted-foreground">
											{student.lastMessage || "No messages yet"}
										</p>
									</div>
									{student.active && (
										<Circle className="h-3 w-3 text-green-500 fill-green-500" />
									)}
								</div>
							</Card>
						))
					) : (
						<p className="text-center text-sm text-gray-500 mt-10">
							No student found.
						</p>
					)}
				</div>
			</div>

			{/* Chat Room */}
			<div
				className={cn(
					"flex-1 flex flex-col bg-background transition-all duration-300",
					!selectedStudent && "hidden md:flex"
				)}>
				{selectedStudent ? (
					<>
						{/* Chat Header */}
						<div className="flex items-center justify-between p-4 border-b bg-primary-foreground">
							<div className="flex items-center gap-3">
								<Button
									variant="ghost"
									size="icon"
									className="md:hidden"
									onClick={() => setSelectedStudent(null)}>
									<ArrowLeft />
								</Button>
								<User className="text-primary" />
								<div>
									<h2 className="font-semibold">{selectedStudent.name}</h2>
									<p className="text-xs text-gray-500">
										{selectedStudent.department} | Level {selectedStudent.level}
									</p>
								</div>
							</div>
						</div>

						{/* Messages Area */}
						<div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar bg-primary-foreground">
							{chatHistory[selectedStudent.id]?.map((msg, i) => (
								<>
									<div
										key={i}
										className={cn(
											"flex",
											msg.from === "admin" ? "justify-end" : "justify-start"
										)}>
										<div
											className={cn(
												"max-w-xs md:max-w-sm rounded-2xl px-4 py-2 text-sm shadow",
												msg.from === "admin"
													? "bg-primary text-white rounded-br-none"
													: "bg-background/80 dark:bg-ring border rounded-bl-none"
											)}>
											<p>{msg.text}</p>
											<p className="text-[10px] text-muted-foreground mt-1 text-right">
												{msg.time}
											</p>
										</div>
									</div>
									<span className="ml-1 inline-flex items-center">
										<MessageStatus status={msg.status} />
									</span>
								</>
							))}
						</div>

						{/* Message Input */}
						<div className="p-4 border-t bg-primary-foreground flex gap-2 items-center">
							<Input
								placeholder={`Message ${selectedStudent.name}...`}
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSend()}
							/>
							<Button
								onClick={handleSend}
								className="bg-primary text-white">
								<Send className="h-4 w-4" />
							</Button>
						</div>
					</>
				) : (
					<div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
						Select a student to start chatting
					</div>
				)}
			</div>
		</div>
	);
}
