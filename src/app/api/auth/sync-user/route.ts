import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
	try {
		const { userId, email, name, role, emailVerified, organizationId } =
			await request.json();

		// Define password hash (placeholder or real hash)
		const passwordHash = await bcrypt.hash("defaultPassword123", 10);

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!existingUser) {
			// Create new user
			const userProfile = await prisma.user.create({
				data: {
					id: userId,
					email,
					name,
					password: passwordHash,
					role: role.toUpperCase() as Role,
					organizationId,
					isActive: true,
					emailVerified,
					lastLogin: new Date(),
				},
				include: {
					student: true,
					admin: true,
				},
			});

			// Create related student or admin record
			if (role === "STUDENT") {
				await prisma.student.create({
					data: {
						userId,
						matricNo: "",
						fullName: name,
						email,
						department: "",
						level: "",
						status: "Active",
						passwordHash,
						lastLogin: userProfile.lastLogin,
					},
				});
			} else if (role === "ADMIN") {
				await prisma.admin.create({
					data: {
						userId,
						fullName: name,
						email,
						username: email,
						lastLogin: userProfile.lastLogin,
						passwordHash,
					},
				});
			}

			return NextResponse.json({ user: userProfile });
		}

		return NextResponse.json({ user: existingUser });
	} catch (error) {
		console.error("Error syncing user to database:", error);
		return NextResponse.json(
			{ error: "Failed to sync user to database" },
			{ status: 500 }
		);
	}
}
