"use client";

import { useState, useEffect } from "react";
import {
	Search,
	MessageSquare,
	Eye,
	CheckCircle,
	Clock,
	XCircle,
	AlertTriangle,
	Printer,
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
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import { ComplaintStatus } from "@prisma/client";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";

type Complaint = {
	id: string;
	studentId: string;
	studentName: string;
	title: string;
	category: string;
	status: ComplaintStatus;
	date: string;
	description: string;
};

// const sampleComplaints: Complaint[] = [
// 	{
// 		id: "C001",
// 		studentId: "S001",
// 		studentName: "John Doe",
// 		title: "Broken Door Lock",
// 		category: "Maintenance",
// 		status: "Resolved",
// 		date: "Sept 28, 2025",
// 		description:
// 			"The lock on the hostel door is damaged, causing security concerns.",
// 	},
// 	{
// 		id: "C002",
// 		studentId: "S002",
// 		studentName: "Mary Ann",
// 		title: "Wi-Fi Connectivity Issue",
// 		category: "ICT Support",
// 		status: "In Progress",
// 		date: "Oct 2, 2025",
// 		description: "Wi-Fi not accessible in the library area.",
// 	},
// 	{
// 		id: "C003",
// 		studentId: "S003",
// 		studentName: "Daniel Green",
// 		title: "Noise at Midnight",
// 		category: "Disciplinary",
// 		status: "Pending",
// 		date: "Oct 4, 2025",
// 		description:
// 			"Several students in Block C make noise past midnight, disrupting others.",
// 	},
// ];

export default function AllComplaintsPage() {
	const [complaints, setComplaints] = useState<Complaint[]>([]);
	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("All");
	const router = useRouter();
	const { userData } = useUser();
	const [loading, setLoading] = useState(true);

	// ✅ Helper for colored badges
	const getStatusBadge = (status: Complaint["status"]) => {
		switch (status) {
			case "PENDING":
				return (
					<Badge className="bg-green-500 hover:bg-green-600">Pending</Badge>
				);
			case "IN_PROGRESS":
				return (
					<Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
				);
			case "RESOLVED":
				return (
					<Badge className="bg-yellow-500 hover:bg-yellow-600">Resolved</Badge>
				);
			case "REJECTED":
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

	const handleChat = (studentId: string, studentName: string) => {
		router.push(
			`/admin/chat-with-student?studentId=${studentId}&name=${encodeURIComponent(
				studentName
			)}`
		);
	};

	// 🖨️ Print all complaints
	const handleExportAll = () => {
		const printWindow = window.open("", "", "width=900,height=650");
		if (printWindow) {
			printWindow.document.write(`
        <html>
          <head>
            <title>All Student Complaints</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2 { text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; }
              th { background: #f4f4f4; }
            </style>
          </head>
          <body>
            <h2>All Student Complaints</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${filteredComplaints
									.map(
										(c) => `
                  <tr>
                    <td>${c.id}</td>
                    <td>${c.studentName}</td>
                    <td>${c.title}</td>
                    <td>${c.category}</td>
                    <td>${c.status}</td>
                    <td>${c.date}</td>
                    <td>${c.description}</td>
                  </tr>`
									)
									.join("")}
              </tbody>
            </table>
          </body>
        </html>
      `);
			printWindow.document.close();
			printWindow.print();
		}
	};

	// 🖨️ Print single complaint
	const handleExportSingle = (complaint: Complaint) => {
		const printWindow = window.open("", "", "width=800,height=600");
		if (printWindow) {
			printWindow.document.write(`
        <html>
          <head>
            <title>${complaint.title} - Complaint Details</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; }
              h2 { text-align: center; }
              p { margin: 8px 0; }
              strong { color: #222; }
              .status { font-weight: bold; color: ${
								complaint.status === "RESOLVED"
									? "green"
									: complaint.status === "IN_PROGRESS"
									? "blue"
									: complaint.status === "PENDING"
									? "orange"
									: "red"
							}; }
            </style>
          </head>
          <body>
            <h2>Complaint Details</h2>
            <p><strong>ID:</strong> ${complaint.id}</p>
            <p><strong>Student:</strong> ${complaint.studentName}</p>
            <p><strong>Category:</strong> ${complaint.category}</p>
            <p><strong>Status:</strong> <span class="status">${
							complaint.status
						}</span></p>
            <p><strong>Date:</strong> ${complaint.date}</p>
            <p><strong>Description:</strong> ${complaint.description}</p>
          </body>
        </html>
      `);
			printWindow.document.close();
			printWindow.print();
		}
	};

	// 🔹 Fetch complaints from API
	useEffect(() => {
		const fetchComplaints = async () => {
			try {
				const res = await fetch(
					`/api/admin/complaints?adminId=${userData?.admin?.id}`
				);
				const data = await res.json();
				console.log("Fetched complaints:", data);
				setComplaints(data.complaints || []);
			} catch (error) {
				console.error("Error fetching complaints:", error);
			} finally {
				setLoading(false);
			}
		};

		if (userData?.admin?.id) fetchComplaints();
	}, [userData]);

	// 🔹 Function to update complaint status
	const handleStatusUpdate = async (
		complaintId: string,
		newStatus: ComplaintStatus
	) => {
		try {
			const res = await fetch(`/api/admin/complaints/${complaintId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});

			if (!res.ok) {
				throw new Error("Failed to update complaint status");
			}

			// Update UI state
			setComplaints((prev) =>
				prev.map((c) =>
					c.id === complaintId ? { ...c, status: newStatus } : c
				)
			);
			toast.success(
				`Complaint marked as ${newStatus.replace("_", " ").toLowerCase()}`
			);
		} catch (error) {
			console.error("Error updating complaint:", error);
			alert("Failed to update complaint status. Try again.");
		}
	};

	return (
		<div className="p-6">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
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
							<SelectItem value="PENDING">Pending</SelectItem>
							<SelectItem value="IN_PROGRESS">In Progress</SelectItem>
							<SelectItem value="RESOLVED">Resolved</SelectItem>
							<SelectItem value="REJECTED">Rejected</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<Button
					onClick={handleExportAll}
					className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2">
					<Printer className="h-4 w-4" /> Export All
				</Button>
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
													<strong>Description: </strong>
													{complaint.description}
												</p>

												<div className="flex justify-between items-center pt-4">
													<Button
														size="sm"
														className="bg-primary text-white hover:bg-primary/90 flex items-center gap-1"
														onClick={() =>
															handleChat(
																complaint.studentId,
																complaint.studentName
															)
														}>
														<MessageSquare className="h-4 w-4" /> Chat Student
													</Button>

													<Button
														size="sm"
														variant="outline"
														onClick={() => handleExportSingle(complaint)}
														className="flex items-center gap-1">
														<Printer className="h-4 w-4" /> Export
													</Button>
												</div>

												<div className="flex items-center justify-end gap-2 pt-4">
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															handleStatusUpdate(complaint.id, "IN_PROGRESS")
														}>
														<Clock className="h-4 w-4 mr-1" /> In Progress
													</Button>

													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															handleStatusUpdate(complaint.id, "RESOLVED")
														}
														className="text-green-600 border-green-600">
														<CheckCircle className="h-4 w-4 mr-1" /> Resolve
													</Button>

													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															handleStatusUpdate(complaint.id, "REJECTED")
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

				{loading ? (
					<div className="flex justify-center items-center h-[80vh] text-gray-500">
						<Spinner
							size="md"
							color="primary"
						/>
						Loading complaints...
					</div>
				) : filteredComplaints.length === 0 ? (
					<div className="text-center py-10 text-gray-500">
						<AlertTriangle className="h-6 w-6 mx-auto mb-2" />
						<p>No complaints found for the selected filter.</p>
					</div>
				) : null}
			</div>
		</div>
	);
}
