import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
	try {
		const { userId, profileData } = await request.json();

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		// Update user profile
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				departmentId: profileData.departmentId,
				profileImageUrl: profileData.profileImageUrl,
				name: profileData.fullName,
				// Update role-specific data
				...(profileData.role === "student" && {
					student: {
						upsert: {
							create: {
								// userId: profileData.userId || "",
								joinedDate: profileData.joinedDate,
								level: profileData.level,
								phone: profileData.phone,
								matricNo: profileData.matricNo,
								email: profileData.email,
								fullName: profileData.fullName,
								department: profileData.department,
								passwordHash: profileData.passwordHash,
							},
							update: {
								// userId: profileData.userId || "",
								joinedDate: profileData.joinedDate,
								level: profileData.level,
								phone: profileData.phone,
								matricNo: profileData.matricNo,
								fullName: profileData.fullName,
								email: profileData.email,
								department: profileData.department,
								passwordHash: profileData.passwordHash,
							},
						},
					},
				}),
				...(profileData.role === "admin" && {
					admin: {
						upsert: {
							create: {
								// userId: profileData.userId || "",
								username: profileData.fullName,
								phone: profileData.phone,
								department: profileData.department,
								email: profileData.email,
								fullName: profileData.fullName,
								passwordHash: profileData.passwordHash,
							},
							update: {
								// userId: profileData.userId || "",
								username: profileData.fullName,
								phone: profileData.phone,
								department: profileData.department,
								fullName: profileData.fullName,
								email: profileData.email,
								passwordHash: profileData.passwordHash,
							},
						},
					},
				}),
			},
			include: {
				student: true,
				admin: true,
				organization: true,
				department: true,
			},
		});

		return NextResponse.json({
			success: true,
			user: updatedUser,
		});
	} catch (error) {
		console.error("Profile update error:", error);
		return NextResponse.json(
			{ error: "Failed to update profile" },
			{ status: 500 }
		);
	}
}
