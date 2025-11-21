"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Send, User, MessageSquare, Paperclip, X } from "lucide-react";
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
	// img?: ReactHTMLElement;
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

export default function AdminChatWithStudents() {
	const { userData } = useUser(); // ✅ Admin info (with id)
	const [students, setStudents] = useState<Student[]>([]);
	const [complaints, setComplaints] = useState<Complaint[] | null>([]);
	const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
		null
	);
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [search, setSearch] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [complaintsLoading, setComplaintsLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	// ✅ Auto scroll to bottom on new messages
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// ✅ Fetch students under admin’s assigned categories
	const adminId = userData?.admin?.id;
	async function fetchStudents() {
		if (!adminId) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/admin/chat/students?adminId=${adminId}`);
			const data = await res.json();
			console.log(data);
			if (!res.ok) throw new Error(data.error || "Failed to fetch students");
			setStudents(data.students || []);
		} catch (error) {
			console.error(error);
			toast.error("Failed to load students");
		} finally {
			setLoading(false);
		}
	}

	// fetch complaints when a student is selected
	useEffect(() => {
		if (!selectedStudent) return;

		const fetchComplaints = async () => {
			try {
				setComplaintsLoading(true);
				const res = await fetch(
					`/api/admin/chat/complaints?adminId=${adminId}&studentId=${selectedStudent?.id}`
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

	// fetch messages when a complaint is selected
	useEffect(() => {
		if (!selectedComplaint) return;

		const fetchMessages = async () => {
			try {
				const res = await fetch(
					`/api/admin/chat/messages?adminId=${adminId}&complaintId=${selectedComplaint?.id}`
				);
				const data = await res.json();
				console.log("Fetched messages:", data);

				if (!res.ok) throw new Error(data.error || "Failed to load messages");

				// ✅ Map messages with senderType
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
			}
		};

		fetchMessages();
	}, [selectedComplaint, adminId]);

	// ✅ Fetch messages for selected student (restricted to admin’s categories)
	// async function fetchMessages(studentId: string) {
	// 	try {
	// 		const res = await fetch(
	// 			`/api/admin/chat/messages?adminId=${adminId}&studentId=${studentId}`
	// 		);
	// 		const data = await res.json();

	// 		if (!res.ok) throw new Error(data.error || "Failed to fetch messages");

	// 		const formatted = data.map((msg: any) => ({
	// 			id: msg.id,
	// 			sender: msg.senderAdminId ? "admin" : "student",
	// 			text: msg.content,
	// 			fileUrl: msg.fileUrl,
	// 			fileType: msg.fileType,
	// 			time: new Date(msg.createdAt).toLocaleTimeString([], {
	// 				hour: "2-digit",
	// 				minute: "2-digit",
	// 			}),
	// 			status: msg.status,
	// 		}));

	// 		setMessages(formatted);
	// 	} catch (err) {
	// 		console.error(err);
	// 		toast.error("Error loading messages");
	// 	}
	// }

	useEffect(() => {
		fetchStudents();
	}, [adminId]);

	// ✅ File upload
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.files?.[0];
		if (selected) setFile(selected);
	};

	// async function uploadFile(file: File): Promise<string | null> {
	// 	setUploading(true);
	// 	try {
	// 		const formData = new FormData();
	// 		formData.append("file", file);
	// 		formData.append("upload_preset", "your_upload_preset");

	// 		const res = await fetch(
	// 			`https://api.cloudinary.com/v1_1/de3w6k8ov/upload`,
	// 			{
	// 				method: "POST",
	// 				body: formData,
	// 			}
	// 		);

	// 		const data = await res.json();
	// 		if (!res.ok) throw new Error(data.error?.message || "Upload failed");
	// 		return data.secure_url;
	// 	} catch (err) {
	// 		console.error(err);
	// 		toast.error("File upload failed");
	// 		return null;
	// 	} finally {
	// 		setUploading(false);
	// 	}
	// }

	// ✅ Send message
	async function handleSend() {
		if (!selectedStudent || (!message.trim() && !file)) return;

		const fileUrl: string | null = "";
		const fileType: string | null = "";

		const newMsg: Message = {
			id: Date.now().toString(),
			senderType: "ADMIN",
			message: message.trim(),
			fileUrl,
			fileType,
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
			formData.append("studentId", selectedStudent?.id);
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
			setUploading(true);
			setFile(null);
		} catch (err) {
			console.error(err);
			toast.error("Failed to send message");
		} finally {
			setUploading(false);
		}
	}
	const filteredStudents = students.filter((s) =>
		(s.fullName || "").toLowerCase().includes(search.toLowerCase())
	);

	const getFileUrl = (url: string) => {
		if (url.match(/\.(pdf|docx|xlsx|zip|txt)$/i)) {
			return url.replace("/image/upload/", "/raw/upload/");
		}
		return url;
	};

	// ✅ Render
	return (
		<div className="flex h-[calc(100vh-80px)] bg-background/30">
			{/* Sidebar */}
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
								onClick={() => setSelectedStudent(student)}
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

			{/* Chat Room */}
			<div
				className={cn(
					"flex-1 flex flex-col bg-background transition-all duration-300",
					!selectedStudent && "hidden md:flex"
				)}>
				{selectedStudent ? (
					<>
						{/* Header */}
						<div className="flex flex-col border-b bg-primary-foreground">
							<div className="flex items-center justify-between p-4">
								<div className="flex items-center gap-3">
									<User className="text-primary" />
									<div>
										<h2 className="font-semibold">
											{selectedStudent.fullName}
										</h2>
										<p className="text-xs text-gray-500">
											{selectedStudent.department} | Level{" "}
											{selectedStudent.level}
										</p>
									</div>
								</div>
							</div>

							{/* Complaint Dropdown */}
							{complaints && complaints.length > 0 ? (
								<div className="px-4 pb-4">
									<select
										className="w-full border rounded-lg p-2 text-sm bg-background"
										value={selectedComplaint?.id || ""}
										onChange={(e) => {
											const complaint =
												complaints.find((c) => c.id === e.target.value) || null;
											setSelectedComplaint(complaint);
										}}>
										{loading || complaintsLoading ? (
											<option>Loading complaints...</option>
										) : (
											<>
												<option value="">Select complaint...</option>
												{complaints.map((c) => (
													<option
														key={c.id}
														value={c.id}>
														{c.title} ({c.status})
													</option>
												))}
											</>
										)}
									</select>
								</div>
							) : (
								<div className="px-4 pb-4 text-xs text-gray-500 italic">
									No complaints found for this student.
								</div>
							)}
						</div>

						{/* Messages */}
						<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-primary-foreground hide-scrollbar">
							{!selectedComplaint ? (
								<p className="text-center text-gray-400 text-sm mt-10">
									Select a complaint to view messages
								</p>
							) : messages.length > 0 ? (
								messages.map((msg, index) => (
									<div
										key={index + 1}
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
														{/* ✅ File link for viewing */}
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

														{/* ✅ Separate download button */}
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

											{/* ✅ Message text below preview */}
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

						{/* Input */}
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
