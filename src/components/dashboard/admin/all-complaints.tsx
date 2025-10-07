"use client";

import { useState, useRef } from "react";
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

type Complaint = {
	id: string;
	studentId: string;
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
		studentId: "S001",
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
		studentId: "S002",
		studentName: "Mary Ann",
		title: "Wi-Fi Connectivity Issue",
		category: "ICT Support",
		status: "In Progress",
		date: "Oct 2, 2025",
		description: "Wi-Fi not accessible in the library area.",
	},
	{
		id: "C003",
		studentId: "S003",
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
	const router = useRouter();
	const printRef = useRef<HTMLDivElement>(null);

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
								complaint.status === "Resolved"
									? "green"
									: complaint.status === "In Progress"
									? "blue"
									: complaint.status === "Pending"
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
							<SelectItem value="Pending">Pending</SelectItem>
							<SelectItem value="In Progress">In Progress</SelectItem>
							<SelectItem value="Resolved">Resolved</SelectItem>
							<SelectItem value="Rejected">Rejected</SelectItem>
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
