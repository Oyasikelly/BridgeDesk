import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * POST → Submit a new complaint
 * GET → Fetch complaints by studentId or categoryId
 */

export async function POST(req: NextRequest) {
	try {
		const { title, description, categoryId, studentId } = await req.json();

		if (!title || !description || !categoryId || !studentId) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		const category = await prisma.category.findUnique({
			where: { id: categoryId },
			include: { admin: true },
		});

		console.log("Fetched Category:", category);
		if (!category) {
			return NextResponse.json(
				{ error: "Invalid category selected" },
				{ status: 404 }
			);
		}

		const adminId = category.admin?.id || null;

		const complaint = await prisma.complaint.create({
			data: {
				title,
				description,
				categoryId,
				studentId,
				status: "PENDING",
				adminId,
				departmentId: studentId?.departmentId || null,
			},
			include: {
				category: true,
				assignedAdmin: true,
				student: true,
			},
		});

		return NextResponse.json(
			{ message: "Complaint submitted successfully", complaint },
			{ status: 201 }
		);
	} catch (error: unknown) {
		console.error("Error creating complaint:", error);
		return NextResponse.json(
			{ error: "Failed to create complaint" },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const studentId = searchParams.get("studentId");
		const categoryId = searchParams.get("categoryId");

		const filter: Prisma.ComplaintWhereInput = {};
		if (studentId) filter.studentId = studentId;
		if (categoryId) filter.categoryId = categoryId;

		if (!studentId && !categoryId) {
			return NextResponse.json(
				{ error: "Either studentId or categoryId is required" },
				{ status: 400 }
			);
		}

		const complaints = await prisma.complaint.findMany({
			where: filter,
			include: {
				category: true,
				assignedAdmin: true,
				student: true,
			},
			orderBy: { dateSubmitted: "desc" },
		});

		const totalComplaints = complaints.length;

		const resolvedComplaints = complaints.filter(
			(c) => c.status.toUpperCase() === "RESOLVED"
		).length;

		const pendingComplaints = complaints.filter(
			(c) => c.status.toUpperCase() === "PENDING"
		).length;
		const RejectedComplaints = complaints.filter(
			(c) => c.status.toUpperCase() === "REJECTED"
		).length;

		return NextResponse.json(
			{
				complaints,
				totalComplaints,
				resolvedComplaints,
				pendingComplaints,
				RejectedComplaints,
			},
			{ status: 200 }
		);
	} catch (error: unknown) {
		console.error("Error fetching complaints:", error);
		return NextResponse.json(
			{ error: "Failed to fetch complaints" },
			{ status: 500 }
		);
	}
}
