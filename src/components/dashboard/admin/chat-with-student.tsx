"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
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
import { useAdmin } from "@/hooks/useAdmin";
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
	category: { name: string };
	dateSubmitted: string;
}


type Screen = "students" | "complaints" | "chat";

export default function AdminChatWithStudents() {
	const { userData } = useUser();
    const searchParams = useSearchParams();
	const [students, setStudents] = useState<Student[]>([]);
	const [complaints, setComplaints] = useState<Complaint[] | null>([]);
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
		null
	);
	const [messages, setMessages] = useState<Message[]>([]);
	const [search, setSearch] = useState("");
	const [message, setMessage] = useState("");
	const [uploading, setUploading] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const [screen, setScreen] = useState<Screen>("students");

	const adminId = userData?.admin?.id;
    const { useChatStudents, useChatComplaints, useChatMessages } = useAdmin();

    // Hooks
    const { data: studentsData, isLoading: studentsLoading } = useChatStudents(adminId);
    const { data: complaintsData, isLoading: complaintsLoading } = useChatComplaints(adminId, selectedStudent?.id);
    const { data: messagesData, isLoading: messagesLoading } = useChatMessages(adminId, selectedComplaint?.id);

    // Deep Linking: Auto-select Student
    useEffect(() => {
        const paramStudentId = searchParams.get("studentId");
        if (paramStudentId && students.length > 0 && !selectedStudent) {
            const found = students.find(s => s.id === paramStudentId);
            if (found) {
                setSelectedStudent(found);
                setScreen("complaints");
            }
        }
    }, [searchParams, students, selectedStudent]);

    // Deep Linking: Auto-select Complaint
    useEffect(() => {
        const paramComplaintId = searchParams.get("complaintId");
        // Using complaints directly from state which is set by useEffect below
        if (paramComplaintId && complaints && complaints.length > 0 && !selectedComplaint) {
            const found = complaints.find(c => c.id === paramComplaintId);
            if (found) {
                setSelectedComplaint(found);
                setScreen("chat");
            }
        }
    }, [searchParams, complaints, selectedComplaint]);

	useEffect(() => {
        if (studentsData?.students) {
            setStudents(studentsData.students);
        }
	}, [studentsData]);

	useEffect(() => {
        if (complaintsData?.complaints) {
            setComplaints(complaintsData.complaints);
        }
	}, [complaintsData]);

	useEffect(() => {
        if (messagesData) {
            // Check if messagesData is array or object
            const rawMessages = Array.isArray(messagesData) ? messagesData : messagesData.messages || [];
            
            const formattedMessages = rawMessages.map((msg: any) => ({
                id: msg.id,
                message: msg.message,
                fileUrl: msg.fileUrl,
                fileType: msg.fileType,
                timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                status: msg.status,
                senderType: msg.senderType, // Ensure senderType is available in API response from Prisma
            }));
            setMessages(formattedMessages);
        }
	}, [messagesData]);
    
    // Derived loading state
    const loading = studentsLoading;

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
					"hidden md:flex w-full md:w-1/3 border-r bg-primary-foreground flex-col transition-all duration-300"
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
			<div className={cn("flex-1 flex flex-col md:hidden")}>
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
				className="hidden md:flex flex-1 flex-col bg-background transition-all duration-300">
				{!selectedStudent ? (
					<div className="flex-1 flex flex-col items-center justify-center text-gray-400">
						<MessageSquare className="h-16 w-16 mb-4 opacity-20" />
						<p>Select a student to view complaints and start chatting</p>
					</div>
				) : !selectedComplaint ? (
					<div className="flex-1 flex flex-col">
						<div className="p-4 border-b flex items-center justify-between">
							<h2 className="font-semibold text-lg flex items-center gap-2">
								<User className="h-5 w-5 text-primary" />
								{selectedStudent.fullName}
								<span className="text-sm font-normal text-gray-500">
									({selectedStudent.department})
								</span>
							</h2>
						</div>
						<div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
							{complaintsLoading ? (
								Array.from({ length: 3 }).map((_, i) => (
									<Skeleton key={i} className="h-32 w-full rounded-xl" />
								))
							) : complaints && complaints.length > 0 ? (
								complaints.map((c) => (
									<Card
										key={c.id}
										onClick={() => setSelectedComplaint(c)}
										className="cursor-pointer hover:shadow-md transition-all p-4 border rounded-xl group">
										<div className="flex justify-between items-start mb-2">
											<span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
												{c.dateSubmitted ? new Date(c.dateSubmitted).toLocaleDateString() : "N/A"}
											</span>
											<MessageStat status={c.status as any} /> 
										</div>
										<h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">
											{c.title}
										</h3>
										<p className="text-sm text-gray-500 mt-1">
											{c.category.name}
										</p>
									</Card>
								))
							) : (
								<div className="col-span-full flex flex-col items-center justify-center text-gray-400 mt-20">
									<p>No complaints found for this student.</p>
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="flex-1 flex flex-col h-full">
						{/* Chat Header */}
						<div className="p-4 border-b flex items-center justify-between bg-white dark:bg-black z-10 shadow-sm">
							<div className="flex items-center gap-3">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setSelectedComplaint(null)}
									className="hover:bg-gray-100 rounded-full">
									<ArrowLeft className="h-5 w-5 text-gray-600" />
								</Button>
								<div>
									<h2 className="font-bold text-gray-800 dark:text-gray-100">
										{selectedComplaint.title}
									</h2>
									<p className="text-xs text-green-600 flex items-center gap-1">
										<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
										Active Support
									</p>
								</div>
							</div>
						</div>

						{/* Messages Area */}
						<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-background/20">
							{messagesLoading ? (
								Array.from({ length: 4 }).map((_, i) => (
									<Skeleton key={i} className="h-16 w-3/4 rounded-xl mb-4" />
								))
							) : messages.length > 0 ? (
								messages.map((msg) => (
									<div
										key={msg.id}
										className={cn(
											"flex w-full",
											msg.senderType === "ADMIN"
												? "justify-end"
												: "justify-start"
										)}>
										<div
											className={cn(
												"max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-sm text-sm relative",
												msg.senderType === "ADMIN"
													? "bg-primary text-white rounded-br-none"
													: "bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-bl-none text-gray-800 dark:text-gray-100"
											)}>
											{msg.fileUrl && (
												<div className="mb-3">
													<a
														href={getFileUrl(msg.fileUrl)}
														target="_blank"
														rel="noopener noreferrer"
														className="block group">
														{msg.fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
															<NextImage
																src={getFileUrl(msg.fileUrl)}
																alt={msg.fileName || "attachment"}
																width={250}
																height={200}
																className="rounded-lg object-cover border"
															/>
														) : (
															<div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
																<Paperclip className="h-5 w-5" />
																<span className="truncate max-w-[150px]">
																	{msg.fileName || "Attachment"}
																</span>
															</div>
														)}
													</a>
												</div>
											)}
											<p className="whitespace-pre-wrap">{msg.message}</p>
											<p className={cn(
												"text-[10px] mt-1 text-right",
												msg.senderType === "ADMIN" ? "text-white/70" : "text-gray-400"
											)}>
												{msg.timestamp}
											</p>
										</div>
									</div>
								))
							) : (
								<div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
									<MessageSquare className="h-12 w-12 opacity-20" />
									<p>No messages yet. Start the conversation!</p>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>

						{/* Input Area */}
						<div className="p-4 bg-white dark:bg-black border-t">
							{file && (
								<div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 px-4 rounded-lg mb-2 border border-blue-100 dark:border-blue-800">
									<div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
										<Paperclip className="h-4 w-4" />
										<span className="truncate max-w-xs">{file.name}</span>
									</div>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => setFile(null)}
										className="h-6 w-6 p-0 hover:bg-blue-100 rounded-full">
										<X className="h-3 w-3" />
									</Button>
								</div>
							)}
							<div className="flex items-center gap-2">
								<label className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
									<input
										type="file"
										className="hidden"
										onChange={handleFileChange}
										disabled={uploading}
									/>
									<Paperclip className="h-5 w-5 text-gray-500" />
								</label>
								<Input
									placeholder="Type your message..."
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleSend()}
									className="flex-1 bg-gray-50 dark:bg-gray-900 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
									disabled={uploading}
								/>
								<Button
									onClick={handleSend}
									disabled={(!message.trim() && !file) || uploading}
									className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 transition-all">
									{uploading ? "..." : <Send className="h-4 w-4" />}
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
