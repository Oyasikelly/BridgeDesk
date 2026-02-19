import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params;

		const userProfile = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				student: true,
				admin: true,
			},
		});

		if (!userProfile) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Check profile completion
		let profileComplete = false;
		if (userProfile.role === "STUDENT") {
			profileComplete = !!(
				userProfile.student?.level && userProfile.student?.phone
			);
		} else if (userProfile.role === "ADMIN") {
			profileComplete = !!(
				userProfile.admin?.department && userProfile.admin?.phone
			);
		} else if (userProfile.role === "SUPER_ADMIN") {
			profileComplete = true;
		}

		const user = {
			id: userProfile.id,
			email: userProfile.email,
			name: userProfile.name || "User",
			role: userProfile.role.toUpperCase() as
				| "STUDENT"
				| "ADMIN"
				| "SUPER_ADMIN"
				| "MODERATOR"
				| "OFFICER"
				| "HOD"
				| "DEAN"
				| "STAFF",
			createdAt: userProfile.createdAt,
			updatedAt: userProfile.updatedAt,
			profileComplete,
			organizationId: userProfile.organizationId,
			unitId: userProfile.departmentId || undefined,
			isActive: userProfile.isActive,
			emailVerified: userProfile.emailVerified,
			// Student-specific properties
			academicLevel: userProfile.student?.level || undefined,
			classYear: userProfile.student?.joinedDate || undefined,
			phoneNumber: userProfile.student?.phone || undefined,
			// admin-specific properties
			department: userProfile.admin?.department || undefined,
			institution: undefined,
			employeeId: userProfile.admin?.id || undefined,
		};

		return NextResponse.json({ user });
	} catch (error) {
		console.error("Error getting user from database:", error);
		return NextResponse.json(
			{ error: "Failed to get user from database" },
			{ status: 500 }
		);
	}
}
