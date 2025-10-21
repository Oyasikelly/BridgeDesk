import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    // Get teacher with their subjects and user info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId },
      include: {
        subjects: true,
        user: {
          include: {
            organization: true,
            unit: true,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const orgId = teacher.user.organizationId;
    const subjectIds = teacher.subjects.map(
      (s: unknown) => (s as { id: string }).id
    );
    const teacherUnitId = teacher.user.unitId;

    // Get students in teacher's department (same unit)
    const studentsInDepartment = await prisma.user.findMany({
      where: {
        organizationId: orgId,
        role: 'STUDENT',
        unitId: teacherUnitId,
        isActive: true,
      },
      include: {
        student: true,
      },
    });

    // Get students taking teacher's subjects
    const studentsInSubjects = await prisma.user.findMany({
      where: {
        organizationId: orgId,
        role: 'STUDENT',
        isActive: true,
        studentQuizAttempts: {
          some: {
            quiz: {
              subjectId: {
                in: subjectIds.length > 0 ? subjectIds : [''],
              },
            },
          },
        },
      },
      include: {
        student: true,
        studentQuizAttempts: {
          include: {
            quiz: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    // Calculate overlap
    // const departmentStudentIds = new Set(studentsInDepartment.map((s) => s.id));
    const subjectStudentIds = new Set(
      studentsInSubjects.map((s: { id: string }) => s.id)
    );
    const overlap = studentsInDepartment.filter((s: { id: string }) =>
      subjectStudentIds.has(s.id)
    );

    // Format student data
    const formatStudent = (user: unknown) => {
      const studentUser = user as {
        id: string;
        name?: string;
        email: string;
        student?: {
          studentId?: string;
          classYear?: string;
          academicLevel?: string;
          phoneNumber?: string;
        };
        phoneNumber?: string;
      };
      return {
        id: studentUser.id,
        name: studentUser.name || 'Unknown',
        email: studentUser.email,
        studentId: studentUser.student?.studentId || 'N/A',
        classYear: studentUser.student?.classYear || 'N/A',
        academicLevel: studentUser.student?.academicLevel || 'N/A',
        phoneNumber:
          studentUser.student?.phoneNumber || studentUser.phoneNumber || 'N/A',
      };
    };

    return NextResponse.json({
      studentsInDepartment: studentsInDepartment.map(formatStudent),
      studentsInSubjects: studentsInSubjects.map(formatStudent),
      overlap: overlap.map(formatStudent),
      summary: {
        totalInDepartment: studentsInDepartment.length,
        totalInSubjects: studentsInSubjects.length,
        overlapCount: overlap.length,
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
