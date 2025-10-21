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
    // const teacherUnitId = teacher.user.unitId;

    // Get all quizzes for this teacher
    const quizzes = await prisma.quiz.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { teacherId },
          { subjectId: { in: subjectIds.length > 0 ? subjectIds : [''] } },
        ],
      },
      include: {
        subject: true,
        attempts: {
          include: {
            student: {
              include: {
                student: true,
              },
            },
          },
        },
      },
    });

    // Calculate total attempts across all quizzes
    const totalAttempts = quizzes.reduce(
      (sum: number, quiz: { attempts: { length: number } }) =>
        sum + quiz.attempts.length,
      0
    );

    // Calculate attempts per quiz with student details
    const attemptsPerQuiz = quizzes.map(
      (quiz: {
        id: string;
        title: string;
        subject?: { name?: string | null } | null;
        attempts: Array<{
          score: number;
          completedAt: Date | null;
          student: {
            id: string;
            name?: string | null;
            email?: string | null;
          };
        }>;
      }) => ({
        quizId: quiz.id,
        quizTitle: quiz.title,
        subjectName: quiz.subject?.name || 'Unknown',
        attempts: quiz.attempts.length,
        averageScore:
          quiz.attempts.length > 0
            ? Math.round(
                quiz.attempts.reduce(
                  (sum: number, attempt: { score: number }) =>
                    sum + attempt.score,
                  0
                ) / quiz.attempts.length
              )
            : 0,
        students: quiz.attempts.map(
          (attempt: {
            score: number;
            completedAt: Date | null;
            student: {
              id: string;
              name?: string | null;
              email?: string | null;
            };
          }) => ({
            id: attempt.student.id,
            name: attempt.student.name || 'Unknown',
            email: attempt.student.email,
            score: attempt.score,
            completedAt: attempt.completedAt,
          })
        ),
      })
    );

    // Calculate attempts per subject
    const subjectAttempts = new Map();
    const subjectScores = new Map();

    for (const quiz of quizzes as Array<{
      id: string;
      title: string;
      subject?: { name?: string | null } | null;
      attempts: Array<{
        score: number;
        completedAt: Date | null;
        student: {
          id: string;
          name?: string | null;
          email?: string | null;
        };
      }>;
    }>) {
      const subjectName = quiz.subject?.name || 'Unknown';
      const currentCount = subjectAttempts.get(subjectName) || 0;
      const currentScores = subjectScores.get(subjectName) || [];

      subjectAttempts.set(subjectName, currentCount + quiz.attempts.length);
      subjectScores.set(subjectName, [
        ...currentScores,
        ...quiz.attempts.map((a) => a.score),
      ]);
    }

    const attemptsBySubject = Array.from(subjectAttempts.entries()).map(
      ([subjectName, attempts]: [subjectName: string, attempts: number]) => {
        const scores = subjectScores.get(subjectName) || [];
        const averageScore =
          scores.length > 0
            ? Math.round(
                scores.reduce((sum: number, score: number) => sum + score, 0) /
                  scores.length
              )
            : 0;

        return {
          subjectName,
          attempts,
          averageScore,
          quizzes: quizzes.filter(
            (q: { subject?: { name?: string | null } | null }) =>
              q.subject?.name === subjectName
          ).length,
        };
      }
    );

    // Get recent attempts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttempts = await prisma.quizAttempt.count({
      where: {
        quiz: {
          organizationId: orgId,
          OR: [
            { teacherId },
            { subjectId: { in: subjectIds.length > 0 ? subjectIds : [''] } },
          ],
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get unique students who have attempted quizzes
    const uniqueStudents = new Map();
    for (const quiz of quizzes) {
      for (const attempt of quiz.attempts as Array<{
        score: number;
        completedAt: Date | null;
        student: {
          id: string;
          name?: string | null;
          email?: string | null;
        };
        studentId: string;
      }>) {
        type AttemptType = {
          score: number;
          completedAt: Date | null;
          student: {
            id: string;
            name?: string | null;
            email?: string | null;
          };
          studentId: string;
        };

        const typedAttempt = attempt as AttemptType;

        if (!uniqueStudents.has(typedAttempt.studentId)) {
          uniqueStudents.set(typedAttempt.studentId, {
            id: typedAttempt.student.id,
            name: typedAttempt.student.name || 'Unknown',
            email: typedAttempt.student.email,
            totalAttempts: 0,
            averageScore: 0,
            lastAttempt: null,
          });
        }
        const student = uniqueStudents.get(typedAttempt.studentId);
        student.totalAttempts++;
        student.averageScore = Math.round(
          (student.averageScore * (student.totalAttempts - 1) +
            typedAttempt.score) /
            student.totalAttempts
        );
        if (
          !student.lastAttempt ||
          (typedAttempt.completedAt &&
            typedAttempt.completedAt > student.lastAttempt)
        ) {
          student.lastAttempt = typedAttempt.completedAt;
        }
      }
    }

    return NextResponse.json({
      totalAttempts,
      recentAttempts,
      attemptsPerQuiz,
      attemptsBySubject,
      students: Array.from(uniqueStudents.values()),
      summary: {
        totalQuizzes: quizzes.length,
        totalStudents: uniqueStudents.size,
        averageAttemptsPerQuiz:
          quizzes.length > 0
            ? Math.round((totalAttempts / quizzes.length) * 10) / 10
            : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz attempts' },
      { status: 500 }
    );
  }
}
