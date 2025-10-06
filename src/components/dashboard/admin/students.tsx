"use client";

import { useState } from "react";
import {
	Search,
	User,
	Eye,
	ShieldAlert,
	ShieldCheck,
	UserMinus,
	UserPlus,
	GraduationCap,
	BookOpen,
	Users,
	MessageSquare,
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
							<th className="py-3 px-4">Action</th>
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
								<td className="py-3 px-4">
									<Button
										variant="default"
										size="sm">
										<MessageSquare className="h-4 w-4 mr-1 hover:opacity-80 cursor:pointer" />
										Chat
									</Button>
								</td>
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
												<DialogTitle>{student.name}</DialogTitle>
											</DialogHeader>
											<div className="mt-3 space-y-2 text-sm">
												<p>
													<strong>Student ID:</strong> {student.id}
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
													<strong>Complaints:</strong>{" "}
													{student.resolvedComplaints}/{student.totalComplaints}
												</p>
												<p>
													<strong>Joined Date:</strong> {student.joinedDate}
												</p>
												<p>
													<strong>Status:</strong>{" "}
													{getStatusBadge(student.status)}
												</p>

												<div className="flex justify-end gap-2 pt-4">
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
