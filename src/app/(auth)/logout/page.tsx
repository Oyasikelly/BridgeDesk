import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import LogoutPage from "@/components/dashboard/logout";

export const metadata: Metadata = {
	title: "Logout",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Logout">
			<LogoutPage />
		</DashboardLayout>
	);
}
