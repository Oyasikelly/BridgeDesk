"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/userContext";
import { cn } from "@/lib/utils";

interface Complaint {
	id: string;
	title: string;
	description: string;
	status: string;
	categoryId: string;
	category?: { name: string; adminId: string | null };
}

interface ComplaintListProps {
	selectedCategoryId: string | null;
	onSelectComplaint: (complaint: Complaint) => void;
	selectedComplaintId: string | null;
}

export default function ComplaintList({
	selectedCategoryId,
	onSelectComplaint,
	selectedComplaintId,
}: ComplaintListProps) {
	const { userData } = useUser();
	const [complaints, setComplaints] = useState<Complaint[]>([]);
	const [loading, setLoading] = useState(false);

	console.log("Selected Category ID in ComplaintList:", selectedCategoryId);
	useEffect(() => {
		if (!selectedCategoryId || !userData?.student?.id) return;

		async function fetchComplaints() {
			setLoading(true);
			try {
				const res = await fetch(
					`/api/complaints?studentId=${userData?.student?.id}&categoryId=${selectedCategoryId}`
				);
				const data = await res.json();
				console.log("Fetched Complaints Data:", data);
				if (!res.ok)
					throw new Error(data.error || "Failed to fetch complaints");
				setComplaints(data.complaints || []);
			} catch (error) {
				console.error("Error fetching complaints:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchComplaints();
	}, [selectedCategoryId, userData]);

	return (
		<div className="w-80 border-r bg-gray-50 dark:bg-primary-foreground h-[85vh] overflow-y-auto">
			<div className="p-4 border-b">
				<h2 className="text-lg font-semibold text-gray-800 dark:text-white">
					My Complaints
				</h2>
			</div>

			<div className="p-3 space-y-2">
				{loading ? (
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-12 w-full rounded-md"
							/>
						))}
					</div>
				) : complaints.length === 0 ? (
					<p className="text-sm text-gray-500 text-center py-4">
						No complaints in this category
					</p>
				) : (
					complaints.map((complaint) => (
						<button
							key={complaint.id}
							onClick={() => onSelectComplaint(complaint)}
							className={cn(
								"w-full text-left px-3 py-2 rounded-md transition-all duration-200 border",
								selectedComplaintId === complaint.id
									? "bg-primary text-white border-primary"
									: "hover:bg-primary/10 dark:hover:bg-accent/20 border-transparent text-gray-700 dark:text-gray-200"
							)}>
							<p className="font-medium truncate">{complaint.title}</p>
							<p className="text-xs opacity-70 truncate">{complaint.status}</p>
						</button>
					))
				)}
			</div>
		</div>
	);
}
