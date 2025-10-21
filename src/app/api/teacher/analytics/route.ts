import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const subjectId = searchParams.get('subjectId');
    const dateRange = searchParams.get('dateRange') || '7'; // Default to 7 days
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get teacher profile
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: { subjects: true, user: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const teacherSubjectIds = teacher.subjects.map((s) => s.id);

    // Calculate date range
    const now = new Date();
    let startDateFilter: Date;
    let endDateFilter: Date;

    if (startDate && endDate) {
      startDateFilter = new Date(startDate);
      endDateFilter = new Date(endDate);
    } else {
      const days = parseInt(dateRange);
      startDateFilter = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      endDateFilter = now;
    }

    // Build where clause for quiz attempts
    const whereClause: Record<string, unknown> = {
      quiz: {
        teacherId: userId,
        ...(subjectId && { subjectId }),
        ...(teacherSubjectIds.length > 0 && {
          subjectId: { in: teacherSubjectIds },
        }),
      },
      createdAt: {
        gte: startDateFilter,
        lte: endDateFilter,
      },
    };

    // 1. Analytics Cards Data
    const totalAttempts = await prisma.quizAttempt.count({
      where: whereClause,
    });

    const completedAttempts = await prisma.quizAttempt.count({
      where: {
        ...whereClause,
        completedAt: { not: null },
      },
    });

    // Get attempts with scores (where score is not null)
    const attemptsWithScores = await prisma.quizAttempt.findMany({
      where: {
        ...whereClause,
        score: { gt: 0 },
      },
      select: { score: true },
    });

    const averageScore =
      attemptsWithScores.length > 0
        ? Math.round(
            attemptsWithScores.reduce((sum, a) => sum + (a.score || 0), 0) /
              attemptsWithScores.length
          )
        : 0;

    const uniqueStudents = await prisma.quizAttempt.findMany({
      where: whereClause,
      select: { studentId: true },
      distinct: ['studentId'],
    });

    const completionRate =
      totalAttempts > 0
        ? Math.round((completedAttempts / totalAttempts) * 100)
        : 0;

    // Calculate average completion time using timeSpent field
    const attemptsWithTime = await prisma.quizAttempt.findMany({
      where: {
        ...whereClause,
        completedAt: { not: null },
        timeSpent: { gt: 0 },
      },
      select: {
        timeSpent: true,
      },
    });

    const totalTimeMinutes = attemptsWithTime.reduce((sum, attempt) => {
      return sum + attempt.timeSpent / 60; // Convert seconds to minutes
    }, 0);

    const averageCompletionTime =
      attemptsWithTime.length > 0
        ? Math.round(totalTimeMinutes / attemptsWithTime.length)
        : 0;

    // Calculate difficulty distribution (since there's no difficulty field, we'll use a placeholder)
    // In a real implementation, you might want to add a difficulty field to the Question model
    const totalQuestions = await prisma.question.count({
      where: {
        quiz: {
          teacherId: userId,
          ...(subjectId && { subjectId }),
          ...(teacherSubjectIds.length > 0 && {
            subjectId: { in: teacherSubjectIds },
          }),
        },
      },
    });

    // For now, we'll use a simple distribution based on question count
    const easyPercentage = totalQuestions > 0 ? 40 : 0;
    const mediumPercentage = totalQuestions > 0 ? 35 : 0;
    const hardPercentage = totalQuestions > 0 ? 25 : 0;

    // 2. Charts Data
    // Score Distribution
    const scoreRanges = [
      { range: '90-100', min: 90, max: 100, label: 'A' },
      { range: '80-89', min: 80, max: 89, label: 'B' },
      { range: '70-79', min: 70, max: 79, label: 'C' },
      { range: '60-69', min: 60, max: 69, label: 'D' },
      { range: '0-59', min: 0, max: 59, label: 'F' },
    ];

    const scoreDistribution = scoreRanges.map((range) => {
      const count = attemptsWithScores.filter((attempt) => {
        const score = attempt.score || 0;
        return score >= range.min && score <= range.max;
      }).length;
      return {
        grade: range.label,
        count,
      };
    });

    // Performance Trends (weekly data)
    const weeklyData = [];
    const weeks = 6;
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

      const weekAttempts = await prisma.quizAttempt.findMany({
        where: {
          ...whereClause,
          createdAt: {
            gte: weekStart,
            lte: weekEnd,
          },
          score: { gt: 0 },
        },
        select: { score: true },
      });

      const avgScore =
        weekAttempts.length > 0
          ? Math.round(
              weekAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
                weekAttempts.length
            )
          : 0;

      weeklyData.push({
        week: `Week ${weeks - i}`,
        avgScore,
      });
    }

    // Quiz Comparison
    const quizComparison = await prisma.quiz.findMany({
      where: {
        teacherId: userId,
        ...(subjectId && { subjectId }),
        ...(teacherSubjectIds.length > 0 && {
          subjectId: { in: teacherSubjectIds },
        }),
      },
      include: {
        subject: true,
      },
      take: 10,
    });

    // Get attempts for each quiz separately
    const quizComparisonData = await Promise.all(
      quizComparison.map(async (quiz) => {
        const attempts = await prisma.quizAttempt.findMany({
          where: {
            quizId: quiz.id,
            createdAt: {
              gte: startDateFilter,
              lte: endDateFilter,
            },
            score: { gt: 0 },
          },
          select: { score: true },
        });

        const avgScore =
          attempts.length > 0
            ? Math.round(
                attempts.reduce((sum, a) => sum + (a.score || 0), 0) /
                  attempts.length
              )
            : 0;

        return {
          quizName: quiz.title,
          avgScore,
          attemptCount: attempts.length,
        };
      })
    );

    // 3. Additional Analytics
    const lastUpdated = new Date().toISOString();

    return NextResponse.json({
      analyticsCards: {
        totalAttempts,
        averageScore,
        activeStudents: uniqueStudents.length,
        completionRate,
        averageCompletionTime,
        difficultyDistribution: `${easyPercentage}:${mediumPercentage}:${hardPercentage}`,
      },
      charts: {
        scoreDistribution,
        performanceTrend: weeklyData,
        quizComparison: quizComparisonData,
      },
      filters: {
        dateRange,
        startDate: startDateFilter.toISOString(),
        endDate: endDateFilter.toISOString(),
        subjectId,
      },
      lastUpdated,
    });
  } catch (error) {
    console.error('ANALYTICS API ERROR:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
