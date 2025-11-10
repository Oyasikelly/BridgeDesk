// src/app/api/admin/chat/complaints/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const adminId = searchParams.get("adminId");
		const studentId = searchParams.get("studentId");

		if (!adminId || !studentId) {
			return NextResponse.json(
				{ error: "Missing adminId or studentId" },
				{ status: 400 }
			);
		}

		// ✅ Get categories managed by this admin
		const categories = await prisma.category.findMany({
			where: { adminId },
			select: { id: true },
		});
		const categoryIds = categories.map((c) => c.id);
		if (categoryIds.length === 0) {
			return NextResponse.json({ complaints: [] });
		}
		// ✅ Get all complaints by the student within those categories
		const complaints = await prisma.complaint.findMany({
			where: {
				studentId,
				categoryId: { in: categoryIds },
			},
			select: {
				id: true,
				title: true,
				status: true,
				category: { select: { name: true } },
				dateSubmitted: true,
			},
			orderBy: { dateSubmitted: "desc" },
		});

		return NextResponse.json({ complaints });
	} catch (error) {
		console.error("❌ Error fetching complaints:", error);
		return NextResponse.json(
			{ error: "Failed to fetch complaints" },
			{ status: 500 }
		);
	}
}
