import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const adminId = searchParams.get("adminId");

		if (!adminId)
			return NextResponse.json({ error: "Admin ID required" }, { status: 400 });

        console.log(`[AdminChat] Fetching students for admin: ${adminId}`);

		// ✅ Find all categories managed by this admin
		const categories = await prisma.category.findMany({
			where: { adminId },
			select: { id: true },
		});

		const categoryIds = categories.map((c) => c.id);
        console.log(`[AdminChat] Found categories:`, categoryIds);

        if (categoryIds.length === 0) {
             return NextResponse.json({ students: [] });
        }

        if (categoryIds.length === 0) {
             return NextResponse.json({ students: [] });
        }

		// ✅ Optimization: Fetch student IDs from complaints first
        // Avoids deep nested 'some' query which can be slow or problematic
        const complaints = await prisma.complaint.findMany({
            where: {
                categoryId: { in: categoryIds }
            },
            select: { studentId: true, id: true, categoryId: true }, // Select minimal fields
            distinct: ['studentId'] // Get unique students directly from DB if possible
        });
        
        const studentIds = complaints.map(c => c.studentId).filter(Boolean); // Ensure no nulls
        console.log(`[AdminChat] Found ${studentIds.length} unique students with complaints.`);

		// ✅ Find students by IDs
		const students = await prisma.student.findMany({
			where: {
				id: { in: studentIds }
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
