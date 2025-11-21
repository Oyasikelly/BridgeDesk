"use client";

import { useEffect, useState } from "react";
import {
	MessageSquare,
	CheckCircle2,
	AlertTriangle,
	TrendingUp,
	TrendingDown,
	Search,
	Clock,
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
import { useUser } from "@/context/userContext";
import { Spinner } from "@/components/ui/spinner";
import { MdDangerous } from "react-icons/md";
import Link from "next/link";
import { Complaint } from "@/types/ComplaintList";

export default function AdminDashboard() {
	const [search, setSearch] = useState("");
	const { userData } = useUser();
	const [loading, setLoading] = useState(true);

	const [dashboardData, setDashboardData] = useState({
		totalComplaints: 0,
		resolvedCount: 0,
		pendingCount: 0,
		inProgressCount: 0,
		rejectedCount: 0,
		recentComplaints: [],
		chartData: [],
	});

	// ✅ Helper for colored badges
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "RESOLVED":
				return (
					<Badge className="bg-green-500 hover:bg-green-600 text-white">
						Resolved
					</Badge>
				);
			case "IN_PROGRESS":
				return (
					<Badge className="bg-blue-500 hover:bg-blue-600 text-white">
						In Progress
					</Badge>
				);
			case "PENDING":
				return (
					<Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
						Pending
					</Badge>
				);
			case "REJECTED":
				return (
					<Badge className="bg-red-500 hover:bg-red-600 text-white">
						Rejected
					</Badge>
				);
			default:
				return <Badge>{status}</Badge>;
		}
	};

	// ✅ Fetch Admin Dashboard Data
	const fetchDashboard = async () => {
		if (!userData?.admin?.id) return;

		try {
			const res = await fetch(
				`/api/admin/dashboard?adminId=${userData.admin.id}`
			);
			if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);

			const data = await res.json();
			console.log("Dashboard data:", data);
			const { stats, recentComplaints, chartData } = data;

			// ✅ Destructure stats
			const {
				totalComplaints,
				resolvedCount,
				pendingCount,
				inProgressCount,
				rejectedCount,
			} = stats;

			setDashboardData({
				totalComplaints,
				resolvedCount,
				pendingCount,
				inProgressCount,
				rejectedCount,
				recentComplaints,
				chartData,
			});
		} catch (err) {
			console.error("Error loading dashboard:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboard();
	}, [userData, userData?.admin?.id]);

	if (loading)
		return (
			<div className="flex justify-center items-center h-[80vh] text-gray-500">
				<Spinner
					size="md"
					color="primary"
				/>
				Loading dashboard...
			</div>
		);

	return (
		<div className="p-6 bg-background min-h-screen">
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<div className="flex gap-3">
					{/* <Button
						variant="outline"
						className="flex items-center gap-2">
						<Filter className="h-4 w-4" /> Filter
					</Button> */}
					<Link href="/admin/all-complaints">
						<Button className="bg-primary text-white hover:bg-primary/90">
							<MessageSquare className="h-4 w-4 mr-2" /> View All Complaints
						</Button>
					</Link>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
				<Card className="p-4 bg-primary-foreground shadow-sm">
					<CardHeader className="flex items-center gap-2">
						<MessageSquare className="text-primary" />
						<CardTitle>Total Complaints</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">
							{dashboardData.totalComplaints}
						</p>
						<p className="text-sm text-gray-500 flex items-center gap-1">
							<TrendingUp className="h-3 w-3 text-green-500" /> Updated
							automatically
						</p>
					</CardContent>
				</Card>

				<Card className="p-4 bg-primary-foreground shadow-sm">
					<CardHeader className="flex items-center gap-2">
						<CheckCircle2 className="text-primary" />
						<CardTitle>Resolved Issues</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{dashboardData.resolvedCount}</p>
						<p className="text-sm text-gray-500 flex items-center gap-1">
							<TrendingUp className="h-3 w-3 text-green-500" /> Up-to-date stats
						</p>
					</CardContent>
				</Card>

				<Card className="p-4 bg-primary-foreground shadow-sm">
					<CardHeader className="flex items-center gap-2">
						<AlertTriangle className="text-primary" />
						<CardTitle>Pending Complaints</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{dashboardData.pendingCount}</p>
						<p className="text-sm text-gray-500 flex items-center gap-1">
							<TrendingDown className="h-3 w-3 text-red-500" /> Still awaiting
							action
						</p>
					</CardContent>
				</Card>
				<Card className="p-4 bg-primary-foreground shadow-sm">
					<CardHeader className="flex items-center gap-2">
						<AlertTriangle className="text-destructive" />
						<CardTitle>Rejected Complaints</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{dashboardData.rejectedCount}</p>
						<p className="text-sm text-gray-500 flex items-center gap-1">
							<MdDangerous className="h-3 w-3 text-red-500" />
							Rejected complaints
						</p>
					</CardContent>
				</Card>

				<Card className="p-4 bg-primary-foreground shadow-sm">
					<CardHeader className="flex items-center gap-2">
						<Clock className="text-primary" />
						<CardTitle>In Progress</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">
							{dashboardData.inProgressCount}
						</p>
						<p className="text-sm text-gray-500 flex items-center gap-1">
							<TrendingUp className="h-3 w-3 text-blue-500" /> Currently being
							addressed
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Complaint Statistics Chart */}
			<Card className="bg-primary-foreground shadow-sm mb-10">
				<CardHeader>
					<CardTitle>Complaint Overview (Past 12 Months)</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80 w-full">
						<ResponsiveContainer
							width="100%"
							height="100%">
							<BarChart data={dashboardData.chartData}>
								<XAxis dataKey="month" />
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
							</tr>
						</thead>
						<tbody>
							{dashboardData.recentComplaints
								.filter(
									(c: {
										id: string;
										studentName: string;
										title: string;
										status: string;
										date: string;
									}) =>
										c.studentName
											?.toLowerCase()
											.includes(search.toLowerCase()) ||
										c.title?.toLowerCase().includes(search.toLowerCase())
								)
								.map((complaint: Complaint) => (
									<tr
										key={complaint.id}
										className="border-b hover:bg-ring transition">
										<td className="py-3 px-4 font-semibold text-gray-700">
											{complaint.id}
										</td>
										<td className="py-3 px-4">
											{complaint?.student?.fullName}
										</td>
										<td className="py-3 px-4">{complaint.title}</td>
										<td className="py-3 px-4">
											{getStatusBadge(complaint?.status)}
										</td>
										<td className="py-3 px-4">
											{new Date(complaint?.date).toLocaleDateString()}
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
