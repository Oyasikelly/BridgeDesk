import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import AdminDashboard from "@/components/dashboard/admin/adminDashboard";

export const metadata: Metadata = {
	title: "Admin",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="Dashboard">
			<AdminDashboard />
		</DashboardLayout>
	);
}
