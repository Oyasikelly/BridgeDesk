import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { fetchCompleteUserData } from "@/lib/auth/userData";

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();

		console.log("Attempting login with:", email);

		// Find user in database with all related data
		const user = await prisma.user.findUnique({
			where: { email },
			include: {
				student: true,
				admin: true,
				organization: true,
				department: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid email or password." },
				{ status: 401 }
			);
		}

		// Check if user is active
		if (!user.isActive) {
			return NextResponse.json(
				{ error: "Your account has been deactivated. Please contact support." },
				{ status: 403 }
			);
		}

		// Check if email is verified
		if (!user.emailVerified) {
			return NextResponse.json(
				{ error: "Please verify your email before logging in." },
				{ status: 403 }
			);
		}

		// Validate role exists
		if (
			!user.role ||
			!["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"].includes(user.role)
		) {
			return NextResponse.json(
				{ error: "Invalid user role. Please contact support." },
				{ status: 403 }
			);
		}

		// Check if password exists and compare
		if (!user.password) {
			return NextResponse.json(
				{ error: "Invalid email or password." },
				{ status: 401 }
			);
		}

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return NextResponse.json(
				{ error: "Invalid email or password." },
				{ status: 401 }
			);
		}

		// Additional validations for role-specific data
		if (user.role === "STUDENT" && !user.student) {
			return NextResponse.json(
				{ error: "Student profile not found. Please contact support." },
				{ status: 403 }
			);
		}

		if (user.role === "ADMIN" && !user.admin) {
			return NextResponse.json(
				{ error: "Admin profile not found. Please contact support." },
				{ status: 403 }
			);
		}

		// Check if organization is active
		if (user.organization && !user.organization.isActive) {
			return NextResponse.json(
				{ error: "Your organization account is deactivated." },
				{ status: 403 }
			);
		}

		console.log("Login successful for:", user.email, "Role:", user.role);

		// Fetch complete user data
		const completeUserData = await fetchCompleteUserData(user.id);

		if (!completeUserData) {
			return NextResponse.json(
				{ error: "Failed to fetch user data. Please try again." },
				{ status: 500 }
			);
		}

		// ✅ Return complete user data including role
		return NextResponse.json({
			user: {
				id: completeUserData.id,
				email: completeUserData.email,
				name: completeUserData.name || "User",
				role: completeUserData.role.toLowerCase(), // frontend-friendly
				createdAt: completeUserData.createdAt,
				updatedAt: completeUserData.updatedAt,
				profileComplete: completeUserData.profileCompleted,
				organization: completeUserData.organization,
				organizationId: completeUserData.organizationId,
				departmentId: completeUserData.departmentId,
				isActive: completeUserData.isActive,
				emailVerified: completeUserData.emailVerified,
				student: completeUserData.student,
				teacher: completeUserData.admin,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ error: "Login failed. Please try again." },
			{ status: 500 }
		);
	}
}
