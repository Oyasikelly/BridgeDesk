import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import StudentChatPage from "@/components/dashboard/student/StudentChatPage";

export const metadata: Metadata = {
	title: "Chat With Admin | Student",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Chat With Admin">
			<StudentChatPage />
		</DashboardLayout>
	);
}
