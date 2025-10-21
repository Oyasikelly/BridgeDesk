"use client";

import { useState } from "react";
import SidebarCategories from "./components/SidebarCategories";
import ComplaintList from "./components/ComplaintList";
import ChatWithAdmin from "./chat-with-admin";

export default function StudentChatPage() {
	const [selectedCategory, setSelectedCategory] = useState<any>(null);
	const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

	console.log("Selected Category:", selectedCategory);
	return (
		<div className="flex gap-0 h-[85vh] max-w-7xl mx-auto rounded-xl border shadow-md overflow-hidden">
			<SidebarCategories
				onSelectCategory={(cat) => {
					setSelectedCategory(cat);
					setSelectedComplaint(null); // reset when switching category
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
						assignedAdminId={selectedComplaint.category?.adminId}
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
