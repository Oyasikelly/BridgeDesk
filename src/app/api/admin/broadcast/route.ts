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

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, message, type = "INFO", target = "ALL" } = await req.json();

        if (!title || !message) {
            return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
        }

        const orgId = user.organizationId;
        if (!orgId) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // 1. Fetch target users in the organization
        const targetAdmins = target === "ALL" || target === "ADMINS" 
            ? await prisma.admin.findMany({ where: { user: { organizationId: orgId } } }) 
            : [];
        
        const targetStudents = target === "ALL" || target === "STUDENTS"
            ? await prisma.student.findMany({ where: { user: { organizationId: orgId } } })
            : [];

        // 2. Create notifications for each user
        // Note: In a large system, this should be a background job.
        // For this scale, we'll do it sequentially or with Promise.all
        
        const adminNotifications = targetAdmins.map(admin => ({
            title,
            message,
            type,
            adminId: admin.id
        }));

        const studentNotifications = targetStudents.map(student => ({
            title,
            message,
            type,
            studentId: student.id
        }));

        // Batch create (Prisma createMany is available for some providers)
        if (adminNotifications.length > 0) {
            await prisma.notification.createMany({
                data: adminNotifications
            });
        }

        if (studentNotifications.length > 0) {
            await prisma.notification.createMany({
                data: studentNotifications
            });
        }

        // 3. Log the activity
        await prisma.activityLog.create({
            data: {
                action: `BROADCAST: ${title}`,
                adminId: (await prisma.admin.findUnique({ where: { userId: user.id } }))?.id,
                ipAddress: req.headers.get("x-forwarded-for") || "unknown"
            }
        });

        return NextResponse.json({ 
            success: true, 
            recipients: adminNotifications.length + studentNotifications.length 
        }, { status: 201 });

    } catch (error) {
        console.error("Error sending broadcast:", error);
        return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 });
    }
}
