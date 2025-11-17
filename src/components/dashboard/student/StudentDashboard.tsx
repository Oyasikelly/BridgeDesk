"use client";
import { DashboardCards } from "@/components/dashboard/student/components/DashboardCard";
import { BarChartCard } from "./components/BarChartCards";
import { useUser } from "@/context/userContext";
import { useEffect, useState, ReactNode } from "react";
import {
	CheckCircle2,
	Clock,
	MessageSquare,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { getComplainSummary } from "@/lib/actions/getComplainSummary";

export default function StudentDashboard() {
	const { userData } = useUser();
	const [loading, setLoading] = useState(true);

	type DashboardCardProps = {
		title: string;
		desc: string;
		icon: ReactNode;
		trend: ReactNode;
		value: number;
	};

	type OverviewProps = {
		resolved: number;
		pending: number;
		department: { department: string; percentage: number }[];
	};

	const [cards, setCards] = useState<DashboardCardProps[]>([]);
	const [overview, setOverview] = useState<OverviewProps>({
		resolved: 0,
		pending: 0,
		department: [],
	});

	useEffect(() => {
		async function fetchSummary() {
			try {
				const data = await getComplainSummary({ id: userData!.id });
				// const data = await res.json();
				setOverview({
					resolved: data.resolvedComplaints || 0,
					pending: data.pendingComplaints || 0,
					department: data.byDepartment || [],
				});
				setCards([
					{
						title: "Total Complaints",
						desc: "All complaints you’ve submitted so far",
						icon: <MessageSquare className="text-primary" />,
						trend: <TrendingUp className="text-primary/80" />,
						value: data.totalComplaints || 0,
					},
					{
						title: "Resolved Complaints",
						desc: "Complaints attended to by the admin",
						icon: <CheckCircle2 className="text-green-500" />,
						trend: <TrendingUp className="text-green-500" />,
						value: data.resolvedComplaints || 0,
					},
					{
						title: "Pending Complaints",
						desc: "Awaiting admin response or feedback",
						icon: <Clock className="text-yellow-500" />,
						trend: <TrendingDown className="text-red-500" />,
						value: data.pendingComplaints || 0,
					},
					{
						title: "Rejected Complaints",
						desc: "Complaints that were rejected",
						icon: <TrendingDown className="text-red-500" />,
						trend: <TrendingDown className="text-red-500" />,
						value: data.RejectedComplaints || 0,
					},
					{
						title: "Complaint In Progress",
						desc: "Complaints currently being addressed",
						icon: <Clock className="text-yellow-500" />,
						trend: <TrendingUp className="text-yellow-500" />,
						value: data.InProgressComplaints || 0,
					},
					{
						title: "Departments Involved",
						desc: "Departments handling your complaints",
						icon: <MessageSquare className="text-purple-500" />,
						trend: <TrendingUp className="text-purple-500" />,
						value: data.byDepartment?.length,
					},
				]);
			} catch (err) {
				console.error("Error fetching complaint summary:", err);
			} finally {
				setLoading(false);
			}
		}
		if (userData?.id) fetchSummary();
	}, [userData]);

	return (
		<div className="flex min-h-screen bg-background">
			<main className="flex-1">
				<div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Section */}
					<div className="lg:col-span-2 space-y-6">
						{!loading ? (
							<>
								<DashboardCards
									name={userData?.student?.fullName ?? ""}
									cards={cards}
								/>
								{userData?.id && <BarChartCard student={{ id: userData.id }} />}
							</>
						) : (
							<div className="flex justify-center mt-10">
								<Spinner
									size="lg"
									color="primary"
								/>
							</div>
						)}
					</div>

					{/* Right Section */}
					<div className="space-y-6">
						<div className="p-4 bg-background dark:bg-primary-foreground rounded-xl shadow">
							<h2 className="font-semibold mb-3">Complaint Overview</h2>
							{loading ? (
								<div className="flex justify-center py-4">
									<Spinner
										size="sm"
										color="primary"
									/>
								</div>
							) : (
								<div className="space-y-3 text-sm text-foreground/60">
									<div className="flex justify-between items-center">
										<p>Resolved Complaints</p>
										<p className="text-green-500 font-semibold">
											{overview.resolved}
										</p>
									</div>
									<div className="flex justify-between items-center">
										<p>Pending Complaints</p>
										<p className="text-yellow-500 font-semibold">
											{overview.pending}
										</p>
									</div>
								</div>
							)}
						</div>

						<div className="p-4 bg-background dark:bg-primary-foreground rounded-xl shadow">
							<h2 className="font-semibold mb-3">By Department</h2>
							{loading ? (
								<div className="flex justify-center py-4">
									<Spinner
										size="sm"
										color="primary"
									/>
								</div>
							) : overview.department.length > 0 ? (
								overview.department.map((dept, idx) => (
									<p
										key={idx}
										className="text-sm text-foreground/60">
										{dept.percentage}% - {dept.department}
									</p>
								))
							) : (
								<p className="text-sm text-foreground/50">
									No department data available
								</p>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
