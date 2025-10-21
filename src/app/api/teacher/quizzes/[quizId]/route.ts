import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Transform question type from frontend format to database format
function transformQuestionType(frontendType: string): string {
  console.log('🔍 API transformQuestionType called with:', frontendType);
  const typeMap: Record<string, string> = {
    ['multiple-choice']: 'MULTIPLE_CHOICE',
    ['true-false']: 'TRUE_FALSE',
    ['short-answer']: 'SHORT_ANSWER',
    ['essay']: 'ESSAY',
    ['fill-blank']: 'FILL_BLANK',
  };
  const result = typeMap[frontendType] || frontendType.toUpperCase();
  console.log('🔍 API transformQuestionType result:', result);
  return result;
}

// Define the type for question input

type QuestionInput = {
  type: string;
  question: string;
  options?: { text: string; value?: string; isCorrect?: boolean }[];
  correctAnswer?: string;
  points?: number;
  order?: number;
};

// GET: Fetch a specific quiz
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
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
    const { quizId } = await params;

    // Get the quiz with all related data
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
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

    // Direct check for questions
    const questionsCount = await prisma.question.count({
      where: { quizId: quizId },
    });
    console.log(
      '🔍 API: Direct questions count from database:',
      questionsCount
    );

    console.log('🔍 API: Quiz found:', !!quiz);
    console.log('🔍 API: Quiz ID:', quiz?.id);
    console.log('🔍 API: Quiz title:', quiz?.title);
    console.log('🔍 API: Questions count:', quiz?.questions?.length);
    console.log('🔍 API: Questions:', quiz?.questions);
    console.log('🔍 API: Quiz data keys:', Object.keys(quiz || {}));
    console.log('🔍 API: Full quiz object:', JSON.stringify(quiz, null, 2));

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Verify the teacher owns this quiz
    if (quiz.teacherId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to access this quiz' },
        { status: 403 }
      );
    }

    // Calculate statistics
    const totalAttempts = quiz.attempts.length;
    const completedAttempts = quiz.attempts.filter(
      (attempt) => attempt.completedAt
    ).length;
    const averageScore =
      totalAttempts > 0
        ? Math.round(
            quiz.attempts.reduce(
              (sum, attempt) => sum + (attempt.score || 0),
              0
            ) / totalAttempts
          )
        : 0;

    const quizWithStats = {
      ...quiz,
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

    return NextResponse.json({ quiz: quizWithStats });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

// PUT: Update a quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
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
    const { quizId } = await params;
    const body = await request.json();

    // Verify the teacher owns this quiz
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (existingQuiz.teacherId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this quiz' },
        { status: 403 }
      );
    }

    // Prepare update data with only valid fields from Quiz model
    const updateData: Record<string, unknown> = {};

    // Only include fields that exist in the Quiz model schema
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.subjectId !== undefined) updateData.subjectId = body.subjectId;
    if (body.timeLimit !== undefined) updateData.timeLimit = body.timeLimit;
    if (body.totalPoints !== undefined)
      updateData.totalPoints = body.totalPoints;
    if (body.isPublished !== undefined)
      updateData.isPublished = body.isPublished;
    if (body.status !== undefined) updateData.status = body.status;

    // Note: The following fields are NOT in the Quiz model schema, so we skip them:
    // - difficulty, category, tags, estimatedDuration, showTimer, autoSubmit
    // - passingScore, showScoreImmediately, allowRetakes, maxAttempts
    // - startDate, endDate, assignToClasses, assignToStudents
    // - requirePassword, password, questionsPerPage, randomizeQuestions
    // - randomizeAnswers, showQuestionNumbers

    console.log('🔍 API: Update data being sent:', updateData);

    // Handle questions update if provided
    if (body.questions !== undefined) {
      console.log('🔍 API: Updating questions, count:', body.questions.length);

      // Delete existing questions
      await prisma.question.deleteMany({
        where: { quizId: quizId },
      });
      console.log('🔍 API: Deleted existing questions');

      // Create new questions
      if (body.questions.length > 0) {
        console.log('🔍 API: Creating new questions');

        // Get the quiz to get organizationId
        const quiz = await prisma.quiz.findUnique({
          where: { id: quizId },
          select: { organizationId: true },
        });

        if (!quiz) {
          throw new Error('Quiz not found');
        }

        const questionsData = body.questions.map(
          (q: QuestionInput, index: number) => {
            const transformedType = transformQuestionType(q.type);
            console.log(
              '🔍 API: Question type transformation:',
              q.type,
              '->',
              transformedType
            );
            return {
              text: q.question, // Frontend sends 'question' field, map to database 'text'
              type: transformedType, // Transform frontend type to database type
              options: q.options || [],
              correctAnswer: q.correctAnswer || '',
              points: q.points || 1,
              order: q.order || index + 1,
              quizId: quizId,
              organizationId: quiz.organizationId, // Add organizationId from quiz
            };
          }
        );

        console.log('🔍 API: Questions data to create:', questionsData);
        console.log('🔍 API: Quiz ID being used:', quizId);
        console.log('🔍 API: Organization ID being used:', quiz.organizationId);
        console.log('🔍 API: Raw questions from request body:', body.questions);

        await prisma.question.createMany({
          data: questionsData,
        });
        console.log('🔍 API: Successfully created questions');

        // Verify questions were created
        const createdQuestionsCount = await prisma.question.count({
          where: { quizId: quizId },
        });
        console.log(
          '🔍 API: Questions count after creation:',
          createdQuestionsCount
        );
      }
    }

    // Update the quiz
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: updateData,
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
      quiz: updatedQuiz,
      message: 'Quiz updated successfully',
    });
  } catch (error) {
    console.error('🔍 Error updating quiz:', error);
    console.error('🔍 Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name,
    });
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
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
    const { quizId } = await params;

    // Verify the teacher owns this quiz
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (existingQuiz.teacherId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this quiz' },
        { status: 403 }
      );
    }

    // Check if quiz has attempts (warn before deletion)
    const attemptsCount = await prisma.quizAttempt.count({
      where: { quizId },
    });

    if (attemptsCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete quiz with existing attempts',
          attemptsCount,
        },
        { status: 400 }
      );
    }

    // Delete the quiz (cascade will handle related data)
    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return NextResponse.json({
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}
