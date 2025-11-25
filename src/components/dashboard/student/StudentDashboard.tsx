"use client";
import { DashboardCards } from "@/components/dashboard/student/components/DashboardCard";
import { BarChartCard } from "./components/BarChartCards";
import { useUser } from "@/context/userContext";
import { useMemo, ReactNode } from "react";
import {
	CheckCircle2,
	Clock,
	MessageSquare,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";

type DashboardCardProps = {
	title: string;
	desc: string;
	icon: ReactNode;
	trend: ReactNode;
	value: number;
};

export default function StudentDashboard() {
	const { userData } = useUser();

	// Fetch student complaint summary with React Query (with caching)
	const { data, isLoading: loading } = useQuery({
		queryKey: ["studentComplaintSummary", userData?.id],
		queryFn: async () => {
			if (!userData?.id) throw new Error("No user ID");

			const res = await fetch(
				`/api/complaints/summary?studentId=${userData.id}`
			);
			if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);

			return await res.json();
		},
		enabled: !!userData?.id,
		staleTime: 30 * 1000, // 30 seconds
	});

	// Memoize cards to prevent recreation on every render
	const cards: DashboardCardProps[] = useMemo(() => {
		if (!data) return [];

		return [
			{
				title: "Total Complaints",
				desc: "All complaints you've submitted so far",
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
				value: data.byDepartment?.length || 0,
			},
		];
	}, [data]);

	// Memoize overview data
	const overview = useMemo(
		() => ({
			resolved: data?.resolvedComplaints || 0,
			pending: data?.pendingComplaints || 0,
			department: data?.byDepartment || [],
		}),
		[data]
	);

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
								overview.department.map(
									(dept: { department: string; percentage: number }, idx: number) => (
										<p
											key={idx}
											className="text-sm text-foreground/60">
											{dept.percentage}% - {dept.department}
										</p>
									)
								)
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
