import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import StudentsPage from "@/components/dashboard/admin/students";

export const metadata: Metadata = {
	title: "Students | Admin",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Students">
			<StudentsPage />
		</DashboardLayout>
	);
}
