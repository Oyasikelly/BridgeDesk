import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import ChatWithAdmin from "@/components/dashboard/student/chat-with-admin";

export const metadata: Metadata = {
	title: "Chat With Admin | Student",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Chat With Admin">
			<ChatWithAdmin />
		</DashboardLayout>
	);
}
