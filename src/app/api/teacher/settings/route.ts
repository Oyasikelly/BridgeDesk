import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UpdateSettingsRequest {
  defaultTimeLimit?: number;
  aiExplanations?: boolean;
  darkMode?: boolean;
  emailSubmissions?: boolean;
  emailAnalytics?: boolean;
  inAppAI?: boolean;
  analyticsConsent?: boolean;
}

// GET - Fetch teacher settings
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

    // Verify teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId, role: 'TEACHER' },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get or create teacher settings
    let settings = await prisma.teacherSettings.findUnique({
      where: { teacherId },
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.teacherSettings.create({
        data: {
          teacherId,
          defaultTimeLimit: 30,
          aiExplanations: true,
          darkMode: false,
          emailSubmissions: true,
          emailAnalytics: true,
          inAppAI: true,
          analyticsConsent: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching teacher settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update teacher settings
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateSettingsRequest = await request.json();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
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

    // Update or create settings
    const settings = await prisma.teacherSettings.upsert({
      where: { teacherId },
      update: body,
      create: {
        teacherId,
        defaultTimeLimit: body.defaultTimeLimit ?? 30,
        aiExplanations: body.aiExplanations ?? true,
        darkMode: body.darkMode ?? false,
        emailSubmissions: body.emailSubmissions ?? true,
        emailAnalytics: body.emailAnalytics ?? true,
        inAppAI: body.inAppAI ?? true,
        analyticsConsent: body.analyticsConsent ?? true,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating teacher settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
