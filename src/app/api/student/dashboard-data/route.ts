import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

// Type definitions for quiz attempts and related data
interface QuizAttempt {
  id: string;
  completedAt: Date | null;
  score: number | null;
  quizId: string;
  createdAt: Date;
  timeSpent?: number;
  totalPoints?: number;
  quiz?: {
    id: string;
    title: string;
    subject?: {
      name: string;
    } | null;
  };
  answers?: Array<{
    id: string;
    question?: {
      id: string;
      points: number;
    };
  }>;
}

interface SubjectPerformance {
  totalScore: number;
  count: number;
}

interface PerformanceDataPoint {
  date: string;
  score: number;
  quizTitle: string;
}

interface TopicMasteryItem {
  subjectId: string;
  subjectName: string;
  quizzesCompleted: number;
  averageScore: number;
  masteryLevel: 'Beginner' | 'Advanced' | 'Expert';
}

interface ProgressData {
  completed: number;
  total: number;
}

type Quiz = {
  id: string;
  title: string;
  description?: string | null;
  timeLimit?: number | null;
  createdAt: Date;
  subject?: {
    name: string;
  } | null;
  teacher?: {
    id: string;
    name: string | null;
  } | null;
  questions?: Array<{
    points: number;
  }>;
  _count: {
    questions: number;
  };
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  type?: string;
  icon: string;
  earnedAt: string;
  category?: string;
};

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Fetch all student data in a single optimized query
    const studentData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        organization: true,
        studentQuizAttempts: {
          include: {
            quiz: {
              include: {
                subject: true,
              },
            },
            answers: {
              include: {
                question: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!studentData?.student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const student = studentData.student;
    const attempts = studentData.studentQuizAttempts;
    const organization = studentData.organization;

    console.log('Total attempts fetched:', attempts.length);
    console.log(
      'Attempt details:',
      attempts.map((a: QuizAttempt) => ({
        id: a.id,
        completedAt: a.completedAt,
        score: a.score,
        quizId: a.quizId,
        quizTitle: a.quiz?.title,
        subject: a.quiz?.subject?.name,
        createdAt: a.createdAt,
      }))
    );

    // Calculate dashboard statistics
    const completedQuizzesCount = attempts.filter(
      (attempt: QuizAttempt) => attempt.completedAt !== null
    ).length;
    const totalScore = attempts.reduce(
      (sum: number, attempt: QuizAttempt) => sum + (attempt.score || 0),
      0
    );
    const averageScore =
      completedQuizzesCount > 0
        ? Math.round(totalScore / completedQuizzesCount)
        : 0;

    // Calculate study streak (consecutive days with quiz attempts)
    const attemptDates = attempts
      .map((attempt: QuizAttempt) => new Date(attempt.createdAt).toDateString())
      .filter(
        (date: string, index: number, arr: string[]) =>
          arr.indexOf(date) === index
      )
      .sort();

    let studyStreak = 0;
    if (attemptDates.length > 0) {
      const today = new Date().toDateString();
      const yesterday = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toDateString();

      if (attemptDates.includes(today) || attemptDates.includes(yesterday)) {
        studyStreak = 1;
        for (let i = attemptDates.length - 1; i > 0; i--) {
          const currentDate = new Date(attemptDates[i]);
          const prevDate = new Date(attemptDates[i - 1]);
          const diffDays = Math.floor(
            (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            studyStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Get available quizzes (not completed)
    const completedQuizIds = attempts
      .filter((attempt: QuizAttempt) => attempt.completedAt !== null)
      .map((attempt: QuizAttempt) => attempt.quizId);

    // Fetch available quizzes from the database
    const availableQuizzes = await prisma.quiz.findMany({
      where: {
        organizationId: studentData.organizationId,
        isPublished: true,
        id: {
          notIn: completedQuizIds,
        },
      },
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        questions: {
          select: {
            points: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch completed quizzes from the database
    const completedQuizzes = await prisma.quiz.findMany({
      where: {
        organizationId: studentData.organizationId,
        isPublished: true,
        id: {
          in: completedQuizIds,
        },
      },
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        questions: {
          select: {
            points: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transformedAvailableQuizzes = availableQuizzes.map((quiz: Quiz) => {
      const totalPoints =
        quiz.questions?.reduce(
          (sum: number, q: { points: number }) => sum + q.points,
          0
        ) || 0;
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        totalQuestions: quiz._count?.questions || 0,
        totalPoints: totalPoints,
        subject: quiz.subject?.name || 'Unknown',
        unit: 'Unknown', // Quiz doesn't have direct unit relationship
        difficulty: 'Medium', // Default difficulty
        createdAt: quiz.createdAt.toISOString(),
      };
    });

    const transformedCompletedQuizzes = completedQuizzes.map((quiz: Quiz) => {
      const totalPoints =
        quiz.questions?.reduce(
          (sum: number, q: { points: number }) => sum + q.points,
          0
        ) || 0;
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        totalQuestions: quiz._count?.questions || 0,
        totalPoints: totalPoints,
        subject: quiz.subject?.name || 'Unknown',
        unit: 'Unknown', // Quiz doesn't have direct unit relationship
        difficulty: 'Medium', // Default difficulty
        createdAt: quiz.createdAt.toISOString(),
      };
    });

    // Fetch subjects for the student's organization
    const subjects = await prisma.subject.findMany({
      where: {
        organizationId: studentData.organizationId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get recent attempts (last 5)
    const recentAttempts = attempts.slice(0, 5).map((attempt: QuizAttempt) => ({
      id: attempt.id,
      quizId: attempt.quizId, // Add quizId for mapping
      quizTitle: attempt.quiz?.title || 'Unknown',
      score: attempt.score,
      totalPoints: attempt.totalPoints || 0,
      status: attempt.completedAt !== null ? 'COMPLETED' : 'IN_PROGRESS',
      completedAt: attempt.completedAt,
      subject: attempt.quiz?.subject?.name || 'Unknown',
      unit: 'Unknown', // Quiz doesn't have a direct unit relationship
    }));

    // Calculate achievements and badges based on student performance
    const earnedAchievements: Achievement[] = [];

    // Quiz completion achievements
    if (completedQuizzesCount >= 1) {
      earnedAchievements.push({
        id: 'first-quiz',
        name: 'First Steps',
        description: 'Completed your first quiz',
        icon: '🎯',
        type: 'completion',
        category: 'completion',
        earnedAt: new Date().toISOString(),
      });
    }

    if (completedQuizzesCount >= 5) {
      earnedAchievements.push({
        id: 'quiz-master',
        name: 'Quiz Master',
        description: 'Completed 5 quizzes',
        icon: '🏆',
        category: 'completion',
        earnedAt: new Date().toISOString(),
      });
    }

    if (completedQuizzesCount >= 10) {
      earnedAchievements.push({
        id: 'quiz-expert',
        name: 'Quiz Expert',
        description: 'Completed 10 quizzes',
        icon: '👑',
        category: 'completion',
        earnedAt: new Date().toISOString(),
      });
    }

    // Performance achievements
    const perfectScores = attempts.filter(
      (attempt: QuizAttempt) =>
        attempt.completedAt !== null &&
        attempt.score !== null &&
        attempt.totalPoints !== null &&
        attempt.score === attempt.totalPoints
    ).length;

    if (perfectScores >= 1) {
      earnedAchievements.push({
        id: 'perfect-score',
        name: 'Perfect Score',
        description: 'Achieved a perfect score',
        icon: '⭐',
        category: 'performance',
        earnedAt: new Date().toISOString(),
      });
    }

    if (perfectScores >= 3) {
      earnedAchievements.push({
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieved 3 perfect scores',
        icon: '💎',
        category: 'performance',
        earnedAt: new Date().toISOString(),
      });
    }

    // High average score achievements
    if (averageScore >= 90) {
      earnedAchievements.push({
        id: 'excellent-student',
        name: 'Excellent Student',
        description: 'Maintained 90%+ average',
        icon: '🌟',
        category: 'performance',
        earnedAt: new Date().toISOString(),
      });
    } else if (averageScore >= 80) {
      earnedAchievements.push({
        id: 'good-student',
        name: 'Good Student',
        description: 'Maintained 80%+ average',
        icon: '✨',
        category: 'performance',
        earnedAt: new Date().toISOString(),
      });
    }

    // Study streak achievements
    if (studyStreak >= 3) {
      earnedAchievements.push({
        id: 'consistent-learner',
        name: 'Consistent Learner',
        description: '3-day study streak',
        icon: '🔥',
        category: 'streak',
        earnedAt: new Date().toISOString(),
      });
    }

    if (studyStreak >= 7) {
      earnedAchievements.push({
        id: 'dedicated-learner',
        name: 'Dedicated Learner',
        description: '7-day study streak',
        icon: '🚀',
        category: 'streak',
        earnedAt: new Date().toISOString(),
      });
    }

    // Subject mastery achievements
    const subjectCount = new Set(
      attempts
        .filter((attempt: QuizAttempt) => attempt.completedAt !== null)
        .map((attempt: QuizAttempt) => attempt.quiz?.subject?.name)
        .filter(Boolean)
    ).size;

    if (subjectCount >= 2) {
      earnedAchievements.push({
        id: 'multi-subject',
        name: 'Multi-Subject Explorer',
        description: 'Completed quizzes in 2+ subjects',
        icon: '📚',
        category: 'mastery',
        earnedAt: new Date().toISOString(),
      });
    }

    if (subjectCount >= 5) {
      earnedAchievements.push({
        id: 'subject-master',
        name: 'Subject Master',
        description: 'Completed quizzes in 5+ subjects',
        icon: '🎓',
        category: 'mastery',
        earnedAt: new Date().toISOString(),
      });
    }

    // Calculate weekly and monthly progress
    const now = new Date();
    const weekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() + 1
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const weeklyAttempts = attempts.filter(
      (attempt: QuizAttempt) => new Date(attempt.createdAt) >= weekStart
    );
    const monthlyAttempts = attempts.filter(
      (attempt: QuizAttempt) => new Date(attempt.createdAt) >= monthStart
    );

    const weeklyProgress: ProgressData = {
      completed: weeklyAttempts.filter(
        (attempt: QuizAttempt) => attempt.completedAt !== null
      ).length,
      total: weeklyAttempts.length,
    };

    const monthlyProgress: ProgressData = {
      completed: monthlyAttempts.filter(
        (attempt: QuizAttempt) => attempt.completedAt !== null
      ).length,
      total: monthlyAttempts.length,
    };

    // Weekly progress achievements
    if (weeklyProgress.completed >= 3) {
      earnedAchievements.push({
        id: 'weekly-warrior',
        name: 'Weekly Warrior',
        description: 'Completed 3+ quizzes this week',
        icon: '⚡',
        category: 'progress',
        earnedAt: new Date().toISOString(),
      });
    }

    // Transform achievements for frontend
    const transformedAchievements = earnedAchievements.map((achievement) => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      earnedAt: achievement.earnedAt,
    }));

    // Calculate performance data for charts
    const performanceData: PerformanceDataPoint[] = attempts
      .filter(
        (attempt: QuizAttempt) =>
          attempt.completedAt !== null && attempt.score !== null
      )
      .map((attempt: QuizAttempt) => ({
        date: new Date(attempt.completedAt || attempt.createdAt)
          .toISOString()
          .split('T')[0],
        score: attempt.score || 0,
        quizTitle: attempt.quiz?.title || 'Unknown',
      }))
      .sort(
        (a: PerformanceDataPoint, b: PerformanceDataPoint) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    // Calculate real topic mastery based on student's performance by subject
    const subjectPerformance = new Map<string, SubjectPerformance>();

    console.log('Calculating topic mastery for attempts:', attempts.length);
    console.log(
      'All attempts:',
      attempts.map((a: QuizAttempt) => ({
        id: a.id,
        completedAt: a.completedAt,
        score: a.score,
        quizTitle: a.quiz?.title,
        subject: a.quiz?.subject?.name,
      }))
    );

    const completedAttempts = attempts.filter(
      (attempt: QuizAttempt) =>
        attempt.completedAt !== null && attempt.score !== null
    );

    console.log('Completed attempts:', completedAttempts.length);
    console.log(
      'Completed attempts details:',
      completedAttempts.map((a: QuizAttempt) => ({
        id: a.id,
        completedAt: a.completedAt,
        score: a.score,
        quizTitle: a.quiz?.title,
        subject: a.quiz?.subject?.name,
      }))
    );

    completedAttempts.forEach((attempt: QuizAttempt) => {
      const subjectName = attempt.quiz?.subject?.name || 'Unknown';
      const current = subjectPerformance.get(subjectName) || {
        totalScore: 0,
        count: 0,
      };
      current.totalScore += attempt.score || 0;
      current.count += 1;
      subjectPerformance.set(subjectName, current);
      console.log(
        `Subject: ${subjectName}, Score: ${attempt.score}, Running total: ${current.totalScore}, Count: ${current.count}`
      );
    });

    const calculatedTopicMastery: TopicMasteryItem[] = Array.from(
      subjectPerformance.entries()
    ).map(([subjectName, data]) => ({
      subjectId: `subject-${subjectName}`, // Generate a unique ID
      subjectName,
      quizzesCompleted: data.count,
      averageScore:
        data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
      masteryLevel:
        data.count > 0
          ? data.totalScore / data.count >= 80
            ? 'Expert'
            : data.totalScore / data.count >= 60
            ? 'Advanced'
            : 'Beginner'
          : 'Beginner',
    }));

    console.log('Calculated topic mastery:', calculatedTopicMastery);

    // Prepare comprehensive response with settings and export data
    const dashboardData = {
      dashboard: {
        stats: {
          completedQuizzesCount,
          averageScore,
          studyStreak,
          totalPoints: totalScore,
          timeSpent: attempts.reduce(
            (sum: number, attempt: QuizAttempt) =>
              sum + (attempt.timeSpent || 0),
            0
          ),
          weeklyProgress,
          monthlyProgress,
        },
        availableQuizzes: transformedAvailableQuizzes,
        recentAttempts,
        achievements: transformedAchievements,
      },

      progress: {
        performance: performanceData,
        topicMastery: calculatedTopicMastery,
        weeklyProgress,
        monthlyProgress,
      },

      quizzes: {
        subjects: subjects, // Will be populated when we implement subject fetching
        availableQuizzes: transformedAvailableQuizzes,
        completedQuizzes: transformedCompletedQuizzes,
      },

      achievements: {
        earned: transformedAchievements,
        totalEarned: transformedAchievements.length,
        totalAvailable: 10, // You can adjust this based on your achievement system
      },

      profile: {
        user: {
          id: studentData.id,
          name: studentData.name,
          email: studentData.email,
          role: studentData.role,
          profileImageUrl: studentData.profileImageUrl,
          studentId: student.studentId,
          academicLevel: student.academicLevel,
          classYear: student.classYear,
          phoneNumber: student.phoneNumber,
        },
        organization: organization,
        profileCompleted: !!(
          student.studentId &&
          student.academicLevel &&
          student.classYear
        ),
      },

      // Export data for settings page
      exportData: {
        profile: {
          name: studentData.name || '',
          email: studentData.email || '',
          school: organization.name || '',
          department: student.academicLevel || '',
          year: student.classYear || '',
          regNo: student.studentId || '',
          phone: student.phoneNumber || '',
          academicLevel: student.academicLevel || '',
        },
        quizAttempts: completedAttempts.map((attempt: QuizAttempt) => ({
          quizTitle: attempt.quiz?.title || '',
          subject: attempt.quiz?.subject?.name || '',
          score: attempt.score || 0,
          totalPoints: attempt.totalPoints || 0,
          completedAt: attempt.completedAt
            ? new Date(attempt.completedAt).toLocaleString()
            : '',
        })),
        achievements: transformedAchievements.map(
          (achievement: Achievement) => ({
            title: achievement.name || '',
            name: achievement.name || '',
            description: achievement.description || '',
          })
        ),
        badges: transformedAchievements
          .filter((achievement: Achievement) => achievement.type === 'badge')
          .map((badge: Achievement) => ({
            name: badge.name || '',
            description: badge.description || '',
          })),
        analytics: {
          totalQuizzes: completedQuizzesCount,
          averageScore,
          studyStreak,
          totalTimeSpent: attempts.reduce(
            (sum: number, attempt: QuizAttempt) =>
              sum + (attempt.timeSpent || 0),
            0
          ),
        },
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching student dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student dashboard data' },
      { status: 500 }
    );
  }
}

// PUT: Update student settings
export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings data is required' },
        { status: 400 }
      );
    }

    // For now, we'll just return success since we don't have a settings table
    // In a real implementation, you would save to a settings table
    console.log('Updating settings for user:', userId, settings);

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Error updating student settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
