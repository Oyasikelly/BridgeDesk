"use client";

import { useState } from "react";
import { MessageSquare, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type Complaint = {
	id: string;
	title: string;
	category: string;
	status: "Pending" | "In Progress" | "Resolved" | "Rejected";
	date: string;
	description: string;
};

const sampleComplaints: Complaint[] = [
	{
		id: "C001",
		title: "Electric Socket Malfunction",
		category: "Maintenance",
		status: "Resolved",
		date: "Sept 28, 2025",
		description:
			"The power socket in Room 204 sparks whenever plugged in. Kindly fix.",
	},
	{
		id: "C002",
		title: "Wi-Fi not connecting",
		category: "ICT Support",
		status: "In Progress",
		date: "Oct 2, 2025",
		description:
			"Internet connection in Block B is very poor. No connectivity since yesterday.",
	},
	{
		id: "C003",
		title: "Noise disturbance",
		category: "Disciplinary",
		status: "Pending",
		date: "Oct 4, 2025",
		description:
			"Roommates play loud music at midnight every day. Please intervene.",
	},
];

export default function MyComplaintsPage() {
	const [complaints, setComplaints] = useState<Complaint[]>(sampleComplaints);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [newComplaint, setNewComplaint] = useState({
		title: "",
		category: "",
		description: "",
	});

	const getStatusBadge = (status: Complaint["status"]) => {
		switch (status) {
			case "Resolved":
				return (
					<Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>
				);
			case "In Progress":
				return (
					<Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
				);
			case "Pending":
				return (
					<Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
				);
			case "Rejected":
				return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
			default:
				return null;
		}
	};

	const handleAddComplaint = () => {
		if (
			!newComplaint.title ||
			!newComplaint.category ||
			!newComplaint.description
		)
			return alert("Please fill all fields.");

		const newItem: Complaint = {
			id: `C00${complaints.length + 1}`,
			title: newComplaint.title,
			category: newComplaint.category,
			status: "Pending",
			date: new Date().toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			}),
			description: newComplaint.description,
		};

		setComplaints([newItem, ...complaints]);
		setNewComplaint({ title: "", category: "", description: "" });
		setIsDialogOpen(false);
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
										setNewComplaint({ ...newComplaint, category: value })
									}>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Maintenance">Maintenance</SelectItem>
										<SelectItem value="ICT Support">ICT Support</SelectItem>
										<SelectItem value="Disciplinary">Disciplinary</SelectItem>
										<SelectItem value="Hostel Issue">Hostel Issue</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<label className="text-sm font-medium">Description</label>
								<Textarea
									placeholder="Describe your complaint in detail..."
									value={newComplaint.description}
									onChange={(e) =>
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

			<div className="bg-background dark:bg-primary-foreground shadow rounded-xl p-4">
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
						{complaints.map((complaint) => (
							<tr
								key={complaint.id}
								className="border-b hover:bg-gray-50 transition">
								<td className="py-3 px-4 font-semibold text-gray-700">
									{complaint.id}
								</td>
								<td className="py-3 px-4">{complaint.title}</td>
								<td className="py-3 px-4">{complaint.category}</td>
								<td className="py-3 px-4">
									{getStatusBadge(complaint.status)}
								</td>
								<td className="py-3 px-4">{complaint.date}</td>
								<td className="py-3 px-4 flex gap-2">
									<Button
										variant="outline"
										size="sm">
										View
									</Button>
									<Button
										variant="outline"
										size="sm">
										Chat
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{complaints.length === 0 && (
					<div className="text-center py-10 text-gray-500">
						<AlertCircle className="h-6 w-6 mx-auto mb-2" />
						<p>No complaints found. Click “New Complaint” to submit one.</p>
					</div>
				)}
			</div>
		</div>
	);
}
