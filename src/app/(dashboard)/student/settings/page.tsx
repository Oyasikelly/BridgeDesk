import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import StudentSettingsPage from "@/components/dashboard/student/settings";

export const metadata: Metadata = {
	title: " Settings | Student",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Settings">
			<StudentSettingsPage />
		</DashboardLayout>
	);
}
