import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: /api/admin/complaints?adminId=<adminId>
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const adminId = searchParams.get("adminId");

		if (!adminId) {
			return NextResponse.json(
				{ error: "Missing adminId in request" },
				{ status: 400 }
			);
		}

		// 🔹 Find all categories assigned to this admin
		const categories = await prisma.category.findMany({
			where: { adminId },
			select: { id: true, name: true },
		});

		const categoryIds = categories.map((c) => c.id);

		// 🔹 Get complaints under these categories
		const complaints = await prisma.complaint.findMany({
			where: {
				categoryId: { in: categoryIds },
			},
			include: {
				student: { select: { fullName: true, id: true } },
				category: { select: { name: true } },
			},
			orderBy: { dateSubmitted: "desc" },
		});

		// 🔹 Use Prisma count for pending complaints
		const totalPending = await prisma.complaint.count({
			where: {
				categoryId: { in: categoryIds },
				status: "PENDING",
			},
		});

		// 🔹 Shape response data
		const formattedComplaints = complaints.map((c) => ({
			id: c.id,
			studentId: c.student.id,
			studentName: c.student.fullName,
			title: c.title,
			category: c.category?.name ?? "Unknown",
			status: c.status,
			date: c.dateSubmitted.toLocaleDateString(),
			description: c.description,
		}));

		return NextResponse.json({ complaints: formattedComplaints, totalPending });
	} catch (error) {
		console.error("Error fetching admin complaints:", error);
		return NextResponse.json(
			{ error: "Failed to fetch complaints" },
			{ status: 500 }
		);
	}
}
