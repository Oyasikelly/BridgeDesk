import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import AdminChatPage from "@/components/dashboard/admin/chat-with-student";

export const metadata: Metadata = {
	title: "Chat | Admin",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Chat">
			<AdminChatPage />
		</DashboardLayout>
	);
}
