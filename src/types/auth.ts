// types/auth.ts

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";

export interface StudentData {
	id: string;
	matricNo: string;
	department: string;
	level: string;
	phone?: string | null;
	hostel?: string | null;
}

export interface TeacherData {
	id: string;
	employeeId: string;
	department: string;
	subjectsTaught?: string[];
	phone?: string | null;
}

export interface AdminData {
	id: string;
	fullName: string;
	email: string;
	phone?: string | null;
	department?: string | null;
}

export interface User {
	id: string;
	email: string;
	name: string | null;
	role: UserRole;
	image?: string | null;
	isActive: boolean;
	emailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
	organizationId?: string | null;
	unitId?: string | null;

	// Relations
	student?: StudentData | null;
	teacher?: TeacherData | null;
	admin?: AdminData | null;

	// Profile completion status
	profileComplete?: boolean;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials {
	email: string;
	password: string;
	name: string;
	role: "STUDENT" | "ADMIN";
	organizationId: string;
}

export interface AuthResponse {
	user: User;
	token: string;
	message?: string;
}

export interface AuthError {
	message: string;
	code?: string;
}
