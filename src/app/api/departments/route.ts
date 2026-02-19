import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

// Helper to get authenticated user and their DB profile
async function getAuthenticatedUser(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
    if (error || !authUser || !authUser.email) return null;

    const dbUser = await prisma.user.findUnique({
        where: { email: authUser.email },
        include: { organization: true }
    });
    
    return dbUser;
}

export async function GET(req: NextRequest) {
	try {
        const user = await getAuthenticatedUser(req);
        if (!user || !user.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

		const departments = await prisma.department.findMany({
            where: { organizationId: user.organizationId },
            orderBy: { name: "asc" }
        });
		return NextResponse.json({ departments });
	} catch (error) {
        console.error("Error fetching departments:", error);
		return NextResponse.json(
			{ error: "Failed to fetch departments." },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || !user.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
        }

        const { name, description } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Department name is required" }, { status: 400 });
        }

        const department = await prisma.department.create({
            data: {
                name,
                description,
                organizationId: user.organizationId
            }
        });

        return NextResponse.json({ department }, { status: 201 });
    } catch (error) {
        console.error("Error creating department:", error);
        return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
    }
}
