// import { prisma } from '@/lib/db';

export interface UserData {
	id: string;
	email: string;
	name: string | null;
	role: "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";
	profileCompleted: boolean;
	isActive: boolean;
	emailVerified: boolean;
	organizationId: string;
	unitId: string | null;
	profileImageUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
	// Student-specific fields
	student?: {
		id: string;
		studentId: string;
		classYear: string | null;
		academicLevel: string | null;
		phoneNumber: string | null;
	} | null;
	// Teacher-specific fields
	teacher?: {
		id: string;
		employeeId: string | null;
		department: string | null;
		phoneNumber: string | null;
	} | null;
	// Organization data
	organization?: {
		id: string;
		name: string;
		isActive: boolean;
	} | null;
	// Unit data
	unit?: {
		id: string;
		name: string;
		description?: string | null;
	} | null;
}

// export async function fetchCompleteUserData(
//   userId: string
// ): Promise<UserData | null> {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       include: {
//         student: true,
//         teacher: true,
//         organization: true,
//         unit: true,
//       },
//     });

//     if (!user) {
//       return null;
//     }

//     // Check profile completion based on role
//     let profileCompleted = false;

//     if (user.role === 'STUDENT') {
//       profileCompleted = !!(
//         user.student?.academicLevel &&
//         user.student?.classYear &&
//         user.student?.phoneNumber
//       );
//     } else if (user.role === 'TEACHER') {
//       profileCompleted = !!user.teacher?.employeeId;
//     } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
//       // Admins are considered to have complete profiles
//       profileCompleted = true;
//     }

//     return {
//       id: user.id,
//       email: user.email,
//       name: user.name,
//       role: user.role,
//       profileCompleted,
//       isActive: user.isActive,
//       emailVerified: user.emailVerified,
//       organizationId: user.organizationId,
//       unitId: user.unitId,
//       profileImageUrl: user.profileImageUrl,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt,
//       student: user.student,
//       teacher: user.teacher,
//       organization: user.organization,
//       unit: user.unit,
//     };
//   } catch (error) {
//     console.error('Error fetching complete user data:', error);
//     return null;
//   }
// }
