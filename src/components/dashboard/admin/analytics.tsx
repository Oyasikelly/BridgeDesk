"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	LineChart,
	Line,
	CartesianGrid,
	Legend,
} from "recharts";
import {
	Users,
	MessageSquare,
	AlertTriangle,
	CheckCircle,
	TrendingUp,
} from "lucide-react";
import { MdDangerous } from "react-icons/md";
import { Spinner } from "@/components/ui/spinner";

const COLORS = ["#2563eb", "#22c55e", "#eab308", "#ef4444"];

import { useAdmin } from "@/hooks/useAdmin";

export default function AdminAnalytics() {
    const { useAnalytics } = useAdmin();
    const { data, isLoading: loading, error } = useAnalytics();

    // Re-shape data if necessary or use directly if hook returns compatible shape.
    // The previous code expected specific shape, ensuring useAdmin matches it.

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen text-gray-500">
				<Spinner
					size="md"
					color="primary"
				/>
				Loading analytics...
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex items-center justify-center h-screen text-red-500">
				Failed to load analytics.
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6 bg-background min-h-screen">
			{/* Header */}
			<p className="text-foreground/90">
				Track student complaint data and performance insights.
			</p>

			{/* Top Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
				<StatCard
					title="Total Complaints"
					value={data.totalComplaints}
					icon={
						<MessageSquare
							className="text-primary"
							size={30}
						/>
					}
				/>
				<StatCard
					title="Resolved Complaints"
					value={data.resolvedCount}
					icon={
						<CheckCircle
							className="text-green-500"
							size={30}
						/>
					}
				/>
				<StatCard
					title="Pending Complaints"
					value={data.pendingCount}
					icon={
						<AlertTriangle
							className="text-yellow-500"
							size={30}
						/>
					}
				/>
				<StatCard
					title="Active Students"
					value={data.activeStudents}
					icon={
						<Users
							className="text-primary"
							size={30}
						/>
					}
				/>
				<StatCard
					title="Rejected Complaints"
					value={data.rejectedCount}
					icon={
						<MdDangerous
							className="text-destructive"
							size={30}
						/>
					}
				/>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Complaint Distribution */}
				<Card className="shadow-md">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Complaint Distribution
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer
							width="100%"
							height={300}>
							<PieChart>
								<Pie
									data={data.complaintStats}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={100}
									label>
									{data.complaintStats.map(
										(item: { name: string; value: number }, index: number) => (
											<Cell
												key={index}
												fill={COLORS[index % COLORS.length]}
											/>
										)
									)}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Monthly Complaint Trend */}
				<Card className="shadow-md">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Monthly Complaint Trend
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer
							width="100%"
							height={300}>
							<LineChart data={data.monthlyData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="month" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Line
									type="monotone"
									dataKey="complaints"
									stroke="oklch(72.227% 0.1991 147.514)"
									strokeWidth={3}
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Departmental Breakdown */}
			<Card className="shadow-md">
				<CardHeader>
					<CardTitle className="text-lg font-semibold flex items-center gap-2">
						<TrendingUp className="text-primary" />
						Departmental Breakdown
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer
						width="100%"
						height={350}>
						<BarChart data={data.departmentData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Bar
								dataKey="complaints"
								fill="oklch(72.227% 0.1991 147.514)"
								radius={[5, 5, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	);
}

function StatCard({
	title,
	value,
	icon,
}: {
	title: string;
	value: number;
	icon: React.ReactNode;
}) {
	return (
		<Card className="shadow-md">
			<CardContent className="flex items-center justify-between p-5">
				<div>
					<p className="text-sm text-foreground/90">{title}</p>
					<h3 className="text-2xl font-bold text-foreground/50">{value}</h3>
				</div>
				{icon}
			</CardContent>
		</Card>
	);
}
