"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SidebarCategories from "./components/SidebarCategories";
import ComplaintList from "./components/ComplaintList";
import ChatWithAdmin from "./chat-with-admin";

import type { Category, Complaint } from "@/types/ComplaintList";
import { Spinner } from "@/components/ui/spinner";

function StudentChatPageContent() {
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		null
	);
	const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
		null
	);
	const [autoLoaded, setAutoLoaded] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [mobileStep, setMobileStep] = useState<
		"categories" | "complaints" | "chat"
	>("categories");

	const searchParams = useSearchParams();
	const complaintId = searchParams.get("complaintId");
	const adminId = searchParams.get("adminId");

	// Detect mobile/tablet
	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 1024);
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Auto-load complaint (unchanged)
	useEffect(() => {
		const loadComplaint = async () => {
			if (!complaintId || autoLoaded) return;
			try {
				const res = await fetch(`/api/complaints/${complaintId}`);
				if (!res.ok) throw new Error(`Failed: ${res.status}`);

				const contentType = res.headers.get("content-type");
				if (!contentType?.includes("application/json")) {
					throw new Error("Response not JSON");
				}

				const data = await res.json();

				setSelectedComplaint(data.complaint);
				setSelectedCategory(data.complaint.category);
				setMobileStep("chat"); // auto-open chat on mobile
				setAutoLoaded(true);
			} catch (err) {
				console.error("Error loading complaint:", err);
			}
		};

		loadComplaint();
	}, [complaintId, autoLoaded]);

	/* 
	---------------------------------------------------
		MOBILE LAYOUT (One component per screen)
	---------------------------------------------------
	*/
	if (isMobile) {
		return (
			<>
				<div className="h-[85vh] max-w-7xl mx-auto rounded-xl border shadow-md overflow-hidden relative">
					{/* Back Button */}
					{mobileStep !== "categories" && (
						<button
							onClick={() =>
								setMobileStep(
									mobileStep === "chat" ? "complaints" : "categories"
								)
							}
							className="absolute top-3 right-1 bg-gray-200 transition-all duration-300 px-3 py-1 rounded-md text-sm z-50">
							← Back
						</button>
					)}
					{/* Step 1: Categories */}
					{mobileStep === "categories" && (
						<SidebarCategories
							onSelectCategory={(cat) => {
								setSelectedCategory(cat as Category);
								setSelectedComplaint(null);
								setMobileStep("complaints");
							}}
							selectedCategoryId={selectedCategory?.id || null}
						/>
					)}

					{/* Step 2: Complaints */}
					{mobileStep === "complaints" && selectedCategory && (
						<ComplaintList
							selectedCategoryId={selectedCategory.id}
							onSelectComplaint={(complaint: Complaint) => {
								setSelectedComplaint(complaint);
								setMobileStep("chat");
							}}
							selectedComplaintId={selectedComplaint?.id || null}
						/>
					)}

					{/* Step 3: Chat */}
					{mobileStep === "chat" && (
						<ChatWithAdmin
							key={selectedComplaint?.id || complaintId}
							complaintId={selectedComplaint?.id || complaintId || ""}
							assignedAdminId={
								selectedComplaint?.category?.adminId || adminId || ""
							}
						/>
					)}
				</div>
			</>
		);
	}

	/* 
	---------------------------------------------------
		DESKTOP LAYOUT (Your original layout untouched)
	---------------------------------------------------
	*/
	return (
		<div className="flex gap-0 h-[85vh] max-w-7xl mx-auto rounded-xl border shadow-md overflow-hidden">
			<SidebarCategories
				onSelectCategory={(cat) => {
					setSelectedCategory(cat as Category);
					setSelectedComplaint(null);
				}}
				selectedCategoryId={selectedCategory?.id || null}
			/>

			{selectedCategory && (
				<ComplaintList
					selectedCategoryId={selectedCategory.id}
					onSelectComplaint={(complaint: Complaint) =>
						setSelectedComplaint(complaint)
					}
					selectedComplaintId={selectedComplaint?.id || null}
				/>
			)}

			<div className="flex-1">
				{selectedComplaint ? (
					<ChatWithAdmin
						key={selectedComplaint?.id}
						complaintId={selectedComplaint?.id}
						assignedAdminId={
							selectedComplaint?.category?.adminId || adminId || ""
						}
					/>
				) : complaintId && adminId ? (
					<ChatWithAdmin
						key={complaintId}
						complaintId={complaintId}
						assignedAdminId={adminId}
					/>
				) : (
					<div className="flex items-center justify-center h-full text-gray-500">
						{selectedCategory
							? "Select a complaint to start chatting 💬"
							: "Choose a category first 📂"}
					</div>
				)}
			</div>
		</div>
	);
}

export default function StudentChatPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center h-full text-gray-500">
					<Spinner
						size="md"
						color="primary"
					/>
				</div>
			}>
			<StudentChatPageContent />
		</Suspense>
	);
}
