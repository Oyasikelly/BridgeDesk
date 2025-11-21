import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH /api/admin/students/:id
export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const { status } = await req.json();

		const updated = await prisma.student.update({
			where: { id },
			data: { status },
		});

		return NextResponse.json({ success: true, updated });
	} catch (error) {
		console.error("Error updating student status:", error);
		return NextResponse.json(
			{ error: "Failed to update student status" },
			{ status: 500 }
		);
	}
}
