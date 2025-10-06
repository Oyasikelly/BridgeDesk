"use client";
import {
	TrendingUp,
	TrendingDown,
	MessageSquare,
	CheckCircle2,
	Clock,
} from "lucide-react";

export function DashboardCards() {
	const cards = [
		{
			title: "Total Complaints",
			desc: "All complaints you’ve submitted so far",
			icon: <MessageSquare className="text-primary" />,
			trend: <TrendingUp className="text-primary/80" />,
			value: "23",
		},
		{
			title: "Resolved Complaints",
			desc: "Complaints attended to by the admin",
			icon: <CheckCircle2 className="text-green-500" />,
			trend: <TrendingUp className="text-green-500" />,
			value: "18",
		},
		{
			title: "Pending Complaints",
			desc: "Awaiting admin response or feedback",
			icon: <Clock className="text-yellow-500" />,
			trend: <TrendingDown className="text-red-500" />,
			value: "5",
		},
	];

	return (
		<div className="bg-white p-6 rounded-xl shadow dark:bg-primary-foreground">
			<h2 className="font-semibold mb-4">My Complaint Summary</h2>
			<div className="space-y-4">
				{cards.map((card, index) => (
					<div
						key={index}
						className="flex justify-between items-center border-b pb-3 last:border-0">
						<div className="flex items-center gap-3">
							{card.icon}
							<div>
								<p className="font-semibold">{card.title}</p>
								<p className="text-sm text-gray-500">{card.desc}</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{card.trend}
							<p className="font-semibold">{card.value}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
