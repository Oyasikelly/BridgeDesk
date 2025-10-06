import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import AdminSettingsPage from "@/components/dashboard/admin/settings";

export const metadata: Metadata = {
	title: "Settings | Admin",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Settings">
			<AdminSettingsPage />
		</DashboardLayout>
	);
}
