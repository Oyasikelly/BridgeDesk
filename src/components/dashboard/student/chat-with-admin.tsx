"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageStatus from "../MessageStatus";

interface Message {
	id: number;
	sender: "student" | "admin";
	text: string;
	time: string;
	status: "sent" | "delivered" | "read";
}

export default function ChatWithAdmin() {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: 1,
			sender: "admin",
			text: "Hello 👋, how may I assist you today?",
			time: "10:45 AM",
			status: "sent",
		},
		{
			id: 2,
			sender: "student",
			text: "Good morning sir, I want to follow up on my Wi-Fi complaint.",
			time: "10:46 AM",
			status: "delivered",
		},
		{
			id: 3,
			sender: "admin",
			text: "Noted. The ICT department has been notified, and it should be fixed by noon.",
			time: "10:48 AM",
			status: "read",
		},
	]);

	const [inputValue, setInputValue] = useState("");
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const handleSend = () => {
		if (!inputValue.trim()) return;
		const newMessage: Message = {
			id: Date.now(),
			sender: "student",
			text: inputValue,
			time: new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			status: "sent",
		};
		setMessages((prev) => [...prev, newMessage]);
		setInputValue("");
	};

	// Scroll to the bottom whenever a new message appears
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="flex flex-col h-[85vh] max-w-3xl mx-auto bg-background dark:bg-primary-foreground shadow-md rounded-xl border overflow-hidden">
			{/* Header */}
			<div className="bg-primary text-white py-4 px-6 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="bg-white/20 p-2 rounded-full">
						<Bot className="h-5 w-5" />
					</div>
					<div>
						<h2 className="text-lg font-semibold">Admin Support</h2>
						<p className="text-xs opacity-80">Online</p>
					</div>
				</div>
			</div>

			{/* Chat messages */}
			<div className="flex-1 p-4 overflow-y-auto hide-scrollbar bg-gray-50 dark:bg-primary-foreground">
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`flex mb-3 ${
							msg.sender === "student" ? "justify-end" : "justify-start"
						}`}>
						<div
							className={`max-w-[75%] p-3 rounded-2xl text-sm ${
								msg.sender === "student"
									? "bg-primary text-white rounded-br-none"
									: "bg-gray-200 dark:bg-ring dark:text-foreground rounded-bl-none"
							}`}>
							<p>{msg.text}</p>
							<span className="text-[10px] block mt-1 opacity-70 text-right">
								{msg.time}
							</span>
							<span className="ml-1 inline-flex items-center">
								<MessageStatus status={msg.status} />
							</span>
						</div>
					</div>
				))}
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
