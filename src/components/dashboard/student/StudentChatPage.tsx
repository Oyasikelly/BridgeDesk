"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SidebarCategories from "./components/SidebarCategories";
import ComplaintList from "./components/ComplaintList";
import ChatWithAdmin from "./chat-with-admin";

export default function StudentChatPage() {
	const [selectedCategory, setSelectedCategory] = useState<any>(null);
	const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
	const [autoLoaded, setAutoLoaded] = useState(false);
	const searchParams = useSearchParams();

	const complaintId = searchParams.get("complaintId");
	const adminId = searchParams.get("adminId");

	// ✅ Auto-load complaint when opened via link with params
	useEffect(() => {
		const loadComplaint = async () => {
			if (!complaintId || autoLoaded) return;
			try {
				const res = await fetch(`/api/complaints/${complaintId}`);
				if (!res.ok) {
					console.error("Fetch failed:", res.status);
					throw new Error(`Failed to fetch complaint (${res.status})`);
				}

				// ✅ Ensure it's valid JSON before parsing
				const contentType = res.headers.get("content-type");
				if (!contentType || !contentType.includes("application/json")) {
					throw new Error(
						"Response is not JSON. Check your API route path or authentication."
					);
				}

				const data = await res.json();

				setSelectedComplaint(data.complaint);
				setSelectedCategory(data.complaint.category);
				setAutoLoaded(true);
			} catch (err) {
				console.error("Error loading complaint:", err);
			}
		};

		loadComplaint();
	}, [complaintId, autoLoaded]);

	return (
		<div className="flex gap-0 h-[85vh] max-w-7xl mx-auto rounded-xl border shadow-md overflow-hidden">
			<SidebarCategories
				onSelectCategory={(cat) => {
					setSelectedCategory(cat);
					setSelectedComplaint(null);
				}}
				selectedCategoryId={selectedCategory?.id || null}
			/>

			{selectedCategory && (
				<ComplaintList
					selectedCategoryId={selectedCategory.id}
					onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
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
					// ✅ Show chat directly if opened via link
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
