import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name, role, organizationId } = await request.json();

    console.log('Testing sync for user:', {
      userId,
      email,
      name,
      role,
      organizationId,
    });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      console.log('User already exists:', existingUser);
      return NextResponse.json({
        message: 'User already exists',
        user: existingUser,
      });
    }

    // Create new user
    const userProfile = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        name: name,
        role: role.toUpperCase() as
          | 'STUDENT'
          | 'TEACHER'
          | 'ADMIN'
          | 'SUPER_ADMIN',
        organizationId: organizationId,
        isActive: true,
        emailVerified: true, // For testing
      },
      include: {
        student: true,
        teacher: true,
      },
    });

    // Create student or teacher profile
    if (role === 'student') {
      await prisma.student.create({
        data: {
          userId: userId,
          studentId: userId,
        },
      });
    } else if (role === 'teacher') {
      await prisma.teacher.create({
        data: {
          userId: userId,
          employeeId: userId,
        },
      });
    }

    console.log('User created successfully:', userProfile);
    return NextResponse.json({
      message: 'User created successfully',
      user: userProfile,
    });
  } catch (error) {
    console.error('Error in test sync:', error);
    return NextResponse.json(
      { error: 'Failed to sync user', details: error },
      { status: 500 }
    );
  }
}
