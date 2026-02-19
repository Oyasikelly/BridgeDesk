import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

// Helper to get authenticated user and their DB profile (Copied from categories/route.ts or shared util)
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
        if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orgId = user.organizationId;
        if (!orgId) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

		// === BASIC COUNTS (Scoped to Org) ===
		const totalComplaints = await prisma.complaint.count({
            where: { category: { organizationId: orgId } }
        });

		const resolvedCount = await prisma.complaint.count({
			where: { status: "RESOLVED", category: { organizationId: orgId } },
		});
		const pendingCount = await prisma.complaint.count({
			where: { status: "PENDING", category: { organizationId: orgId } },
		});
		const inReviewCount = await prisma.complaint.count({
			where: { status: "IN_PROGRESS", category: { organizationId: orgId } },
		});
		const rejectedCount = await prisma.complaint.count({
			where: { status: "REJECTED", category: { organizationId: orgId } },
		});

		const activeStudents = await prisma.student.count({
			where: { status: "Active", user: { organizationId: orgId } },
		});

        const totalAdmins = await prisma.admin.count({
            where: { user: { organizationId: orgId } }
        });

		// === MONTHLY COMPLAINTS ===
		const monthlyComplaints = await prisma.complaint.findMany({
            where: { category: { organizationId: orgId } },
			select: {
				dateSubmitted: true,
			},
		});

		const monthlyData: { month: string; complaints: number }[] = [];
		const monthCounts: Record<string, number> = {};

		monthlyComplaints.forEach((item) => {
			const month = item.dateSubmitted.toLocaleString("default", {
				month: "short",
			});
			monthCounts[month] = (monthCounts[month] || 0) + 1;
		});

		for (const [month, complaints] of Object.entries(monthCounts)) {
			monthlyData.push({ month, complaints });
		}

		// === DEPARTMENTAL COMPLAINTS ===
		const departments = await prisma.department.findMany({
            where: { organizationId: orgId },
			include: {
				complaints: true,
			},
		});

		const departmentData = departments.map((d) => ({
			name: d.name,
			complaints: d.complaints.length,
		}));

		// === PIE CHART DATA ===
		const complaintStats = [
			{ name: "Resolved", value: resolvedCount },
			{ name: "Pending", value: pendingCount },
			{ name: "In Review", value: inReviewCount },
			{ name: "Rejected", value: rejectedCount },
		];

		// === RETURN RESPONSE ===
		return NextResponse.json({
			totalComplaints,
			resolvedCount,
			pendingCount,
			inReviewCount,
			rejectedCount,
			activeComplaints: pendingCount + inReviewCount,
			totalStudents: activeStudents,
            totalAdmins,
			complaintStats,
			monthlyData,
			departmentData,
		});
	} catch (error) {
		console.error("❌ Error loading admin analytics:", error);
		return NextResponse.json(
			{ error: "Failed to fetch analytics" },
			{ status: 500 }
		);
	}
}
