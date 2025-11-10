import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
	try {
		// === BASIC COUNTS ===
		const totalComplaints = await prisma.complaint.count();

		const resolvedCount = await prisma.complaint.count({
			where: { status: "RESOLVED" },
		});
		const pendingCount = await prisma.complaint.count({
			where: { status: "PENDING" },
		});
		const inReviewCount = await prisma.complaint.count({
			where: { status: "IN_PROGRESS" },
		});
		const rejectedCount = await prisma.complaint.count({
			where: { status: "REJECTED" },
		});

		const activeStudents = await prisma.student.count({
			where: { status: "Active" },
		});

		// === MONTHLY COMPLAINTS ===
		const monthlyComplaints = await prisma.complaint.findMany({
			select: {
				dateSubmitted: true,
			},
		});

		// Count how many complaints per month
		const monthlyData: { month: string; complaints: number }[] = [];
		const monthCounts: Record<string, number> = {};

		monthlyComplaints.forEach((item) => {
			const month = item.dateSubmitted.toLocaleString("default", {
				month: "short",
			});
			monthCounts[month] = (monthCounts[month] || 0) + 1;
		});

		for (const [month, complaints] of Object.entries(monthCounts)) {
			monthlyData.push({ month, complaints });
		}

		// === DEPARTMENTAL COMPLAINTS ===
		const departments = await prisma.department.findMany({
			include: {
				complaints: true,
			},
		});

		const departmentData = departments.map((d) => ({
			name: d.name,
			complaints: d.complaints.length,
		}));

		// === PIE CHART DATA ===
		const complaintStats = [
			{ name: "Resolved", value: resolvedCount },
			{ name: "Pending", value: pendingCount },
			{ name: "In Review", value: inReviewCount },
			{ name: "Rejected", value: rejectedCount },
		];

		// === RETURN RESPONSE ===
		return NextResponse.json({
			totalComplaints,
			resolvedCount,
			pendingCount,
			inReviewCount,
			rejectedCount,
			activeStudents,
			complaintStats,
			monthlyData,
			departmentData,
		});
	} catch (error) {
		console.error("❌ Error loading admin analytics:", error);
		return NextResponse.json(
			{ error: "Failed to fetch analytics" },
			{ status: 500 }
		);
	}
}
