// src/lib/auth/userData.ts
import { prisma } from "../db";
import { Role } from "@prisma/client";
export interface UserData {
	id: string;
	email: string;
	name: string | null;
	role: Role;
	isActive: boolean;
	emailVerified: boolean;
	profileImageUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
	profileCompleted: boolean;
	organization: string | null;
	organizationId: string | null;
	departmentId: string | null;
	lastLogin?: Date | null;
	// Student data
	student?: {
		id: string;
		matricNo: string;
		fullName: string;
		email: string;
		phone: string | null;
		department: string;
		level: string;
		hostel: string | null;
		avatarUrl: string | null;
		status: string;
		joinedDate: Date;
		totalComplaints: number;
		resolvedComplaints: number;
		lastLogin?: Date | null;
	} | null;
	// Admin data
	admin?: {
		id: string;
		fullName: string;
		email: string;
		username: string;
		phone: string | null;
		department: string | null;
		avatarUrl: string | null;
		role: Role;
		isActive: boolean;
		dateJoined: Date;
		lastLogin: Date | null;
	} | null;
}

export async function fetchCompleteUserData(
	userId: string
): Promise<UserData | null> {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				student: true,
				admin: true,
				organization: true,
				department: true,
			},
		});

		if (!user) return null;

		let profileCompleted = false;

		if (user.role === "STUDENT") {
			profileCompleted = !!(
				user.student?.matricNo &&
				user.student?.department &&
				user.student?.level &&
				user.student?.email
			);
		} else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
			profileCompleted = !!(
				user.admin?.fullName &&
				user.admin?.department &&
				user.admin?.email
			);
		}

		return {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			isActive: user.isActive,
			emailVerified: user.emailVerified,
			profileImageUrl: user.profileImageUrl,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			profileCompleted,
			organization: user.organization?.name || null,
			organizationId: user.organizationId || null,
			departmentId: user.departmentId || null,
			student: user.student
				? {
						id: user.student.id,
						matricNo: user.student.matricNo,
						fullName: user.student.fullName,
						email: user.student.email,
						phone: user.student.phone,
						department: user.student.department,
						level: user.student.level,
						hostel: user.student.hostel,
						avatarUrl: user.student.avatarUrl,
						lastLogin: user.lastLogin || null,
						status: user.student.status,
						joinedDate: user.student.joinedDate,
						totalComplaints: user.student.totalComplaints,
						resolvedComplaints: user.student.resolvedComplaints,
				  }
				: null,
			admin: user.admin
				? {
						id: user.admin.id,
						fullName: user.admin.fullName,
						email: user.admin.email,
						username: user.admin.username,
						phone: user.admin.phone,
						department: user.admin.department,
						avatarUrl: user.admin.avatarUrl,
						role: user.admin.role,
						isActive: user.admin.isActive,
						dateJoined: user.admin.dateJoined,
						lastLogin: user.lastLogin || null,
				  }
				: null,
		};
	} catch (error) {
		console.error("Error fetching complete user data:", error);
		return null;
	}
}

export function checkProfileCompletion(userData: UserData): boolean {
	return userData.profileCompleted;
}
