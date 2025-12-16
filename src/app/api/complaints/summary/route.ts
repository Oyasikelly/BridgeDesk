import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const studentId = searchParams.get("studentId");
		// const filter: Prisma.ComplaintWhereInput = {};

		if (!studentId) {
			return NextResponse.json(
				{ error: "Missing studentId parameter" },
				{ status: 400 }
			);
		}

		// Fetch all complaints for the student
		// const allComplaints = await prisma.complaint.findMany({
		// 	where: filter,
		// 	include: {
		// 		category: true,
		// 		assignedAdmin: true,
		// 		student: true,
		// 	},
		// 	orderBy: { dateSubmitted: "desc" },
		// });
		const allComplaints = await prisma.complaint.findMany({
			where: { student: { userId: studentId } },
			select: { status: true, dateSubmitted: true },
			orderBy: { dateSubmitted: "asc" },
		});

		console.log("Student complaints:", allComplaints);

		const totalComplaints = allComplaints.length;

		const resolvedComplaints = allComplaints.filter(
			(c) => c.status.toUpperCase() === "RESOLVED"
		).length;

		const pendingComplaints = allComplaints.filter(
			(c) => c.status.toUpperCase() === "PENDING"
		).length;
		const RejectedComplaints = allComplaints.filter(
			(c) => c.status.toUpperCase() === "REJECTED"
		).length;
		const InProgressComplaints = allComplaints.filter(
			(c) => c.status.toUpperCase() === "IN_PROGRESS"
		).length;

		const grouped = await prisma.complaint.groupBy({
			by: ["departmentId"],
			where: { student: { userId: studentId } },
			_count: { _all: true },
		});

		const departmentIds = grouped
			.map((g) => g.departmentId)
			.filter((id): id is string => id != null);

		const departments = await prisma.department.findMany({
			where: { id: { in: departmentIds } },
			select: { id: true, name: true },
		});

		const byDepartment = grouped.map((g) => {
			const dept = departments.find((d) => d.id === g.departmentId);
			const percentage =
				totalComplaints > 0
					? ((g._count._all / totalComplaints) * 100).toFixed(1)
					: "0";

			return {
				department: dept?.name || "Unknown",
				count: g._count._all,
				percentage,
			};
		});

		return NextResponse.json({
			totalComplaints,
			resolvedComplaints,
			pendingComplaints,
			RejectedComplaints,
			InProgressComplaints,
			byDepartment,
		});
	} catch (error) {
		console.error("Error fetching complaint summary:", error);
		return NextResponse.json(
			{ error: "Failed to fetch complaint summary" },
			{ status: 500 }
		);
	}
}
