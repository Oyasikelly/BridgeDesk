import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const adminId = searchParams.get("adminId");

		if (!adminId) {
			return NextResponse.json({ error: "Missing admin ID" }, { status: 400 });
		}

		// Get all categories assigned to this admin
		const categories = await prisma.category.findMany({
			where: { adminId },
			select: { id: true },
		});
		const categoryIds = categories.map((c) => c.id);

		if (categoryIds.length === 0) {
			return NextResponse.json({
				stats: {
					totalComplaints: 0,
					resolvedCount: 0,
					pendingCount: 0,
					inProgressCount: 0,
					rejectedCount: 0,
				},
				recentComplaints: [],
				chartData: [],
			});
		}

		// Filter complaints under this admin’s categories
		const totalComplaints = await prisma.complaint.count({
			where: { categoryId: { in: categoryIds } },
		});

		const resolvedCount = await prisma.complaint.count({
			where: { categoryId: { in: categoryIds }, status: "RESOLVED" },
		});

		const pendingCount = await prisma.complaint.count({
			where: { categoryId: { in: categoryIds }, status: "PENDING" },
		});

		const inProgressCount = await prisma.complaint.count({
			where: { categoryId: { in: categoryIds }, status: "IN_PROGRESS" },
		});

		const rejectedCount = await prisma.complaint.count({
			where: { categoryId: { in: categoryIds }, status: "REJECTED" },
		});

		// Recent complaints (5 latest)
		const recentComplaints = await prisma.complaint.findMany({
			where: { categoryId: { in: categoryIds } },
			orderBy: { dateSubmitted: "desc" },
			take: 5,
			include: {
				student: true,
				category: { select: { name: true } },
			},
		});

		// Generate monthly chart data for this year
		const complaintsThisYear = await prisma.complaint.findMany({
			where: {
				categoryId: { in: categoryIds },
				dateSubmitted: {
					gte: new Date(new Date().getFullYear(), 0, 1),
				},
			},
			select: {
				status: true,
				dateSubmitted: true,
			},
		});

		// Process chart data
		const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
			month: new Date(0, i).toLocaleString("default", { month: "short" }),
			resolved: 0,
			pending: 0,
			inProgress: 0,
			rejected: 0,
		}));

		complaintsThisYear.forEach((c) => {
			const monthIndex = new Date(c.dateSubmitted).getMonth();
			if (c.status === "RESOLVED") monthlyStats[monthIndex].resolved++;
			else if (c.status === "PENDING") monthlyStats[monthIndex].pending++;
			else if (c.status === "IN_PROGRESS")
				monthlyStats[monthIndex].inProgress++;
			else if (c.status === "REJECTED") monthlyStats[monthIndex].rejected++;
		});

		return NextResponse.json({
			stats: {
				totalComplaints,
				resolvedCount,
				pendingCount,
				inProgressCount,
				rejectedCount,
			},
			recentComplaints: recentComplaints.map((c) => ({
				id: c.id,
				student: c.student?.fullName || "Unknown",
				category: c.category?.name || "Uncategorized",
				title: c.title,
				status: c.status,
				date: c.dateSubmitted.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				}),
			})),
			chartData: monthlyStats,
		});
	} catch (error) {
		console.error("❌ Error loading admin dashboard:", error);
		return NextResponse.json(
			{ error: "Failed to load admin dashboard" },
			{ status: 500 }
		);
	}
}
