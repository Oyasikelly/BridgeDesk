"use client";

import { useEffect, useState, useRef } from "react";
import {
	Search,
	Send,
	User,
	MessageSquare,
	Paperclip,
	X,
	ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useUser } from "@/context/userContext";
import { Skeleton } from "@/components/ui/skeleton";
import MessageStat from "../MessageStat";
import NextImage from "next/image";
import { MessageStatus } from "@prisma/client";

interface Student {
	id: string;
	fullName: string;
	department: string;
	level: string;
}

interface Message {
	id: string;
	message?: string;
	fileUrl?: string | null;
	fileName?: string | null;
	fileType?: string | null;
	timestamp: string;
	status: MessageStatus;
	senderType: "ADMIN" | "STUDENT";
}

interface Complaint {
	id: string;
	title: string;
	status: string;
	category: string;
	dateSubmitted: string;
}

type Screen = "students" | "complaints" | "chat";

export default function AdminChatWithStudents() {
	const { userData } = useUser();
	const [students, setStudents] = useState<Student[]>([]);
	const [complaints, setComplaints] = useState<Complaint[] | null>([]);
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
		null
	);
	const [messages, setMessages] = useState<Message[]>([]);
	const [search, setSearch] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [complaintsLoading, setComplaintsLoading] = useState(false);
	const [messagesLoading, setMessagesLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const [screen, setScreen] = useState<Screen>("students");

	const adminId = userData?.admin?.id;

	// Auto scroll on messages
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Fetch students
	const fetchStudents = async () => {
		if (!adminId) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/admin/chat/students?adminId=${adminId}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to fetch students");
			setStudents(data.students || []);
		} catch (err) {
			console.error(err);
			toast.error("Failed to load students");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStudents();
	}, [adminId]);

	// Fetch complaints
	useEffect(() => {
		if (!selectedStudent) return;
		const fetchComplaints = async () => {
			try {
				setComplaintsLoading(true);
				const res = await fetch(
					`/api/admin/chat/complaints?adminId=${adminId}&studentId=${selectedStudent.id}`
				);
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Failed to load complaints");
				setComplaints(data.complaints || []);
			} catch (err) {
				console.error(err);
				toast.error("Failed to load complaints");
			} finally {
				setComplaintsLoading(false);
			}
		};
		fetchComplaints();
	}, [selectedStudent, adminId]);

	// Fetch messages
	useEffect(() => {
		if (!selectedComplaint) return;

		const fetchMessages = async () => {
			try {
				setMessagesLoading(true);
				const res = await fetch(
					`/api/admin/chat/messages?adminId=${adminId}&complaintId=${selectedComplaint.id}`
				);
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Failed to load messages");

				const formattedMessages = data.map((msg: Message) => ({
					id: msg.id,
					message: msg.message,
					fileUrl: msg.fileUrl,
					fileType: msg.fileType,
					timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					}),
					status: msg.status,
					senderType: msg.senderType,
				}));

				setMessages(formattedMessages);
			} catch (err) {
				console.error(err);
				toast.error("Failed to load messages");
			} finally {
				setMessagesLoading(false);
			}
		};

		fetchMessages();
	}, [selectedComplaint, adminId]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.files?.[0];
		if (selected) setFile(selected);
	};

	const handleSend = async () => {
		if (!selectedStudent || (!message.trim() && !file)) return;

		const newMsg: Message = {
			id: Date.now().toString(),
			senderType: "ADMIN",
			message: message.trim(),
			fileUrl: "",
			fileType: "",
			timestamp: new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			status: "SENT",
		};

		setMessages((prev) => [...prev, newMsg]);
		setMessage("");

		try {
			const formData = new FormData();
			formData.append("adminId", adminId || "");
			formData.append("studentId", selectedStudent.id);
			formData.append("complaintId", selectedComplaint?.id || "");
			formData.append("message", message);
			if (file) formData.append("file", file);

			const res = await fetch("/api/admin/chat/messages", {
				method: "POST",
				body: formData,
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to send message");

			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === newMsg.id
						? { ...msg, id: data.id, status: data.status }
						: msg
				)
			);
			setFile(null);
		} catch (err) {
			console.error(err);
			toast.error("Failed to send message");
		}
	};

	const filteredStudents = students.filter((s) =>
		(s.fullName || "").toLowerCase().includes(search.toLowerCase())
	);

	const getFileUrl = (url: string) => {
		if (url.match(/\.(pdf|docx|xlsx|zip|txt)$/i))
			return url.replace("/image/upload/", "/raw/upload/");
		return url;
	};

	// Back button handler
	const handleBack = () => {
		if (screen === "chat") setScreen("complaints");
		else if (screen === "complaints") setScreen("students");
		else setScreen("students");
	};

	return (
		<div className="flex h-[calc(100vh-80px)] bg-background/30">
			{/* Desktop Sidebar */}
			<div
				className={cn(
					"w-full md:w-1/3 border-r bg-primary-foreground flex flex-col transition-all duration-300",
					selectedStudent ? "hidden md:flex" : "flex"
				)}>
				<CardHeader className="border-b p-4">
					<CardTitle className="text-lg font-semibold flex items-center gap-2">
						<MessageSquare className="text-primary" /> Student Chats
					</CardTitle>
				</CardHeader>

				<div className="p-4 relative">
					<Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
					<Input
						placeholder="Search student..."
						className="pl-9"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
					{loading ? (
						<div className="space-y-3">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton
									key={i}
									className="h-12 w-full rounded-md"
								/>
							))}
						</div>
					) : filteredStudents.length > 0 ? (
						filteredStudents.map((student) => (
							<Card
								key={student.id}
								onClick={() => {
									setSelectedStudent(student);
									setScreen("complaints");
								}}
								className="cursor-pointer p-3 hover:bg-muted transition rounded-lg">
								<p className="font-medium">{student.fullName}</p>
								<p className="text-xs text-muted-foreground">
									{student.department} | Level {student.level}
								</p>
							</Card>
						))
					) : (
						<p className="text-center text-sm text-gray-500 mt-10">
							No student found.
						</p>
					)}
				</div>
			</div>

			{/* Mobile/Tablet Flow */}
			<div className="flex-1 flex flex-col md:hidden">
				{screen === "students" && (
					<div className="flex-1 flex flex-col">
						<div className="p-4 flex items-center justify-between border-b">
							<h2 className="font-semibold text-lg">Students</h2>
						</div>
						<div className="flex-1 overflow-y-auto p-4 space-y-2">
							{loading ? (
								<div className="space-y-3">
									{Array.from({ length: 4 }).map((_, i) => (
										<Skeleton
											key={i}
											className="h-12 w-full rounded-md"
										/>
									))}
								</div>
							) : filteredStudents.length > 0 ? (
								filteredStudents.map((student) => (
									<Card
										key={student.id}
										onClick={() => {
											setSelectedStudent(student);
											setScreen("complaints");
										}}
										className="cursor-pointer p-3 hover:bg-muted transition rounded-lg">
										<p className="font-medium">{student.fullName}</p>
										<p className="text-xs text-muted-foreground">
											{student.department} | Level {student.level}
										</p>
									</Card>
								))
							) : (
								<p className="text-center text-sm text-gray-500 mt-10">
									No student found.
								</p>
							)}
						</div>
					</div>
				)}

				{screen === "complaints" && selectedStudent && (
					<div className="flex-1 flex flex-col">
						<div className="flex items-center gap-2 p-4 border-b">
							<Button
								size="icon"
								variant="ghost"
								onClick={handleBack}>
								<ArrowLeft />
							</Button>
							<h2 className="font-semibold text-lg">
								{selectedStudent.fullName}
							</h2>
						</div>

						<div className="flex-1 overflow-y-auto p-4">
							{complaintsLoading ? (
								<Skeleton className="h-12 w-full rounded-md" />
							) : complaints && complaints.length > 0 ? (
								complaints.map((c) => (
									<Card
										key={c.id}
										onClick={() => {
											setSelectedComplaint(c);
											setScreen("chat");
										}}
										className="cursor-pointer p-3 hover:bg-muted transition rounded-lg">
										<p className="font-medium">{c.title}</p>
										<p className="text-xs text-muted-foreground">{c.status}</p>
									</Card>
								))
							) : (
								<p className="text-center text-sm text-gray-500 mt-10">
									No complaints found.
								</p>
							)}
						</div>
					</div>
				)}

				{screen === "chat" && selectedStudent && selectedComplaint && (
					<div className="flex-1 flex flex-col">
						<div className="flex items-center gap-2 p-4 border-b">
							<Button
								size="icon"
								variant="ghost"
								onClick={handleBack}>
								<ArrowLeft />
							</Button>
							<h2 className="font-semibold text-lg">
								{selectedComplaint.title}
							</h2>
						</div>

						<div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
							{messagesLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<Skeleton
										key={i}
										className="h-12 w-full rounded-md"
									/>
								))
							) : messages.length > 0 ? (
								messages.map((msg) => (
									<div
										key={msg.id}
										className={cn(
											"flex",
											msg.senderType === "ADMIN"
												? "justify-end"
												: "justify-start"
										)}>
										<div
											className={cn(
												"max-w-xs md:max-w-sm rounded-2xl px-4 py-2 text-sm shadow",
												msg.senderType === "ADMIN"
													? "bg-primary text-white rounded-br-none"
													: "bg-background/80 border rounded-bl-none"
											)}>
											{msg.fileUrl && (
												<div className="mt-3">
													<div className="relative inline-block group">
														<a
															href={getFileUrl(msg.fileUrl)}
															target="_blank"
															rel="noopener noreferrer"
															className="block">
															{msg.fileUrl.match(
																/\.(jpeg|jpg|png|gif|webp)$/i
															) ? (
																<NextImage
																	src={getFileUrl(msg.fileUrl)}
																	alt={msg.fileName || "Uploaded file"}
																	className="rounded-xl max-h-48 w-auto object-cover border border-gray-300 shadow-sm transition-transform duration-200 group-hover:scale-[1.03] group-hover:shadow-md"
																	width={200}
																	height={200}
																/>
															) : (
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
											{msg.message && <p className="mt-2">{msg.message}</p>}
											<p className="text-[10px] text-muted-foreground mt-1 text-right">
												{msg.timestamp}
											</p>
										</div>
										<MessageStat status={msg.status} />
									</div>
								))
							) : (
								<p className="text-center text-gray-400 text-sm mt-10">
									No messages yet for this complaint.
								</p>
							)}
							<div ref={messagesEndRef} />
						</div>

						<div className="p-4 border-t bg-primary-foreground flex flex-col gap-2">
							{file && (
								<div className="flex items-center justify-between bg-muted p-2 rounded-lg">
									<p className="text-xs truncate max-w-[200px]">{file.name}</p>
									<Button
										size="icon"
										variant="ghost"
										onClick={() => setFile(null)}>
										<X className="h-4 w-4" />
									</Button>
								</div>
							)}

							<div className="flex items-center gap-2">
								<label
									htmlFor="file"
									className={cn(
										"p-2 rounded-md border hover:bg-muted cursor-pointer",
										uploading && "opacity-50 pointer-events-none"
									)}>
									<Paperclip className="h-4 w-4 text-primary" />
									<input
										id="file"
										type="file"
										hidden
										onChange={handleFileChange}
									/>
								</label>

								<Input
									placeholder={`Message ${selectedStudent.fullName}...`}
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleSend()}
								/>
								<Button
									onClick={handleSend}
									className="bg-primary text-white"
									disabled={uploading}>
									<Send className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Desktop Chat Room */}
			<div
				className={cn(
					"flex-1 flex flex-col bg-background transition-all duration-300",
					!selectedStudent && "hidden md:flex"
				)}>
				{/* Keep your existing desktop layout here */}
			</div>
		</div>
	);
}
