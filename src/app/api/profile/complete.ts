import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      role,
      academicLevel,
      classYear,
      phoneNumber,
      department,
      // subjectsTaught,
      employeeId,
    } = body;
    const userId = body.userId;
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing userId or role.' },
        { status: 400 }
      );
    }
    if (role === 'student') {
      try {
        await prisma.student.update({
          where: { userId },
          data: { academicLevel, classYear, phoneNumber },
        });
      } catch {
        // If not found, create
        await prisma.student.create({
          data: {
            userId,
            academicLevel,
            classYear,
            phoneNumber,
            studentId: userId, // Use userId as studentId or generate as needed
          },
        });
      }
    } else if (role === 'teacher') {
      try {
        await prisma.teacher.update({
          where: { userId },
          data: { department, phoneNumber },
        });
      } catch {
        // If not found, create
        await prisma.teacher.create({
          data: {
            userId,
            department,
            phoneNumber,
            employeeId,
          },
        });
      }
    } else {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PROFILE COMPLETE ERROR:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
