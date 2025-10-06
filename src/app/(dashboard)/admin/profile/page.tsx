import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import AdminProfilePage from "@/components/dashboard/admin/profile";

export const metadata: Metadata = {
	title: "Profile | Admin",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Profile">
			<AdminProfilePage />
		</DashboardLayout>
	);
}
