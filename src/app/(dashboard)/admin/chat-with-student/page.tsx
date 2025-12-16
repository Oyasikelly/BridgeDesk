import { Metadata } from "next";
import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import AdminChatPage from "@/components/dashboard/admin/chat-with-student";

export const metadata: Metadata = {
	title: "Chat | Admin",
};

export const dynamic = "force-dynamic";

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Chat">
            <Suspense fallback={<div className="p-4">Loading chat...</div>}>
			    <AdminChatPage />
            </Suspense>
		</DashboardLayout>
	);
}
