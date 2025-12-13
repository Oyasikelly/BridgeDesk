"use client";

import { useEffect, useState } from "react";
import { MessageSquare, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { useComplaints, useCategories, useCreateComplaint } from "@/hooks/useComplaintsApi";
import { useUser } from "@/context/userContext";
import { ComplaintStatus } from "@prisma/client";

type Complaint = {
	id: string;
	title: string;
	category: {
		id: string;
		name: string;
		adminId?: string;
	};
	status: ComplaintStatus;
	dateSubmitted: string;
	description: string;
};

export default function MyComplaintsPage() {
	// Hook integration
	const { userData } = useUser();
    const { data: fetchResult, isLoading: loading, error } = useComplaints({ studentId: userData?.student?.id });
    const complaints = fetchResult?.complaints || [];

	const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
		null
	);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	
	const { data: categoriesData, isLoading: catLoading, error: catError } = useCategories();
    const categories = categoriesData?.categories || [];
    
    // Mutation for creating complaint
    const createComplaintMutation = useCreateComplaint();

	const [newComplaint, setNewComplaint] = useState({
		title: "",
		categoryId: "",
		description: "",
	});
	const router = useRouter();

    // Error handling side-effect
	useEffect(() => {
        if (error) {
            toast.error("Failed to load complaints");
        }
    }, [error]);

	const getStatusBadge = (status: Complaint["status"]) => {
		switch (status) {
			case "RESOLVED":
				return (
					<Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>
				);
			case "IN_PROGRESS":
				return (
					<Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
				);
			case "PENDING":
				return (
					<Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
				);
			case "REJECTED":
				return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
			default:
				return null;
		}
	};

	const handleAddComplaint = async () => {
		if (
			!newComplaint.title ||
			!newComplaint.categoryId ||
			!newComplaint.description
		)
			return alert("Please fill all fields.");
            
        if (!userData?.student?.id) {
            toast.error("User identification failed");
            return;
        }

		try {
			const data = await createComplaintMutation.mutateAsync({
                title: newComplaint.title,
                description: newComplaint.description,
                categoryId: newComplaint.categoryId,
                studentId: userData.student.id,
            });

			setNewComplaint({ title: "", categoryId: "", description: "" });
			setIsDialogOpen(false);
			toast("✅ Complaint submitted successfully!");
            // No need to manually update state as mutation invalidates query
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Something went wrong";
			toast(errorMessage);
		}
	};

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">My Complaints</h1>
				<Dialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button className="bg-primary text-white hover:bg-primary/90">
							<MessageSquare className="h-4 w-4 mr-2" /> New Complaint
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>New Complaint</DialogTitle>
							<DialogDescription>
								Provide clear details about your issue for faster resolution.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-3">
							<div>
								<label className="text-sm font-medium">Title</label>
								<Input
									placeholder="Enter complaint title"
									value={newComplaint.title}
									onChange={(e) =>
										setNewComplaint({ ...newComplaint, title: e.target.value })
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium">Category</label>
								<Select
									onValueChange={(value) =>
										setNewComplaint({ ...newComplaint, categoryId: value })
									}>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										{categories.map((cat: {id: string; name: string}) => (
											<SelectItem
												key={cat.id}
												value={cat.id}>
												{cat.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<label className="text-sm font-medium">Description</label>
								<Textarea
									placeholder="Describe your complaint in detail..."
									value={newComplaint.description}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setNewComplaint({
											...newComplaint,
											description: e.target.value,
										})
									}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								className="bg-primary text-white hover:bg-primary/90"
								onClick={handleAddComplaint}>
								Submit Complaint
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
			<div className="bg-background dark:bg-primary-foreground shadow rounded-xl p-4 ">
				{loading ? (
					<p className="text-center text-gray-500 py-6">
						Loading complaints...
					</p>
				) : complaints.length === 0 ? (
					<div className="text-center py-10 text-gray-500">
						<AlertCircle className="h-6 w-6 mx-auto mb-2" />
						<p>No complaints found. Click “New Complaint” to submit one.</p>
					</div>
				) : (
					<table className="min-w-full border-collapse">
						<thead>
							<tr className="text-left border-b text-gray-600">
								<th className="py-3 px-4">ID</th>
								<th className="py-3 px-4">Title</th>
								<th className="py-3 px-4">Category</th>
								<th className="py-3 px-4">Status</th>
								<th className="py-3 px-4">Date</th>
								<th className="py-3 px-4">Action</th>
							</tr>
						</thead>
						<tbody>
							{complaints.map(
								(complaint: Complaint) => (
									console.log(complaint),
									(
										<tr
											key={complaint.id}
											className="border-b hover:bg-gray-50 transition">
											<td className="py-3 px-4 font-semibold text-gray-700">
												{complaint.id}
											</td>
											<td className="py-3 px-4">{complaint.title}</td>
											<td className="py-3 px-4">{complaint.category?.name}</td>
											<td className="py-3 px-4">
												{getStatusBadge(complaint.status)}
											</td>
											<td className="py-3 px-4">
												{" "}
												{(() => {
													const date = new Date(complaint.dateSubmitted);
													return date.toLocaleString("en-US", {
														year: "numeric",
														month: "long",
														day: "numeric",
														hour: "numeric",
														minute: "2-digit",
														hour12: true,
													});
												})()}
											</td>
											<td className="py-3 px-4 flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setSelectedComplaint(complaint);
														setIsViewModalOpen(true);
													}}>
													View
												</Button>

												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														router.push(
															`/student/chat-with-admin?complaintId=${complaint.id}&adminId=${complaint.category?.adminId}`
														);
													}}>
													Chat
												</Button>
											</td>
										</tr>
									)
								)
							)}
						</tbody>
					</table>
				)}
				<Dialog
					open={isViewModalOpen}
					onOpenChange={setIsViewModalOpen}>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>Complaint Details</DialogTitle>
						</DialogHeader>

						{selectedComplaint && (
							<div className="space-y-3 py-2">
								<p>
									<strong>Title:</strong> {selectedComplaint.title}
								</p>
								<p>
									<strong>Category:</strong> {selectedComplaint.category.name}
								</p>
								<p>
									<strong>Status:</strong> {selectedComplaint.status}
								</p>
								<p>
									<strong>Date Submitted:</strong>{" "}
									{new Date(selectedComplaint.dateSubmitted).toLocaleString()}
								</p>
								<p>
									<strong>Description:</strong>
								</p>
								<p className="text-gray-700">{selectedComplaint.description}</p>
							</div>
						)}

						<DialogFooter>
							<Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
