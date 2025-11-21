"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/userContext";
import MessageStat from "../MessageStat";
import { MessageStatus } from "@prisma/client";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface Message {
	id: string | number;
	sender: "student" | "admin";
	text: string;
	time: string;
	status: MessageStatus;
	fileUrl?: string;
	fileName?: string;
}

interface ChatWithAdminProps {
	complaintId: string;
	assignedAdminId: string | null;
}

interface APImessage {
	id: string | number;
	senderStudentId?: string | number | null;
	message: string;
	timestamp: string;
	status: MessageStatus;
	fileUrl?: string | null;
	fileName?: string | null;
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
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [uploadProgress, setUploadProgress] = useState<number | null>(null);
	// const [isUploading, setIsUploading] = useState(false);

	// ✅ File selection and preview
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setSelectedFiles(Array.from(e.target.files));
			toast.success(`${e.target.files.length} file(s) ready to send`);
		}
	};

	const removeFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	// ✅ Auto scroll
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// ✅ Fetch chat messages
	async function fetchMessages() {
		if (!userData?.student?.id || !assignedAdminId || !complaintId) return;

		setLoading(true);
		try {
			const res = await fetch(
				`/api/student/chat?studentId=${userData.student.id}&adminId=${assignedAdminId}&complaintId=${complaintId}`
			);
			const data = await res.json();
			console.log("Fetched messages:", data);
			if (!res.ok) throw new Error(data.error || "Failed to fetch messages");

			const formattedMessages = data.messages.map((msg: APImessage) => ({
				id: msg.id,
				sender:
					msg.senderStudentId === userData.student?.id ? "student" : "admin",
				text: msg.message,
				time: new Date(msg.timestamp).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				}),
				status: msg.status,
				fileUrl: msg.fileUrl ?? undefined,
				fileName: msg.fileName ?? undefined,
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
	}, [complaintId, assignedAdminId, userData?.student?.id]);

	// ✅ Send message (with file upload and progress)
	const handleSend = async () => {
		if (!inputValue.trim() && selectedFiles.length === 0) {
			toast.error("Please type a message or select a file");
			return;
		}

		const formData = new FormData();
		formData.append("message", inputValue);
		formData.append("senderRole", "STUDENT");
		formData.append("senderId", String(userData?.student?.id ?? ""));
		formData.append("receiverId", assignedAdminId || "");
		formData.append("complaintId", complaintId);

		selectedFiles.forEach((file) => {
			formData.append("file", file);
		});

		// Optimistic UI
		const newMsg: Message = {
			id: Date.now(),
			sender: "student",
			text: inputValue || "[File Upload]",
			time: new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			status: "SENT",
		};
		setMessages((prev) => [...prev, newMsg]);
		setInputValue("");

		try {
			// setIsUploading(true);
			setUploadProgress(0);

			const xhr = new XMLHttpRequest();
			xhr.open("POST", "/api/student/chat");

			xhr.upload.onprogress = (e) => {
				if (e.lengthComputable) {
					const percent = Math.round((e.loaded / e.total) * 100);
					setUploadProgress(percent);
				}
			};

			xhr.onload = async () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					const data = JSON.parse(xhr.responseText);
					setMessages((prev) =>
						prev.map((msg) =>
							msg.id === newMsg.id
								? {
										...msg,
										id: data.message.id,
										text: data.message.message,
										status: data.message.status,
										fileUrl: data.message.fileUrl,
								  }
								: msg
						)
					);

					toast.success("Message sent successfully ✅");
				} else {
					const err = JSON.parse(xhr.responseText);
					throw new Error(err.error || "Failed to send message");
				}

				// ✅ Reset states here — hide progress bar & clear files
				setSelectedFiles([]);
				setUploadProgress(null);
				// setIsUploading(false);
			};

			xhr.onerror = () => {
				toast.error("Upload failed");
				setUploadProgress(null);
				// setIsUploading(false);
			};

			xhr.send(formData);
		} catch (err) {
			console.error(err);
			toast.error("Failed to send message");
			setUploadProgress(null);
			// setIsUploading(false);
		}
	};

	const getFileUrl = (url: string) => {
		if (url.match(/\.(pdf|docx|xlsx|zip|txt)$/i)) {
			return url.replace("/image/upload/", "/raw/upload/");
		}
		return url;
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
								{msg.text && <p>{msg.text}</p>}

								{/* File Preview */}
								{/* File Preview */}
								{msg.fileUrl && (
									<div className="mt-3">
										<div className="relative inline-block group">
											{/* ✅ File link for viewing */}
											<a
												href={getFileUrl(msg.fileUrl)}
												target="_blank"
												rel="noopener noreferrer"
												className="block">
												{msg.fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
													// ✅ Image thumbnail
													<Image
														src={getFileUrl(msg.fileUrl)}
														alt={msg.fileName || "Uploaded file"}
														className="rounded-xl max-h-48 w-auto object-cover border border-gray-300 shadow-sm transition-transform duration-200 group-hover:scale-[1.03] group-hover:shadow-md"
													/>
												) : (
													// ✅ File thumbnail
													<div className="relative flex flex-col items-center justify-center w-40 h-48 rounded-xl border border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100 shadow-sm transition-transform duration-200 group-hover:scale-[1.03] group-hover:shadow-md">
														<div className="absolute top-2 right-2 bg-white/70 text-gray-600 px-2 py-[2px] rounded-md text-[10px] font-semibold uppercase">
															{msg.fileUrl.split(".").pop()?.slice(0, 4)}
														</div>
														<span className="text-5xl mb-2">📎</span>
														<p className="text-xs text-gray-700 text-center px-2 break-all">
															{msg.fileName || "View / Download"}
														</p>
													</div>
												)}
											</a>

											{/* ✅ Separate download button — not nested in <a> */}
											<a
												href={getFileUrl(msg.fileUrl)}
												download={msg.fileName || "document"}
												className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow hover:bg-gray-100"
												title="Download">
												⬇️
											</a>
										</div>
									</div>
								)}

								<div className="flex justify-between items-center mt-1 text-[10px] opacity-70">
									<span>{msg.time}</span>
									<MessageStat status={msg.status} />
								</div>
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* File Preview Section */}
			{selectedFiles.length > 0 && (
				<div className="border-t bg-gray-100 p-3 flex flex-wrap gap-3">
					{selectedFiles.map((file, index) => (
						<div
							key={index}
							className="flex items-center gap-2 border px-3 py-1 rounded-full bg-white shadow-sm">
							<span className="text-xs truncate max-w-[100px]">
								{file.name}
							</span>
							<X
								className="h-4 w-4 text-red-500 cursor-pointer"
								onClick={() => removeFile(index)}
							/>
						</div>
					))}

					{/* Progress Bar */}
					{uploadProgress !== null && (
						<div className="w-full mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
							<div
								className="bg-primary h-2 transition-all"
								style={{ width: `${uploadProgress}%` }}
							/>
						</div>
					)}
				</div>
			)}

			{/* Input box */}
			<div className="border-t bg-background dark:bg-primary-foreground p-3 flex items-center gap-3">
				<label className="cursor-pointer">
					<Paperclip className="h-5 w-5 text-gray-500" />
					<input
						type="file"
						multiple
						className="hidden"
						onChange={handleFileChange}
					/>
				</label>

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
