import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import StudentProfilePage from "@/components/dashboard/student/profile";

export const metadata: Metadata = {
	title: "Profile | Student",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Profile">
			<StudentProfilePage />
		</DashboardLayout>
	);
}
