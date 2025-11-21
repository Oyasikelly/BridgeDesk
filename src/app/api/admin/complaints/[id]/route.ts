import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH: /api/admin/complaints/[id]
export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const { status } = await req.json();

		if (!status) {
			return NextResponse.json(
				{ error: "Status is required" },
				{ status: 400 }
			);
		}

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

// import { NextRequest } from 'next/server';

// export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   // Implement your PATCH logic here using the id and req.
//   // Return a Response or NextResponse.
//   return new Response(JSON.stringify({ id }), {
//     status: 200,
//     headers: { 'Content-Type': 'application/json' },
//   });
// }
