import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET → Fetch all categories
export async function GET() {
	try {
		const categories = await prisma.category.findMany({
			orderBy: { name: "asc" }, // optional: sort alphabetically
		});

		return NextResponse.json({ categories }, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching categories:", error);
		return NextResponse.json(
			{ error: "Failed to fetch categories" },
			{ status: 500 }
		);
	}
}
