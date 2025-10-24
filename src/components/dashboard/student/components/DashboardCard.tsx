"use client";

export interface DashboardCardProps {
	title: string;
	desc: string;
	icon: React.ReactNode;
	trend: React.ReactNode;
	value: number | string;
}

interface DashboardCardsProps {
	name?: string;
	cards?: DashboardCardProps[];
}

export function DashboardCards({ name, cards = [] }: DashboardCardsProps) {
	return (
		<>
			<h1 className="text-primary font-bold text-2xl md:text-3xl">
				Welcome {name} ! 👋
			</h1>
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
		</>
	);
}
