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

        const { searchParams } = new URL(req.url);
        const roleFilter = searchParams.get("role") || "ALL";

        if (roleFilter === "STUDENT") {
            const students = await prisma.student.findMany({
                where: {
                    user: {
                        organizationId: user.organizationId
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            name: true
                        }
                    }
                }
            });
            
            const users = students.map(s => ({
                id: s.id,
                userId: s.userId,
                fullName: s.fullName || s.user.name,
                email: s.user.email,
                role: s.user.role,
                status: s.status
            }));

            return NextResponse.json({ users }, { status: 200 });
        }

        // Default: Fetch all users in the same organization who are not STUDENTS
        const admins = await prisma.admin.findMany({
            where: {
                user: {
                    organizationId: user.organizationId,
                    role: {
                        not: "STUDENT"
                    }
                }
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                userId: true
            }
        });

        const users = admins.map(a => ({
            id: a.id,
            userId: a.userId,
            fullName: a.fullName,
            email: a.email,
            role: a.role,
            status: "Active"
        }));

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user list:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
