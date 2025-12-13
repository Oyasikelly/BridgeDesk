import { Metadata } from "next";
import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import StudentChatPage from "@/components/dashboard/student/StudentChatPage";

export const metadata: Metadata = {
	title: "Chat With Admin | Student",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Chat With Admin">
            <Suspense fallback={<div className="p-4">Loading chat...</div>}>
			    <StudentChatPage />
            </Suspense>
		</DashboardLayout>
	);
}
