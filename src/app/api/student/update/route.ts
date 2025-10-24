import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest) {
	try {
		const { id, fullName, email, phone, hostel, avatarUrl } = await req.json();

		if (!id) {
			return NextResponse.json(
				{ error: "Missing student ID" },
				{ status: 400 }
			);
		}

		const updatedStudent = await prisma.student.update({
			where: { id },
			data: {
				fullName,
				email,
				phone,
				hostel,
				avatarUrl,
			},
		});

		return NextResponse.json({ student: updatedStudent }, { status: 200 });
	} catch (error) {
		console.error("Error updating student profile:", error);
		return NextResponse.json(
			{ error: "Failed to update student profile" },
			{ status: 500 }
		);
	}
}
