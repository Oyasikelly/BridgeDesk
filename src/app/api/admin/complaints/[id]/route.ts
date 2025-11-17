import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { prisma } from "@/lib/db";

// PATCH: /api/admin/complaints/[id]
export async function PATCH(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;
		const { status } = await req.json();

		if (!status) {
			return NextResponse.json(
				{ error: "Status is required" },
				{ status: 400 }
			);
		}
		// Update complaint status in the database
		revalidateTag("all-complaints");
		const updatedComplaint = await prisma.complaint.update({
			where: { id },
			data: { status },
		});

		return NextResponse.json({ complaint: updatedComplaint });
	} catch (error) {
		console.error("Error updating complaint status:", error);
		return NextResponse.json(
			{ error: "Failed to update complaint status" },
			{ status: 500 }
		);
	}
}
