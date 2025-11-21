import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import {
	fetchCompleteUserData,
	checkProfileCompletion,
} from "@/lib/auth/userData";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const userData = await fetchCompleteUserData(userId);

		if (!userData) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const isComplete = checkProfileCompletion(userData);

		return NextResponse.json({
			isComplete,
			user: userData,
		});
	} catch (error) {
		console.error("Profile completion check error:", error);
		return NextResponse.json(
			{ error: "Failed to check profile completion" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			userId,
			role,
			level,
			joinedDate,
			phone,
			department,
			matricNo,
			fullName,
			email,
			departmentId,
		} = body;

		if (!userId || !role) {
			return NextResponse.json(
				{ error: "User ID and role are required" },
				{ status: 400 }
			);
		}

		// 🔥 Ensure user exists in the database before proceeding
		let existingUser = await prisma.user.findUnique({ where: { id: userId } });
		if (!existingUser) {
			existingUser = await prisma.user.update({
				where: { id: userId },
				data: {
					email,
					role: role.toUpperCase(),
					departmentId: departmentId || null,
				},
			});
		} else {
			// If found, update role or department if necessary
			await prisma.user.update({
				where: { id: userId },
				data: {
					role: role.toUpperCase(),
					departmentId: departmentId || null,
				},
			});
		}

		if (role.toUpperCase() === "STUDENT") {
			await prisma.student.upsert({
				where: { userId },
				update: {
					level,
					joinedDate,
					phone,
					department,
					matricNo,
					fullName,
					email,
				},
				create: {
					userId,
					department,
					matricNo,
					fullName,
					email,
					level,
					joinedDate,
					phone,
					passwordHash: await bcrypt.hash("defaultPassword123", 10),
				},
			});

			const updatedUser = await prisma.user.findUnique({
				where: { id: userId },
				include: { student: true, admin: true },
			});

			return NextResponse.json({
				success: true,
				user: updatedUser,
				message: "Student profile completed successfully",
			});
		} else if (role.toUpperCase() === "ADMIN") {
			if (!email) {
				return NextResponse.json(
					{ error: "Email is required for admin profile creation" },
					{ status: 400 }
				);
			}

			// Update user record with departmentId
			await prisma.user.update({
				where: { id: userId },
				data: {
					departmentId: departmentId || null,
				},
			});

			// Update or create admin profile
			await prisma.admin.upsert({
				where: { userId },
				update: {
					phone,
					department,
					fullName,
					email,
				},
				create: {
					userId,
					username: fullName.replace(/\s+/g, "").toLowerCase(),
					passwordHash: await bcrypt.hash("defaultPassword123", 10),
					phone,
					department,
					fullName,
					email,
				},
			});

			// Fetch updated user data
			const updatedUser = await prisma.user.findUnique({
				where: { id: userId },
				include: {
					student: true,
					admin: true,
				},
			});

			return NextResponse.json({
				success: true,
				user: updatedUser,
				message: "Admin profile completed successfully",
			});
		}

		return NextResponse.json({ error: "Invalid role" }, { status: 400 });
	} catch (error: unknown) {
		console.error("Profile completion error:", error);
		const message =
			error instanceof Error
				? error.message
				: typeof error === "string"
				? error
				: "Failed to complete profile";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
