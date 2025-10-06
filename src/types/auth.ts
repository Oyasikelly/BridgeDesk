export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId?: string;
  unitId?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  institution?: string;
  department?: string;
  studentId?: string;
  // Student-specific properties
  academicLevel?: string;
  classYear?: string;
  phoneNumber?: string;
  // Teacher-specific properties
  subjectsTaught?: string[];
  employeeId?: string;
  // Email confirmation
  email_confirmed_at?: string | null;
  // Profile completion status
  profileComplete?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher';
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
