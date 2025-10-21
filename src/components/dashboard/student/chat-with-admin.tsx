"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/userContext";
import MessageStat from "../MessageStat";
import { MessageStatus } from "@prisma/client";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
	id: string | number;
	sender: "student" | "admin";
	text: string;
	time: string;
	status: MessageStatus;
}

interface ChatWithAdminProps {
	complaintId: string;
	assignedAdminId: string | null;
}

export default function ChatWithAdmin({
	complaintId,
	assignedAdminId,
}: ChatWithAdminProps) {
	const { userData } = useUser();
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(true);
	const [inputValue, setInputValue] = useState("");
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	console.log("ChatWithAdmin Props:", { complaintId, assignedAdminId });
	// Scroll to bottom whenever new message appears
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Fetch chat messages for selected complaint
	async function fetchMessages() {
		if (!userData?.student?.id || !assignedAdminId || !complaintId) return;

		setLoading(true);
		console.log("Fetching messages for complaintId:", complaintId);
		try {
			const res = await fetch(
				`/api/chat?studentId=${userData?.student?.id}&adminId=${assignedAdminId}&complaintId=${complaintId}`
			);
			const data = await res.json();
			console.log("Fetched Chat Messages Data:", data);
			if (!res.ok) throw new Error(data.error || "Failed to fetch messages");

			const formattedMessages = data.messages.map((msg: any) => ({
				id: msg.id,
				sender:
					msg.senderStudentId === userData?.student?.id ? "student" : "admin",
				text: msg.message,
				time: new Date(msg.timestamp).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				}),
				status: msg.status,
			}));

			setMessages(formattedMessages);
		} catch (error) {
			console.error("Error fetching messages:", error);
			toast.error("Failed to load messages");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchMessages();
	}, [complaintId, assignedAdminId]);

	// Send a new message
	const handleSend = async () => {
		if (!inputValue.trim() || !assignedAdminId) {
			toast.error("Please type a message before sending");
			return;
		}

		const messagePayload = {
			message: inputValue,
			senderRole: "STUDENT",
			senderId: userData?.student?.id,
			receiverId: assignedAdminId,
			complaintId, // ✅ add this line
		};

		const newMsg: Message = {
			id: Date.now(),
			sender: "student",
			text: inputValue,
			time: new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			status: "SENT",
		};

		setMessages((prev) => [...prev, newMsg]);
		setInputValue("");

		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(messagePayload),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to send message");
			}
		} catch (err) {
			console.error(err);
			toast.error("Failed to send message");
		}
	};

	return (
		<div className="flex flex-col h-full bg-background dark:bg-primary-foreground shadow-md rounded-xl border overflow-hidden">
			{/* Header */}
			<div className="bg-primary text-white py-4 px-6 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="bg-white/20 p-2 rounded-full">
						<Bot className="h-5 w-5" />
					</div>
					<div>
						<h2 className="text-lg font-semibold">Admin Support</h2>
						<p className="text-xs opacity-80">Available to assist you</p>
					</div>
				</div>
			</div>

			{/* Chat messages */}
			<div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-primary-foreground hide-scrollbar">
				{loading ? (
					<div className="space-y-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="flex gap-3">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-3/4 rounded-md" />
									<Skeleton className="h-4 w-1/2 rounded-md" />
								</div>
							</div>
						))}
					</div>
				) : messages.length === 0 ? (
					<div className="flex h-full items-center justify-center text-gray-400 text-sm">
						No messages yet. Start a conversation 👋
					</div>
				) : (
					messages.map((msg) => (
						<div
							key={msg.id}
							className={`flex mb-3 ${
								msg.sender === "student" ? "justify-end" : "justify-start"
							}`}>
							<div
								className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
									msg.sender === "student"
										? "bg-primary text-white rounded-br-none"
										: "bg-gray-200 dark:bg-ring dark:text-foreground rounded-bl-none"
								}`}>
								<p>{msg.text}</p>
								<span className="text-[10px] block mt-1 opacity-70 text-right">
									{msg.time}
								</span>
								<span className="ml-1 inline-flex items-center">
									<MessageStat status={msg.status} />
								</span>
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input box */}
			<div className="border-t bg-background dark:bg-primary-foreground p-3 flex items-center gap-3">
				<Input
					type="text"
					placeholder="Type your message..."
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSend()}
					className="flex-1 rounded-full border-gray-300 focus-visible:ring-primary"
				/>
				<Button
					size="icon"
					className="rounded-full bg-primary hover:bg-primary/90"
					onClick={handleSend}>
					<Send className="h-4 w-4 text-white" />
				</Button>
			</div>
		</div>
	);
}
