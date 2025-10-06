"use client";
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

const COLORS = ["#2563eb", "#22c55e", "#eab308", "#ef4444"];

const complaintStats = [
	{ name: "Resolved", value: 120 },
	{ name: "Pending", value: 80 },
	{ name: "In Review", value: 30 },
	{ name: "Rejected", value: 15 },
];

const monthlyData = [
	{ month: "Jan", complaints: 40 },
	{ month: "Feb", complaints: 55 },
	{ month: "Mar", complaints: 70 },
	{ month: "Apr", complaints: 60 },
	{ month: "May", complaints: 90 },
	{ month: "Jun", complaints: 100 },
	{ month: "Jul", complaints: 85 },
	{ month: "Aug", complaints: 120 },
	{ month: "Sep", complaints: 95 },
];

const departmentData = [
	{ name: "Engineering", complaints: 120 },
	{ name: "Sciences", complaints: 90 },
	{ name: "Social Sci.", complaints: 70 },
	{ name: "Arts", complaints: 45 },
];

export default function AdminAnalytics() {
	return (
		<div className="p-6 space-y-6 bg-background min-h-screen">
			{/* Header */}
			<div>
				<p className="text-foreground/90">
					Track student complaint data and performance insights.
				</p>
			</div>

			{/* Top Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="shadow-md">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-foreground/90">Total Complaints</p>
							<h3 className="text-2xl font-bold text-foreground/50">245</h3>
						</div>
						<MessageSquare
							className="text-primary"
							size={30}
						/>
					</CardContent>
				</Card>

				<Card className="shadow-md">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-foreground/90">Resolved Complaints</p>
							<h3 className="text-2xl font-bold text-foreground/50">120</h3>
						</div>
						<CheckCircle
							className="text-green-500"
							size={30}
						/>
					</CardContent>
				</Card>

				<Card className="shadow-md">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-foreground/90">Pending Complaints</p>
							<h3 className="text-2xl font-bold text-foreground/50">80</h3>
						</div>
						<AlertTriangle
							className="text-yellow-500"
							size={30}
						/>
					</CardContent>
				</Card>

				<Card className="shadow-md">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-foreground/90">Active Students</p>
							<h3 className="text-2xl font-bold text-foreground/50">320</h3>
						</div>
						<Users
							className="text-primary"
							size={30}
						/>
					</CardContent>
				</Card>
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
									data={complaintStats}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={100}
									label>
									{complaintStats.map((_, index) => (
										<Cell
											key={index}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
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
							<LineChart data={monthlyData}>
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
						<BarChart data={departmentData}>
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
