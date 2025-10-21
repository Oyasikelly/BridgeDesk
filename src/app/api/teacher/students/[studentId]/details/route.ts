import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const { studentId } = await params;

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Get student with all related data
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        unit: true,
        studentQuizAttempts: {
          include: {
            quiz: {
              include: {
                subject: true,
              },
            },
          },
          orderBy: {
            completedAt: 'desc',
          },
        },
      },
    });

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const attempts = student.studentQuizAttempts || [];
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter((a) => a.completedAt).length;
    const averageScore =
      totalAttempts > 0
        ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts
        : 0;

    // Debug logging
    console.log(`🔍 Student ${studentId} data:`, {
      totalAttempts,
      completedAttempts,
      averageScore,
      attemptsWithIssues: attempts.filter(
        (a) => !a || !a.id || !a.quiz || !a.quiz.title
      ).length,
    });

    // Calculate improvement trend
    const recentAttempts = attempts
      .filter((a) => a.completedAt)
      .sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() -
          new Date(a.completedAt!).getTime()
      )
      .slice(0, 5);

    const recentAverage =
      recentAttempts.length > 0
        ? recentAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
          recentAttempts.length
        : 0;

    const improvementTrend =
      recentAverage > averageScore
        ? 'improving'
        : recentAverage < averageScore
        ? 'declining'
        : 'stable';

    // Get subject enrollments
    const subjectEnrollments = Array.from(
      new Set(attempts.map((a) => a.quiz.subject?.id).filter(Boolean))
    ).map((subjectId) => {
      const subjectAttempts = attempts.filter(
        (a) => a.quiz.subject?.id === subjectId
      );
      const subjectAverage =
        subjectAttempts.length > 0
          ? subjectAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
            subjectAttempts.length
          : 0;

      return {
        subjectId,
        subjectName: subjectAttempts[0]?.quiz.subject?.name || 'Unknown',
        enrollmentDate: new Date(),
        averageScore: subjectAverage,
        attemptsCount: subjectAttempts.length,
        lastAttemptDate:
          subjectAttempts.length > 0
            ? subjectAttempts.sort(
                (a, b) =>
                  new Date(b.completedAt!).getTime() -
                  new Date(a.completedAt!).getTime()
              )[0].completedAt
            : undefined,
      };
    });

    // Generate mock performance chart data
    const performanceChart = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
      scores: [65, 72, 68, 75, 80],
      trend: improvementTrend as 'up' | 'down' | 'stable',
    };

    // Generate mock recent activity
    const recentActivity = [
      {
        studentId: student.id,
        activityType: 'quiz_attempt' as const,
        timestamp: new Date(),
        details: {
          quizId: attempts[0]?.quizId,
          quizTitle: attempts[0]?.quiz.title,
          score: attempts[0]?.score,
        },
      },
    ];

    // Generate mock subject performance
    const subjectPerformance = subjectEnrollments.map((enrollment) => ({
      subjectName: enrollment.subjectName,
      averageScore: enrollment.averageScore,
      attempts: enrollment.attemptsCount,
      lastAttempt: enrollment.lastAttemptDate || new Date(),
    }));

    // Generate mock recommendations
    const recommendations = [
      'Focus on improving time management during quizzes',
      'Consider reviewing basic concepts in Mathematics',
      'Practice more questions in Physics to improve scores',
    ];

    const studentData = {
      student: {
        profile: {
          id: student.id,
          studentId: student.student?.studentId || 'N/A',
          name: student.name || 'Unknown',
          email: student.email,
          department: student.unit?.name || 'Unknown',
          academicLevel: student.student?.academicLevel || 'Unknown',
          classYear: student.student?.classYear || 'Unknown',
          phoneNumber: student.student?.phoneNumber,
          profileImage: student.profileImageUrl,
          isActive: true,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt,
        },
        performance: {
          studentId: student.id,
          averageScore,
          totalAttempts,
          completedQuizzes: completedAttempts,
          improvementTrend,
          lastActivity: student.updatedAt,
          timeSpent: Math.floor(Math.random() * 120) + 30,
          participationRate:
            totalAttempts > 0
              ? Math.min(100, (completedAttempts / totalAttempts) * 100)
              : 0,
        },
        quizAttempts: attempts
          .filter(
            (attempt) =>
              attempt &&
              attempt.id &&
              attempt.quiz &&
              attempt.quiz.title &&
              attempt.quiz.subject &&
              typeof attempt.score === 'number'
          )
          .map((attempt) => ({
            id: attempt.id,
            quizId: attempt.quizId,
            quizTitle: attempt.quiz.title,
            subjectName: attempt.quiz.subject?.name || 'Unknown',
            score: attempt.score || 0,
            maxScore: attempt.quiz.totalPoints || 100,
            percentage:
              attempt.score && attempt.quiz.totalPoints
                ? (attempt.score / attempt.quiz.totalPoints) * 100
                : 0,
            timeSpent: Math.floor(Math.random() * 60) + 10,
            completedAt: attempt.completedAt || new Date(),
            isCompleted: !!attempt.completedAt,
          })),
        subjectEnrollments,
        activity: {
          studentId: student.id,
          lastLogin: student.updatedAt,
          totalTimeSpent: Math.floor(Math.random() * 300) + 60,
          quizzesAttempted: totalAttempts,
          averageSessionDuration: Math.floor(Math.random() * 30) + 15,
          loginFrequency: Math.floor(Math.random() * 7) + 1,
        },
        isInDepartment: true,
        isTakingSubjects: true,
      },
      recentActivity,
      performanceChart,
      subjectPerformance,
      recommendations,
    };

    return NextResponse.json(studentData);
  } catch (error) {
    console.error('Error fetching student details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student details' },
      { status: 500 }
    );
  }
}
