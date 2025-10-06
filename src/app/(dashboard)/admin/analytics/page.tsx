import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import AdminAnalytics from "@/components/dashboard/admin/analytics";

export const metadata: Metadata = {
	title: "Analytics | Admin",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Analytics">
			<AdminAnalytics />
		</DashboardLayout>
	);
}
