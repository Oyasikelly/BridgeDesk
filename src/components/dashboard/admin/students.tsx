"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
	Search,
	UserMinus,
	Eye,
	ShieldAlert,
	ShieldCheck,
	Users,
	MessageSquare,
	Download,
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
	description: string;
	status: "Resolved" | "Pending";
	date: string;
};

type Student = {
	id: string;
	name: string;
	department: string;
	level: string;
	email: string;
	phone: string;
	totalComplaints: number;
	resolvedComplaints: number;
	status: "Active" | "Suspended";
	joinedDate: string;
	complaints: Complaint[];
};

const studentList: Student[] = [
	{
		id: "STU001",
		name: "John Doe",
		department: "Electrical Engineering",
		level: "400",
		email: "johndoe@fupre.edu.ng",
		phone: "+2348123456789",
		totalComplaints: 8,
		resolvedComplaints: 6,
		status: "Active",
		joinedDate: "Jan 15, 2024",
		complaints: [
			{
				description: "Power supply to lab faulty",
				status: "Resolved",
				date: "Feb 1, 2024",
			},
			{
				description: "Socket overheating",
				status: "Pending",
				date: "Mar 12, 2024",
			},
		],
	},
	{
		id: "STU002",
		name: "Mary Ann",
		department: "Computer Science",
		level: "300",
		email: "maryann@fupre.edu.ng",
		phone: "+2348098765432",
		totalComplaints: 5,
		resolvedComplaints: 3,
		status: "Active",
		joinedDate: "Feb 10, 2024",
		complaints: [
			{
				description: "WiFi connectivity issue",
				status: "Resolved",
				date: "Apr 20, 2024",
			},
			{
				description: "System crash in lab 2",
				status: "Pending",
				date: "May 3, 2024",
			},
		],
	},
	{
		id: "STU003",
		name: "David Green",
		department: "Mechanical Engineering",
		level: "500",
		email: "davidgreen@fupre.edu.ng",
		phone: "+2348087654321",
		totalComplaints: 12,
		resolvedComplaints: 9,
		status: "Suspended",
		joinedDate: "Sept 5, 2023",
		complaints: [
			{
				description: "WiFi connectivity issue",
				status: "Resolved",
				date: "Apr 20, 2024",
			},
			{
				description: "System crash in lab 2",
				status: "Pending",
				date: "May 3, 2024",
			},
		],
	},
];

export default function StudentsPage() {
	const [students, setStudents] = useState<Student[]>(studentList);
	const [search, setSearch] = useState("");
	const [filterDept, setFilterDept] = useState<string>("All");

	const filteredStudents = students.filter(
		(student) =>
			(filterDept === "All" || student.department === filterDept) &&
			(student.name.toLowerCase().includes(search.toLowerCase()) ||
				student.id.toLowerCase().includes(search.toLowerCase()))
	);

	const getStatusBadge = (status: Student["status"]) => {
		if (status === "Active")
			return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
		return <Badge className="bg-red-500 hover:bg-red-600">Suspended</Badge>;
	};

	const toggleSuspend = (id: string) => {
		setStudents((prev) =>
			prev.map((student) =>
				student.id === id
					? {
							...student,
							status: student.status === "Active" ? "Suspended" : "Active",
					  }
					: student
			)
		);
	};

	// 📄 Export all students to PDF
	const exportAllToPDF = () => {
		// const doc = new jsPDF();
		// doc.text("Student List Report", 14, 15);
		// const tableData = filteredStudents.map((s) => [
		// 	s.id,
		// 	s.name,
		// 	s.department,
		// 	s.level,
		// 	`${s.resolvedComplaints}/${s.totalComplaints}`,
		// 	s.status,
		// 	s.joinedDate,
		// ]);
		// autoTable(doc, {
		// 	head: [["ID", "Name", "Dept", "Level", "Complaints", "Status", "Joined"]],
		// 	body: tableData,
		// 	startY: 25,
		// });
		// doc.save("students_report.pdf");

		const printWindow = window.open("", "", "width=900,height=650");
		if (printWindow) {
			printWindow.document.write(`
        <html>
          <head>
            <title>All Student Report</title>
            <style>
             body {
              font-family: Arial, sans-serif;
              padding: 30px;
              background: #fff;
              color: #333;
            }
            header {
              text-align: center;
              margin-bottom: 30px;
            }
            header img {
              width: 80px;
              height: 80px;
              object-fit: contain;
              margin-bottom: 10px;
            }
            h2 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px 8px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #f4f4f4;
              font-weight: 600;
            }
            tr:nth-child(even) {
              background-color: #fafafa;
            }
            ul {
              margin: 0;
              padding-left: 18px;
            }
            .status {
              padding: 4px 10px;
              border-radius: 6px;
              color: white;
              font-size: 13px;
              text-transform: capitalize;
            }
            .status.active { background-color: green; }
            .status.suspended { background-color: orange; }
            .status.inactive { background-color: gray; }
            </style>
          </head>
         <body>
			<header>
			<img 
			src="/assets/logo.jpg" 
			alt="logo" 
			/>
			</header>
		 <table border="1" cellspacing="0" cellpadding="8" style="border-collapse: collapse; width: 100%;">
    <thead style="background-color: #f4f4f4;">
      <tr>
        <th>ID</th>
        <th>Student</th>
        <th>Department</th>
        <th>Level</th>
        <th>Status</th>
        <th>Joined Date</th>
        <th>Complaints</th>
      </tr>
    </thead>
    <tbody>
      ${filteredStudents
				.map(
					(s) => `
        <tr>
          <td>${s.id}</td>
          <td>${s.name}</td>
          <td>${s.department}</td>
          <td>${s.level}</td>
          <td>
            <span style="
              padding: 4px 8px; 
              border-radius: 6px;
              color: white;
              background-color: ${
								s.status === "Active"
									? "green"
									: s.status === "Suspended"
									? "orange"
									: "gray"
							};
            ">
              ${s.status}
            </span>
          </td>
          <td>${s.joinedDate}</td>
          <td>
            <ul style="margin: 0; padding-left: 18px;">
              ${s.complaints
								.map(
									(c) => `
                  <li>
                    <strong>${c.description}</strong> 
                    <br />
                    <small>Date: ${c.date}</small> | 
                    <span style="color: ${
											c.status === "Resolved" ? "green" : "red"
										};">${c.status}</span>
                  </li>`
								)
								.join("")}
            </ul>
          </td>
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

	// 📄 Export a single student’s details and complaints
	const exportSingleStudent = (student: Student) => {
		const printWindow = window.open("", "", "width=800,height=600");
		if (printWindow) {
			printWindow.document.write(`
        <html>
          <head>
            <title>${student.name} - student Details</title>
            <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              background: #fff;
              color: #333;
            }
            header {
              text-align: center;
              margin-bottom: 30px;
            }
            header img {
              width: 80px;
              height: 80px;
              object-fit: contain;
              margin-bottom: 10px;
            }
            ul {
              margin: 0;
              padding-left: 18px;
            }
            .status {
              padding: 4px 10px;
              border-radius: 6px;
              color: white;
              font-size: 13px;
              text-transform: capitalize;
            }
            .status.active { background-color: green; }
            .status.suspended { background-color: orange; }
            .status.inactive { background-color: gray; }
            </style>
          </head>
          <body>
			<header>  
				<img src="/assets/logo.jpg" alt="logo" />
			</header>
            <h2>student Details</h2>
            <p><strong>ID:</strong> ${student.id}</p>
            <p><strong>Student:</strong> ${student.name}</p>
            <p><strong>Department:</strong> ${student.department}</p>
            <p><strong>Status:</strong> <span class="status">${
							student.status
						}</span></p>
            <p><strong>Date:</strong> ${student.joinedDate}</p>
            <p><strong>Complaints:</strong>   <ul style="margin: 0; padding-left: 18px;">
              ${student.complaints
								.map(
									(c) => `
                  <li>
                    <strong>${c.description}</strong> 
                    <br />
                    <small>Date: ${c.date}</small> | 
                    <span style="color: ${
											c.status === "Resolved" ? "green" : "red"
										};">${c.status}</span>
                  </li>`
								)
								.join("")}
            </ul></p>
          </body>
        </html>
      `);
			printWindow.document.close();
			printWindow.print();
		}

		// const doc = new jsPDF();
		// doc.text(`Student Details: ${student.name}`, 14, 15);
		// (doc as any).autoTable({
		// 	head: [["Field", "Value"]],
		// 	body: [
		// 		["ID", student.id],
		// 		["Email", student.email],
		// 		["Phone", student.phone],
		// 		["Department", student.department],
		// 		["Level", student.level],
		// 		["Status", student.status],
		// 		["Joined Date", student.joinedDate],
		// 	],
		// 	startY: 25,
		// });

		// doc.text("Complaints", 14, (doc as any).lastAutoTable.finalY + 10);
		// const complaintsTable = student.complaints.map((c) => [
		// 	c.description,
		// 	c.status,
		// 	c.date,
		// ]);
		// (doc as any).autoTable({
		// 	head: [["Description", "Status", "Date"]],
		// 	body: complaintsTable,
		// 	startY: (doc as any).lastAutoTable.finalY + 15,
		// });

		// doc.save(`${student.name}_report.pdf`);
	};

	return (
		<div className="p-6">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<Users className="text-primary" /> Students
				</h1>

				<div className="flex items-center gap-3">
					<div className="relative">
						<Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search by name or ID..."
							className="pl-9"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<Select
						value={filterDept}
						onValueChange={setFilterDept}>
						<SelectTrigger className="w-[200px]">
							<SelectValue placeholder="Filter by Department" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="All">All Departments</SelectItem>
							<SelectItem value="Electrical Engineering">
								Electrical Engineering
							</SelectItem>
							<SelectItem value="Computer Science">Computer Science</SelectItem>
							<SelectItem value="Mechanical Engineering">
								Mechanical Engineering
							</SelectItem>
						</SelectContent>
					</Select>

					<Button
						variant="outline"
						onClick={exportAllToPDF}>
						<Download className="h-4 w-4 mr-1" /> Export All
					</Button>
				</div>
			</div>

			{/* Table */}
			<div className="bg-primary-foreground shadow rounded-xl p-4 overflow-x-auto">
				<table className="min-w-full border-collapse">
					<thead>
						<tr className="text-left border-b text-gray-600">
							<th className="py-3 px-4">ID</th>
							<th className="py-3 px-4">Name</th>
							<th className="py-3 px-4">Department</th>
							<th className="py-3 px-4">Level</th>
							<th className="py-3 px-4">Complaints</th>
							<th className="py-3 px-4">Status</th>
							<th className="py-3 px-4">Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredStudents.map((student) => (
							<tr
								key={student.id}
								className="border-b hover:bg-ring transition">
								<td className="py-3 px-4 font-semibold text-gray-700">
									{student.id}
								</td>
								<td className="py-3 px-4">{student.name}</td>
								<td className="py-3 px-4">{student.department}</td>
								<td className="py-3 px-4">{student.level}</td>
								<td className="py-3 px-4">
									{student.resolvedComplaints}/{student.totalComplaints}
								</td>
								<td className="py-3 px-4">{getStatusBadge(student.status)}</td>
								<td className="py-3 px-4 flex gap-2">
									<Button
										variant="default"
										size="sm">
										<MessageSquare className="h-4 w-4 mr-1" /> Chat
									</Button>

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
												<DialogTitle>{student.name}</DialogTitle>
											</DialogHeader>
											<div className="mt-3 space-y-2 text-sm">
												<p>
													<strong>ID:</strong> {student.id}
												</p>
												<p>
													<strong>Email:</strong> {student.email}
												</p>
												<p>
													<strong>Phone:</strong> {student.phone}
												</p>
												<p>
													<strong>Department:</strong> {student.department}
												</p>
												<p>
													<strong>Level:</strong> {student.level}
												</p>
												<p>
													<strong>Status:</strong>{" "}
													{getStatusBadge(student.status)}
												</p>
												<p>
													<strong>Joined:</strong> {student.joinedDate}
												</p>

												<div className="pt-4">
													<h3 className="font-semibold">Complaints</h3>
													<ul className="list-disc ml-5 text-gray-700">
														{student.complaints.map((c, i) => (
															<li key={i}>
																{c.description} —{" "}
																<span className="font-medium">{c.status}</span>{" "}
																({c.date})
															</li>
														))}
													</ul>
												</div>

												<div className="flex justify-end gap-2 pt-4">
													<Button
														variant="outline"
														size="sm"
														onClick={() => exportSingleStudent(student)}>
														<Download className="h-4 w-4 mr-1" /> Export
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => toggleSuspend(student.id)}
														className={
															student.status === "Active"
																? "text-red-600 border-red-600"
																: "text-green-600 border-green-600"
														}>
														{student.status === "Active" ? (
															<>
																<ShieldAlert className="h-4 w-4 mr-1" /> Suspend
															</>
														) : (
															<>
																<ShieldCheck className="h-4 w-4 mr-1" />{" "}
																Unsuspend
															</>
														)}
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

				{filteredStudents.length === 0 && (
					<div className="text-center py-10 text-gray-500">
						<UserMinus className="h-6 w-6 mx-auto mb-2" />
						<p>No students found for the selected filter.</p>
					</div>
				)}
			</div>
		</div>
	);
}
