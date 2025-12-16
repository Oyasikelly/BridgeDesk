import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

// Helper to get authenticated user and their DB profile
async function getAuthenticatedUser(req: NextRequest) {
    // 1. Get token from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;
    const token = authHeader.replace("Bearer ", "");

    // 2. Validate with Supabase
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
    
    if (error || !authUser || !authUser.email) return null;

    // 3. Get DB user with Organization
    const dbUser = await prisma.user.findUnique({
        where: { email: authUser.email },
        include: { organization: true }
    });
    
    return dbUser;
}

// GET → Fetch all categories (Scoped to Organization)
export async function GET(req: NextRequest) {
	try {
        const user = await getAuthenticatedUser(req);
        if (!user || !user.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

		const { searchParams } = new URL(req.url);
		const includeAdmins = searchParams.get("includeAdmins") === "true";

	// ... inside component
        const whereClause = {
            organization: { id: user.organizationId }
        };
		const categories = await prisma.category.findMany({
            where: whereClause,
			orderBy: { name: "asc" },
			include: includeAdmins
				? {
						admin: {
							select: {
								id: true,
								fullName: true,
								email: true,
							},
						},
				  }
				: undefined,
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

// POST → Create a new category (Scoped to Organization, SUPER_ADMIN only)
export async function POST(req: NextRequest) {
	try {
        const user = await getAuthenticatedUser(req);
        if (!user || !user.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // Strict Role Check: Only SUPER_ADMIN
        if (user.role !== "SUPER_ADMIN") {
             return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
        }

		const { name, description } = await req.json();

		if (!name) {
			return NextResponse.json(
				{ error: "Name is required" },
				{ status: 400 }
			);
		}

    // ... inside component
        const createData = {
            name,
            description,
            organization: { connect: { id: user.organizationId } }
        };
		const category = await prisma.category.create({
			data: createData
		});

		return NextResponse.json({ category }, { status: 201 });
	} catch (error) {
		console.error("Error creating category:", error);
		return NextResponse.json(
			{ error: "Failed to create category" },
			{ status: 500 }
		);
	}
}

// PATCH → Assign Admin to Category (Scoped to Organization)
export async function PATCH(req: NextRequest) {
	try {
        const user = await getAuthenticatedUser(req);
        if (!user || !user.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
         if (user.role !== "SUPER_ADMIN") {
             return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
        }

		const { categoryId, adminId } = await req.json();

		if (!categoryId) {
			return NextResponse.json(
				{ error: "Category ID is required" },
				{ status: 400 }
			);
		}
        
        // Ensure Category belongs to Org
        const categoryCheck = await prisma.category.findUnique({
            where: { id: categoryId }
        });
        
        if (!categoryCheck || categoryCheck.organizationId !== user.organizationId) {
            return NextResponse.json({ error: "Category not found or access denied" }, { status: 404 });
        }

		// Update the category
		const category = await prisma.category.update({
			where: { id: categoryId },
			data: {
				adminId: adminId || null, // Allow unassigning by passing null
			},
		});

		return NextResponse.json({ category }, { status: 200 });
	} catch (error) {
		console.error("Error updating category:", error);
		return NextResponse.json(
			{ error: "Failed to update category" },
			{ status: 500 }
		);
	}
}
