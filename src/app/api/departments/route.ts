import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const organizationId = searchParams.get("organizationId");
		const where = organizationId ? { organizationId } : {};
		const departments = await prisma.department.findMany({ where });
		return NextResponse.json({ departments });
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch departments." },
			{ status: 500 }
		);
	}
}
