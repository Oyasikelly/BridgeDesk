"use client";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const data = [
	{ name: "Jan", complaints: 12, resolved: 8 },
	{ name: "Feb", complaints: 18, resolved: 15 },
	{ name: "Mar", complaints: 10, resolved: 7 },
	{ name: "Apr", complaints: 20, resolved: 18 },
	{ name: "May", complaints: 14, resolved: 12 },
];

export function BarChartCard() {
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
					<BarChart data={data}>
						<XAxis dataKey="name" />
						<YAxis />
						<Tooltip />
						<Bar
							dataKey="complaints"
							fill="oklch(72.227% 0.1991 147.514)"
							name="Complaints"
						/>
						<Bar
							dataKey="resolved"
							fill="oklch(50.227% 0.1991 147.514)"
							name="Resolved"
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
