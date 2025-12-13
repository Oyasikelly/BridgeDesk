import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const studentId = searchParams.get("studentId"); // This is likely the PK (cuid)

		if (!studentId) {
			return NextResponse.json(
				{ error: "Missing studentId parameter" },
				{ status: 400 }
			);
		}

		// ✅ Fetch all complaints for the student
		const complaints = await prisma.complaint.findMany({
			where: { studentId }, // Optimized: query by FK directly
			select: { status: true, dateSubmitted: true },
			orderBy: { dateSubmitted: "asc" },
		});

		if (!complaints.length) {
			return NextResponse.json({
				message: "No complaints found for this student",
				data: [],
			});
		}

		// ✅ Helper to convert month number → short name
		const monthNames = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];

		// ✅ Group complaints by month
		const monthlyData: Record<
			string,
			{
				complaints: number;
				resolved: number;
				inProgress: number;
				rejected: number;
				pending: number;
			}
		> = {};

		complaints.forEach((c) => {
			const monthName = monthNames[c.dateSubmitted.getMonth()];
			if (!monthlyData[monthName]) {
				monthlyData[monthName] = {
					complaints: 0,
					resolved: 0,
					inProgress: 0,
					rejected: 0,
					pending: 0,
				};
			}

			monthlyData[monthName].complaints++;

			switch (c.status.toUpperCase()) {
				case "RESOLVED":
					monthlyData[monthName].resolved++;
					break;
				case "IN_PROGRESS":
					monthlyData[monthName].inProgress++;
					break;
				case "REJECTED":
					monthlyData[monthName].rejected++;
					break;
				case "PENDING":
					monthlyData[monthName].pending++;
					break;
			}
		});

		// ✅ Convert object → sorted array
		const monthlyArray = Object.entries(monthlyData)
			.map(([month, data]) => ({
				name: month,
				...data,
			}))
			.sort((a, b) => monthNames.indexOf(a.name) - monthNames.indexOf(b.name));

		return NextResponse.json({ data: monthlyArray });
	} catch (error) {
		console.error("Error fetching complaint summary:", error);
		return NextResponse.json(
			{ error: "Failed to fetch complaint summary" },
			{ status: 500 }
		);
	}
}
