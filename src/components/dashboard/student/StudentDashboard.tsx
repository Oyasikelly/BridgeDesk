import { DashboardCards } from "@/components/dashboard/student/components/DashboardCard";
import { BarChartCard } from "./components/BarChartCards";

export default function StudentDashboard() {
	return (
		<div className="flex min-h-screen bg-background">
			<main className="flex-1">
				<div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-6">
						<DashboardCards />
						<BarChartCard />
					</div>

					<div className="space-y-6 ">
						<div className="p-4 bg-background dark:bg-primary-foreground rounded-xl shadow">
							<h2 className="font-semibold mb-3">Advanced Statistic</h2>
							<div className="space-y-3 text-sm text-foreground/60">
								<div className="flex justify-between items-center">
									<p>Task A</p>
									<p className="text-green-500 font-semibold">+ $200</p>
								</div>
								<div className="flex justify-between items-center">
									<p>Task B</p>
									<p className="text-green-500 font-semibold">+ $200</p>
								</div>
							</div>
						</div>

						<div className="p-4 bg-background dark:bg-primary-foreground rounded-xl shadow">
							<h2 className="font-semibold mb-3">By Country</h2>
							<p className="text-sm text-foreground/60">50% in Borcelle</p>
							<p className="text-sm text-foreground/60">50% in Fauget</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
