import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import AllComplaintsPage from "@/components/dashboard/admin/all-complaints";

export const metadata: Metadata = {
	title: "All Complaints | Admin",
};

export default function StudentDashboardPage() {
	return (
		<DashboardLayout pageTitle="All Complaints">
			<AllComplaintsPage />
		</DashboardLayout>
	);
}
