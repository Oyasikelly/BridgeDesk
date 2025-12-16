
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const adminId = searchParams.get("adminId");
        const studentId = searchParams.get("studentId");

        if (!adminId && !studentId) {
            return NextResponse.json({ error: "Missing adminId or studentId" }, { status: 400 });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { adminId: adminId || undefined },
                    { studentId: studentId || undefined }
                ]
            },
            take: 20,
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json({ notifications }, { status: 200 });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing notification ID" }, { status: 400 });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        return NextResponse.json({ notification: updated }, { status: 200 });
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
