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

        // Fetch logs for all users in the organization
        const logs = await prisma.activityLog.findMany({
            where: {
                OR: [
                    { admin: { user: { organizationId: user.organizationId } } },
                    { student: { user: { organizationId: user.organizationId } } }
                ]
            },
            include: {
                admin: { select: { fullName: true, email: true } },
                student: { select: { fullName: true, email: true } }
            },
            orderBy: { timestamp: "desc" },
            take: 100 // Limit to latest 100 logs
        });

        return NextResponse.json({ logs }, { status: 200 });
    } catch (error) {
        console.error("Error fetching activity logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
