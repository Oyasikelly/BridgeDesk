import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
	try {
		// Fetch all active organizations
		const organizations = await prisma.organization.findMany({
			where: {
				isActive: true,
			},
			select: {
				id: true,
				name: true,
				// type: true,
				address: true,
				domain: true,
				email: true,
				logoUrl: true,
				phone: true,
				slug: true,
				subscriptionPlan: true,
			},
			orderBy: {
				name: "asc",
			},
		});

		return NextResponse.json({ organizations });
	} catch (error) {
		console.error("Error fetching organizations:", error);
		return NextResponse.json(
			{ error: "Failed to fetch organizations" },
			{ status: 500 }
		);
	}
}
