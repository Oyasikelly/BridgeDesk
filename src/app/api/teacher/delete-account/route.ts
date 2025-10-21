import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DeleteAccountRequest {
  teacherId: string;
  password: string;
  confirmation: string;
  accessToken?: string; // Supabase access token
}

export async function DELETE(request: NextRequest) {
  try {
    const body: DeleteAccountRequest = await request.json();
    const { teacherId, password, confirmation, accessToken } = body;

    // Validate required fields
    if (!teacherId || !password || !confirmation) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate confirmation
    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Please type DELETE to confirm account deletion' },
        { status: 400 }
      );
    }

    // Verify teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId, role: 'TEACHER' },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Verify with Supabase if access token is provided
    if (accessToken) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(accessToken);

      if (userError || !user) {
        return NextResponse.json(
          { error: 'Invalid access token' },
          { status: 401 }
        );
      }

      // Verify the user email matches our teacher
      if (user.email !== teacher.email) {
        return NextResponse.json({ error: 'Email mismatch' }, { status: 400 });
      }
    } else {
      // Fallback to bcrypt comparison if no access token (for backward compatibility)
      if (!teacher.password) {
        return NextResponse.json(
          { error: 'No password set for this account' },
          { status: 400 }
        );
      }

      const { compare } = await import('bcryptjs');
      const isPasswordValid = await compare(password, teacher.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Password is incorrect' },
          { status: 400 }
        );
      }
    }

    // Delete teacher settings
    await prisma.teacherSettings.deleteMany({
      where: { teacherId },
    });

    // Delete teacher's quizzes
    await prisma.quiz.deleteMany({
      where: { teacherId },
    });

    // Delete teacher's questions
    await prisma.question.deleteMany({
      where: { quiz: { teacherId } },
    });

    // Delete teacher's quiz attempts (if any)
    await prisma.quizAttempt.deleteMany({
      where: { quiz: { teacherId } },
    });

    // Finally, delete the teacher account
    await prisma.user.delete({
      where: { id: teacherId },
    });

    return NextResponse.json({
      message: 'Account deleted successfully',
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
