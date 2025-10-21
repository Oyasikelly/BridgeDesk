import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    // Get teacher's department and subjects
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      include: {
        teacher: {
          include: {
            subjects: true,
          },
        },
        unit: true,
      },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const teacherDepartment = teacher.unit?.name || 'Unknown Department';

    // Get students in teacher's department
    const departmentStudents = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        unit: {
          name: teacherDepartment,
        },
      },
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
        },
      },
    });

    // Get students taking teacher's subjects
    const subjectStudents = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        studentQuizAttempts: {
          some: {
            quiz: {
              teacherId: teacherId,
            },
          },
        },
      },
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
        },
      },
    });

    // Transform department students data
    const transformedDepartmentStudents = departmentStudents.map((student) => {
      const attempts = student.studentQuizAttempts || [];
      const totalAttempts = attempts.length;
      const completedAttempts = attempts.filter((a) => a.completedAt).length;
      const averageScore =
        totalAttempts > 0
          ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts
          : 0;

      // Calculate improvement trend (simplified)
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

      return {
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
          timeSpent: Math.floor(Math.random() * 120) + 30, // Mock data
          participationRate:
            totalAttempts > 0
              ? Math.min(100, (completedAttempts / totalAttempts) * 100)
              : 0,
        },
        quizAttempts: attempts.map((attempt) => ({
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
          timeSpent: Math.floor(Math.random() * 60) + 10, // Mock data
          completedAt: attempt.completedAt || new Date(),
          isCompleted: !!attempt.completedAt,
        })),
        subjectEnrollments,
        activity: {
          studentId: student.id,
          lastLogin: student.updatedAt,
          totalTimeSpent: Math.floor(Math.random() * 300) + 60, // Mock data
          quizzesAttempted: totalAttempts,
          averageSessionDuration: Math.floor(Math.random() * 30) + 15, // Mock data
          loginFrequency: Math.floor(Math.random() * 7) + 1, // Mock data
        },
        isInDepartment: true,
        isTakingSubjects: subjectStudents.some((s) => s.id === student.id),
      };
    });

    // Transform subject students data (similar logic)
    const transformedSubjectStudents = subjectStudents.map((student) => {
      const attempts = student.studentQuizAttempts || [];
      const totalAttempts = attempts.length;
      const completedAttempts = attempts.filter((a) => a.completedAt).length;
      const averageScore =
        totalAttempts > 0
          ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts
          : 0;

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

      return {
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
        quizAttempts: attempts.map((attempt) => ({
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
        isInDepartment: departmentStudents.some((s) => s.id === student.id),
        isTakingSubjects: true,
      };
    });

    // Calculate summary statistics
    const allStudents = [
      ...transformedDepartmentStudents,
      ...transformedSubjectStudents,
    ];
    const uniqueStudents = allStudents.filter(
      (student, index, self) =>
        index === self.findIndex((s) => s.profile.id === student.profile.id)
    );

    const departmentOnly = transformedDepartmentStudents.filter(
      (student) =>
        !transformedSubjectStudents.some(
          (s) => s.profile.id === student.profile.id
        )
    ).length;

    const subjectOnly = transformedSubjectStudents.filter(
      (student) =>
        !transformedDepartmentStudents.some(
          (s) => s.profile.id === student.profile.id
        )
    ).length;

    const overlapCount = uniqueStudents.length - departmentOnly - subjectOnly;

    const overallAverageScore =
      uniqueStudents.length > 0
        ? uniqueStudents.reduce(
            (sum, student) => sum + student.performance.averageScore,
            0
          ) / uniqueStudents.length
        : 0;

    const totalActiveStudents = uniqueStudents.filter(
      (student) => student.profile.isActive
    ).length;

    return NextResponse.json({
      departmentStudents: {
        students: transformedDepartmentStudents,
        summary: {
          totalStudents: transformedDepartmentStudents.length,
          activeStudents: transformedDepartmentStudents.filter(
            (s) => s.profile.isActive
          ).length,
          averagePerformance:
            transformedDepartmentStudents.length > 0
              ? transformedDepartmentStudents.reduce(
                  (sum, s) => sum + s.performance.averageScore,
                  0
                ) / transformedDepartmentStudents.length
              : 0,
        },
      },
      subjectStudents: {
        students: transformedSubjectStudents,
        summary: {
          totalStudents: transformedSubjectStudents.length,
          activeStudents: transformedSubjectStudents.filter(
            (s) => s.profile.isActive
          ).length,
          averagePerformance:
            transformedSubjectStudents.length > 0
              ? transformedSubjectStudents.reduce(
                  (sum, s) => sum + s.performance.averageScore,
                  0
                ) / transformedSubjectStudents.length
              : 0,
        },
      },
      combinedSummary: {
        totalUniqueStudents: uniqueStudents.length,
        departmentOnly,
        subjectOnly,
        overlapCount,
        overallAverageScore,
        totalActiveStudents,
      },
    });
  } catch (error) {
    console.error('Error fetching enhanced students data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students data' },
      { status: 500 }
    );
  }
}
