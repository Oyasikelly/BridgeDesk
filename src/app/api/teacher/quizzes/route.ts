import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import { QuestionType } from '@prisma/client';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define interfaces for type safety
interface WhereClause {
  teacherId: string;
  isPublished?: boolean;
  subjectId?: string;
  OR?: Array<{
    title?: { contains: string; mode: 'insensitive' };
    description?: { contains: string; mode: 'insensitive' };
  }>;
}

interface QuestionData {
  text: string;
  type: string;
  points: number;
  options?: Array<{ text: string } | string>;
  correctAnswer?: string;
}

interface QuizCreationData {
  title: string;
  description: string;
  subjectId: string;
  timeLimit?: number;
  totalPoints?: number;
  isPublished: boolean;
  questions: QuestionData[];
}

function transformQuestionType(frontendType: string): string {
  const typeMap: Record<string, string> = {
    'multiple-choice': 'MULTIPLE_CHOICE',
    'true-false': 'TRUE_FALSE',
    'short-answer': 'SHORT_ANSWER',
    essay: 'ESSAY',
    'fill-blank': 'FILL_BLANK',
  };
  return typeMap[frontendType] || frontendType.toUpperCase();
}

// GET: Fetch teacher's quizzes
export async function GET(request: NextRequest) {
  try {
    // Get userId from query params for now
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    console.log('🔍 Processing quiz request for user ID:', userId);

    // Get query parameters
    const status = searchParams.get('status'); // 'all', 'published', 'draft'
    const subjectId = searchParams.get('subjectId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build where clause
    const whereClause: WhereClause = {
      teacherId: userId,
    };

    if (status && status !== 'all') {
      whereClause.isPublished = status === 'published';
    }

    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get quizzes with related data
    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
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
        questions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Validate that we're only getting quiz objects, not quiz attempts
    const validQuizzes = quizzes.filter((quiz: unknown) => {
      // Ensure this is a quiz object with required properties
      const quizObj = quiz as Record<string, unknown>;
      if (
        !quizObj.id ||
        !quizObj.title ||
        !quizObj.subjectId ||
        !quizObj.teacherId
      ) {
        console.error('Invalid quiz object found:', quiz);
        return false;
      }

      // Ensure it doesn't have attempt-specific properties
      if (
        quizObj.studentId ||
        quizObj.score !== undefined ||
        quizObj.timeSpent !== undefined
      ) {
        console.error('Quiz object has attempt properties:', quiz);
        return false;
      }

      return true;
    });

    console.log(
      `🔍 Found ${quizzes.length} total objects, ${validQuizzes.length} valid quizzes`
    );

    // Get total count for pagination
    const totalQuizzes = await prisma.quiz.count({
      where: whereClause,
    });

    // Calculate statistics for each quiz
    const quizzesWithStats = validQuizzes.map((quiz: unknown) => {
      const quizObj = quiz as Record<string, unknown> & {
        id: string;
        title: string;
        subjectId: string;
        teacherId: string;
        attempts: Array<{
          completedAt: Date | null;
          score: number | null;
        }>;
        questions: Array<unknown>;
        isPublished: boolean;
        status: string;
      };
      const totalAttempts = quizObj.attempts.length;
      const completedAttempts = quizObj.attempts.filter(
        (attempt) => attempt.completedAt
      ).length;
      const averageScore =
        totalAttempts > 0
          ? Math.round(
              quizObj.attempts.reduce(
                (sum: number, attempt) => sum + (attempt.score || 0),
                0
              ) / totalAttempts
            )
          : 0;

      return {
        id: quizObj.id,
        title: quizObj.title,
        subjectId: quizObj.subjectId,
        teacherId: quizObj.teacherId,
        attempts: quizObj.attempts,
        questions: quizObj.questions,
        isPublished: quizObj.isPublished,
        status: quizObj.status,
        stats: {
          totalAttempts,
          completedAttempts,
          averageScore,
          completionRate:
            totalAttempts > 0
              ? Math.round((completedAttempts / totalAttempts) * 100)
              : 0,
        },
      };
    });

    console.log(
      `📊 Found ${quizzesWithStats.length} quizzes for teacher ${userId}`
    );

    // Debug: Log the first quiz structure to help identify issues
    if (quizzesWithStats.length > 0) {
      console.log('🔍 Sample quiz structure:', {
        id: quizzesWithStats[0].id,
        title: quizzesWithStats[0].title,
        subjectId: quizzesWithStats[0].subjectId,
        teacherId: quizzesWithStats[0].teacherId,
        hasAttempts: quizzesWithStats[0].attempts?.length > 0,
        hasQuestions: quizzesWithStats[0].questions?.length > 0,
        isPublished: quizzesWithStats[0].isPublished,
        status: quizzesWithStats[0].status,
      });
    }

    return NextResponse.json({
      quizzes: quizzesWithStats,
      pagination: {
        page,
        limit,
        total: totalQuizzes,
        totalPages: Math.ceil(totalQuizzes / limit),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching teacher quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

// POST: Create a new quiz
export async function POST(request: NextRequest) {
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

    console.log('[Quiz API] Creating quiz with data:', {
      title: body.title,
      subjectId: body.subjectId,
      isPublished: body.isPublished,
      questionsCount: body.questions?.length || 0,
      userId: userId,
    });

    const {
      title,
      description,
      subjectId,
      timeLimit,
      totalPoints,
      isPublished = false,
      questions = [],
    } = body as QuizCreationData;

    // Validate required fields
    if (!title || !subjectId) {
      return NextResponse.json(
        { error: 'Title and subject are required' },
        { status: 400 }
      );
    }

    // Verify teacher has access to this subject
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: { subjects: true },
    });

    if (!teacher) {
      console.log('[Quiz API] Teacher not found for userId:', userId);
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get teacher's user data for organizationId
    const teacherUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!teacherUser) {
      console.log('[Quiz API] Teacher user not found for userId:', userId);
      return NextResponse.json(
        { error: 'Teacher user not found' },
        { status: 404 }
      );
    }

    console.log('[Quiz API] Teacher found:', {
      teacherId: teacher.id,
      userId: teacher.userId,
      organizationId: teacherUser.organizationId,
      subjectsCount: teacher.subjects.length,
      subjectIds: teacher.subjects.map((s) => s.id),
    });

    const hasSubjectAccess = teacher.subjects.some(
      (subject) => subject.id === subjectId
    );

    if (!hasSubjectAccess) {
      console.log(
        '[Quiz API] Teacher does not have access to subject:',
        subjectId
      );
      return NextResponse.json(
        { error: 'You do not have access to this subject' },
        { status: 403 }
      );
    }

    // Create the quiz
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        subjectId,
        teacherId: userId,
        timeLimit: timeLimit || null,
        totalPoints: totalPoints || 0,
        isPublished,
        organizationId: teacherUser.organizationId,
      },
      include: {
        subject: true,
        questions: true,
      },
    });

    // If questions are provided, create them
    if (questions.length > 0) {
      console.log('[Quiz API] Creating questions:', questions.length);
      for (let i = 0; i < questions.length; i++) {
        const questionData = questions[i];
        const {
          text,
          type,
          points,
          options = [],
          correctAnswer,
        } = questionData;

        console.log('[Quiz API] Creating question:', {
          index: i,
          text: text?.substring(0, 50) + '...',
          type,
          points,
          optionsCount: options.length,
          correctAnswer: correctAnswer?.substring(0, 20) + '...',
        });

        const question = await prisma.question.create({
          data: {
            text,
            type: transformQuestionType(type) as QuestionType,
            points: points || 1,
            quizId: quiz.id,
            correctAnswer: correctAnswer || '',
            order: i + 1,
            organizationId: teacherUser.organizationId,
            options: options.map((opt: { text: string } | string) =>
              typeof opt === 'string' ? opt : opt.text
            ),
          },
        });

        console.log('[Quiz API] Question created:', question.id);
      }
    }

    // Fetch the created quiz with all relations
    const createdQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: {
        subject: true,
        questions: true,
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

    return NextResponse.json({
      quiz: createdQuiz,
      message: 'Quiz created successfully',
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
    });
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
