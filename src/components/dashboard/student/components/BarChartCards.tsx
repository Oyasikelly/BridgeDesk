"use client";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

export function BarChartCard({ student }: { student: { id: string } }) {
	// Fetch bar chart data with React Query (with caching)
	const { data } = useQuery({
		queryKey: ["complaintBarChart", student.id],
		queryFn: async () => {
			const res = await fetch(
				`/api/complaints/barChartStats?studentId=${student.id}`
			);
			if (!res.ok) throw new Error("Failed to fetch chart data");
			const json = await res.json();
			return json.data || [];
		},
		enabled: !!student.id,
		staleTime: 60 * 1000, // 1 minute
	});

	return (
		<div className="bg-white p-6 rounded-xl shadow dark:bg-primary-foreground">
			<h2 className="font-semibold mb-4">Complaint Activity Overview</h2>
			<p className="text-sm text-gray-500 mb-3">
				Monthly record of submitted and resolved complaints
			</p>
			<div className="w-full h-64">
				<ResponsiveContainer
					width="100%"
					height="100%">
					<BarChart data={data || []}>
						<XAxis dataKey="name" />
						<YAxis />
						<Tooltip />
						<Bar
							dataKey="pending"
							fill="oklch(72.227% 0.1991 147.514)"
							name="Pending"
						/>
						<Bar
							dataKey="resolved"
							fill="oklch(50.227% 0.1991 147.514)"
							name="Resolved"
						/>
						<Bar
							dataKey="inProgress"
							fill="oklch(70.227% 0.1991 247.514)"
							name="In Progress"
						/>
						<Bar
							dataKey="rejected"
							fill="oklch(30.227% 0.1991 147.514)"
							name="Rejected"
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
