import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import MyComplaintsPage from "@/components/dashboard/student/my-complaints";

export const metadata: Metadata = {
	title: " My Complaint | Student",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="My Complaints">
			<MyComplaintsPage />
		</DashboardLayout>
	);
}
