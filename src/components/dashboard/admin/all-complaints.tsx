"use client";

import { useState } from "react";
import {
	Search,
	Filter,
	MessageSquare,
	Eye,
	CheckCircle,
	Clock,
	XCircle,
	AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";

type Complaint = {
	id: string;
	studentName: string;
	title: string;
	category: string;
	status: "Pending" | "In Progress" | "Resolved" | "Rejected";
	date: string;
	description: string;
};

const sampleComplaints: Complaint[] = [
	{
		id: "C001",
		studentName: "John Doe",
		title: "Broken Door Lock",
		category: "Maintenance",
		status: "Resolved",
		date: "Sept 28, 2025",
		description:
			"The lock on the hostel door is damaged, causing security concerns.",
	},
	{
		id: "C002",
		studentName: "Mary Ann",
		title: "Wi-Fi Connectivity Issue",
		category: "ICT Support",
		status: "In Progress",
		date: "Oct 2, 2025",
		description: "Wi-Fi not accessible in the library area.",
	},
	{
		id: "C003",
		studentName: "Daniel Green",
		title: "Noise at Midnight",
		category: "Disciplinary",
		status: "Pending",
		date: "Oct 4, 2025",
		description:
			"Several students in Block C make noise past midnight, disrupting others.",
	},
];

export default function AllComplaintsPage() {
	const [complaints, setComplaints] = useState<Complaint[]>(sampleComplaints);
	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("All");

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

	const filteredComplaints = complaints.filter(
		(c) =>
			(filterStatus === "All" || c.status === filterStatus) &&
			(c.title.toLowerCase().includes(search.toLowerCase()) ||
				c.id.toLowerCase().includes(search.toLowerCase()))
	);

	return (
		<div className="p-6">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">All Complaints</h1>

				<div className="flex items-center gap-3">
					<div className="relative">
						<Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search by ID or Title..."
							className="pl-9"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<Select
						value={filterStatus}
						onValueChange={setFilterStatus}>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="Filter Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="All">All</SelectItem>
							<SelectItem value="Pending">Pending</SelectItem>
							<SelectItem value="In Progress">In Progress</SelectItem>
							<SelectItem value="Resolved">Resolved</SelectItem>
							<SelectItem value="Rejected">Rejected</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Table */}
			<div className="bg-primary-foreground shadow rounded-xl p-4 overflow-x-auto">
				<table className="min-w-full border-collapse">
					<thead>
						<tr className="text-left border-b text-gray-600">
							<th className="py-3 px-4">ID</th>
							<th className="py-3 px-4">Student</th>
							<th className="py-3 px-4">Title</th>
							<th className="py-3 px-4">Category</th>
							<th className="py-3 px-4">Status</th>
							<th className="py-3 px-4">Date</th>
							<th className="py-3 px-4">Action</th>
						</tr>
					</thead>
					<tbody>
						{filteredComplaints.map((complaint) => (
							<tr
								key={complaint.id}
								className="border-b hover:bg-ring transition">
								<td className="py-3 px-4 font-semibold text-gray-700">
									{complaint.id}
								</td>
								<td className="py-3 px-4">{complaint.studentName}</td>
								<td className="py-3 px-4">{complaint.title}</td>
								<td className="py-3 px-4">{complaint.category}</td>
								<td className="py-3 px-4">
									{getStatusBadge(complaint.status)}
								</td>
								<td className="py-3 px-4">{complaint.date}</td>
								<td className="py-3 px-4 flex gap-2">
									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												size="sm">
												<Eye className="h-4 w-4 mr-1" /> View
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>{complaint.title}</DialogTitle>
											</DialogHeader>
											<div className="mt-3 space-y-2">
												<p>
													<strong>Student:</strong> {complaint.studentName}
												</p>
												<p>
													<strong>Category:</strong> {complaint.category}
												</p>
												<p>
													<strong>Status:</strong>{" "}
													{getStatusBadge(complaint.status)}
												</p>
												<p>
													<strong>Date:</strong> {complaint.date}
												</p>
												<p className="pt-2 text-gray-700">
													{complaint.description}
												</p>
												<div className="flex items-center justify-end gap-2 pt-4">
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															setComplaints((prev) =>
																prev.map((c) =>
																	c.id === complaint.id
																		? { ...c, status: "In Progress" }
																		: c
																)
															)
														}>
														<Clock className="h-4 w-4 mr-1" /> In Progress
													</Button>
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															setComplaints((prev) =>
																prev.map((c) =>
																	c.id === complaint.id
																		? { ...c, status: "Resolved" }
																		: c
																)
															)
														}
														className="text-green-600 border-green-600">
														<CheckCircle className="h-4 w-4 mr-1" /> Resolve
													</Button>
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															setComplaints((prev) =>
																prev.map((c) =>
																	c.id === complaint.id
																		? { ...c, status: "Rejected" }
																		: c
																)
															)
														}
														className="text-red-600 border-red-600">
														<XCircle className="h-4 w-4 mr-1" /> Reject
													</Button>
												</div>
											</div>
										</DialogContent>
									</Dialog>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{filteredComplaints.length === 0 && (
					<div className="text-center py-10 text-gray-500">
						<AlertTriangle className="h-6 w-6 mx-auto mb-2" />
						<p>No complaints found for the selected filter.</p>
					</div>
				)}
			</div>
		</div>
	);
}
