import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get teacher profile (subjects, unitId)
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: { subjects: true, user: true },
    });
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    const subjectIds = teacher.subjects.map((s: { id: string }) => s.id);
    const unitId = teacher.user.unitId;

    // 1. Students in teacher's subjects (via quiz attempts as proxy)
    let studentsInSubjects: string[] = [];
    if (subjectIds.length > 0) {
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          quiz: { subjectId: { in: subjectIds } },
        },
        select: { studentId: true },
      });
      studentsInSubjects = Array.from(
        new Set(attempts.map((a: { studentId: string }) => a.studentId))
      );
    }

    // 2. Students in teacher's department/unit
    let studentsInDepartment: string[] = [];
    if (unitId) {
      const users = await prisma.user.findMany({
        where: { unitId, role: 'STUDENT' },
        select: { id: true },
      });
      studentsInDepartment = users.map((u: { id: string }) => u.id);
    }

    // 3. Overlap
    const overlap = studentsInSubjects.filter((id: string) =>
      studentsInDepartment.includes(id)
    );

    // 4. Active quizzes (published quizzes created by this teacher)
    const activeQuizzes = await prisma.quiz.count({
      where: {
        teacherId: userId,
        isPublished: true,
      },
    });

    // 5. Active quizzes last month (for trend)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);
    const activeQuizzesLastMonth = await prisma.quiz.count({
      where: {
        teacherId: userId,
        isPublished: true,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });
    let activeQuizzesTrend = 0;
    if (activeQuizzesLastMonth > 0) {
      activeQuizzesTrend = Math.round(
        ((activeQuizzes - activeQuizzesLastMonth) / activeQuizzesLastMonth) *
          100
      );
    }

    return NextResponse.json({
      studentsInSubjects: studentsInSubjects.length,
      studentsInDepartment: studentsInDepartment.length,
      overlap: overlap.length,
      activeQuizzes,
      activeQuizzesTrend,
    });
  } catch (error) {
    console.error('TEACHER DASHBOARD METRICS ERROR:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
