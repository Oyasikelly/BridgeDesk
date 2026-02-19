import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

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
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const organization = await prisma.organization.findUnique({
            where: { id: user.organizationId! }
        });

        return NextResponse.json({ organization }, { status: 200 });
    } catch (error) {
        console.error("Error fetching organization:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        
        // Filter allowed fields for security
        const allowedFields = ["name", "email", "phone", "address"];
        const updateData: any = {};
        
        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        });

        const updatedOrg = await prisma.organization.update({
            where: { id: user.organizationId! },
            data: updateData
        });

        return NextResponse.json({ organization: updatedOrg }, { status: 200 });

    } catch (error) {
        console.error("Error updating organization:", error);
        return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
    }
}
