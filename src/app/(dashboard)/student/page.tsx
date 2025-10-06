import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import StudentDashboard from "@/components/dashboard/student/StudentDashboard";

export const metadata: Metadata = {
	title: "Student",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Dashboard">
			<StudentDashboard />
		</DashboardLayout>
	);
}
