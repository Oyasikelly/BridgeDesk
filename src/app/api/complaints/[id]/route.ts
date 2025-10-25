import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type {
	Complaint as PrismaComplaint,
	Category as PrismaCategory,
} from "@prisma/client";

export interface Params {
	id: string;
}

export type ComplaintWithCategory = PrismaComplaint & {
	category: PrismaCategory | null;
};

export interface ErrorResponse {
	error: string;
}

export interface SuccessResponse {
	complaint: ComplaintWithCategory | null;
}

export async function GET(
	req: Request,
	{ params }: { params: Params }
): Promise<NextResponse> {
	try {
		const complaint = (await prisma.complaint.findUnique({
			where: { id: params.id },
			include: { category: true },
		})) as ComplaintWithCategory | null;

		if (!complaint)
			return NextResponse.json(
				{ error: "Complaint not found" } as ErrorResponse,
				{ status: 404 }
			);

		return NextResponse.json({ complaint } as SuccessResponse);
	} catch (error) {
		console.error("Error fetching complaint:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" } as ErrorResponse,
			{ status: 500 }
		);
	}
}
