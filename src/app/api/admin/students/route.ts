import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/admin/students
export async function GET() {
	try {
		const students = await prisma.student.findMany({
			include: {
				complaints: {
					select: {
						description: true,
						status: true,
						dateSubmitted: true,
					},
				},
			},
			orderBy: { joinedDate: "desc" },
		});

		const formattedStudents = students.map((s) => ({
			id: s.id,
			name: s.fullName,
			department: s.department,
			level: s.level,
			email: s.email,
			phone: s.phone,
			totalComplaints: s.complaints.length,
			resolvedComplaints: s.complaints.filter((c) => c.status === "RESOLVED")
				.length,
			status: s.status === "Suspended" ? "Suspended" : "Active",
			joinedDate: s.joinedDate.toLocaleDateString(),
			complaints: s.complaints.map((c) => ({
				description: c.description,
				status: c.status,
				date: c.dateSubmitted.toLocaleDateString(),
			})),
		}));

		return NextResponse.json({ students: formattedStudents });
	} catch (error) {
		console.error("Error fetching students:", error);
		return NextResponse.json(
			{ error: "Failed to load students" },
			{ status: 500 }
		);
	}
}
