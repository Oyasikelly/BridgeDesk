"use client";

import { useState } from "react";
import {
	Users,
	MessageSquare,
	Clock,
	CheckCircle2,
	AlertTriangle,
	TrendingUp,
	TrendingDown,
	Search,
	Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const complaintData = [
	{ name: "Jan", resolved: 40, pending: 15 },
	{ name: "Feb", resolved: 50, pending: 10 },
	{ name: "Mar", resolved: 35, pending: 20 },
	{ name: "Apr", resolved: 70, pending: 25 },
	{ name: "May", resolved: 90, pending: 12 },
	{ name: "Jun", resolved: 60, pending: 22 },
];

const recentComplaints = [
	{
		id: "C001",
		student: "Kelly Bright",
		title: "Electric Socket Malfunction",
		status: "Resolved",
		date: "Sept 28, 2025",
	},
	{
		id: "C002",
		student: "John Doe",
		title: "Wi-Fi not connecting",
		status: "In Progress",
		date: "Oct 2, 2025",
	},
	{
		id: "C003",
		student: "Mary Johnson",
		title: "Noise disturbance",
		status: "Pending",
		date: "Oct 3, 2025",
	},
	{
		id: "C004",
		student: "James Peter",
		title: "Leaking pipe in hostel",
		status: "Rejected",
		date: "Oct 5, 2025",
	},
];

export default function AdminDashboard() {
	const [search, setSearch] = useState("");

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "Resolved":
				return (
					<Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
				);
			case "In Progress":
				return (
					<Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
				);
			case "Pending":
				return (
					<Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
				);
			case "Rejected":
				return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>;
			default:
				return null;
		}
	};

	return (
		<div className="p-6 bg-background min-h-screen">
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<div className="flex gap-3">
					<Button
						variant="outline"
						className="flex items-center gap-2">
						<Filter className="h-4 w-4" /> Filter
					</Button>
					<Button className="bg-primary text-white hover:bg-primary/90">
						<MessageSquare className="h-4 w-4 mr-2" /> View All Complaints
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
				<Card className="p-4 bg-primary-foreground shadow-sm">
					<CardHeader className="flex items-center gap-2">
						<Users className="text-primary" />
						<CardTitle>Total Students</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">1,240</p>
						<p className="text-sm text-gray-500 flex items-center gap-1">
							<TrendingUp className="h-3 w-3 text-green-500" /> +4.2% this month
						</p>
					</CardContent>
				</Card>

				<Card className="p-4 bg-primary-foreground shadow-sm">
					<CardHeader className="flex items-center gap-2">
						<MessageSquare className="text-primary" />
						<CardTitle>Total Complaints</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">328</p>
						<p className="text-sm text-gray-500 flex items-center gap-1">
							<TrendingUp className="h-3 w-3 text-green-500" /> +12% since last
							week
						</p>
					</CardContent>
				</Card>

				<Card className="p-4 bg-primary-foreground shadow-sm">
					<CardHeader className="flex items-center gap-2">
						<CheckCircle2 className="text-primary" />
						<CardTitle>Resolved Issues</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">240</p>
						<p className="text-sm text-gray-500 flex items-center gap-1">
							<TrendingUp className="h-3 w-3 text-green-500" /> +8% this month
						</p>
					</CardContent>
				</Card>

				<Card className="p-4 bg-primary-foreground shadow-sm">
					<CardHeader className="flex items-center gap-2">
						<AlertTriangle className="text-primary" />
						<CardTitle>Pending Complaints</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">88</p>
						<p className="text-sm text-gray-500 flex items-center gap-1">
							<TrendingDown className="h-3 w-3 text-red-500" /> -2% this week
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Complaint Statistics Chart */}
			<Card className="bg-primary-foreground shadow-sm mb-10">
				<CardHeader>
					<CardTitle>Complaint Overview (Past 6 Months)</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80 w-full">
						<ResponsiveContainer
							width="100%"
							height="100%">
							<BarChart data={complaintData}>
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Bar
									dataKey="resolved"
									fill="oklch(72.227% 0.1991 147.514)"
								/>
								<Bar
									dataKey="pending"
									fill="oklch(62.227% 0.1991 147.514)"
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			{/* Recent Complaints Table */}
			<Card className="bg-primary-foreground shadow-sm">
				<CardHeader className="flex justify-between items-center">
					<CardTitle>Recent Complaints</CardTitle>
					<div className="relative">
						<Search className="absolute left-2 top-2.5 text-gray-400 h-4 w-4" />
						<Input
							type="text"
							placeholder="Search complaints..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-8 w-64"
						/>
					</div>
				</CardHeader>

				<CardContent>
					<table className="min-w-full border-collapse text-sm">
						<thead>
							<tr className="text-left border-b text-gray-600">
								<th className="py-3 px-4">ID</th>
								<th className="py-3 px-4">Student</th>
								<th className="py-3 px-4">Title</th>
								<th className="py-3 px-4">Status</th>
								<th className="py-3 px-4">Date</th>
								<th className="py-3 px-4">Action</th>
							</tr>
						</thead>
						<tbody>
							{recentComplaints
								.filter(
									(c) =>
										c.student.toLowerCase().includes(search.toLowerCase()) ||
										c.title.toLowerCase().includes(search.toLowerCase())
								)
								.map((complaint) => (
									<tr
										key={complaint.id}
										className="border-b hover:bg-ring transition">
										<td className="py-3 px-4 font-semibold text-gray-700">
											{complaint.id}
										</td>
										<td className="py-3 px-4">{complaint.student}</td>
										<td className="py-3 px-4">{complaint.title}</td>
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
				</CardContent>
			</Card>
		</div>
	);
}
