import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const adminId = searchParams.get("adminId");

		if (!adminId)
			return NextResponse.json({ error: "Admin ID required" }, { status: 400 });

		// ✅ Find all categories managed by this admin
		const categories = await prisma.category.findMany({
			where: { adminId },
			select: { id: true },
		});

		const categoryIds = categories.map((c) => c.id);

		// ✅ Find students who have complaints in these categories
		const students = await prisma.student.findMany({
			where: {
				complaints: {
					some: {
						categoryId: { in: categoryIds },
					},
				},
			},
			select: {
				id: true,
				fullName: true,
				department: true,
				level: true,
			},
		});

		return NextResponse.json({ students });
	} catch (error) {
		console.error("❌ Error fetching students:", error);
		return NextResponse.json(
			{ error: "Failed to fetch students" },
			{ status: 500 }
		);
	}
}
