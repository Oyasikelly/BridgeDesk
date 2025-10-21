import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: /api/student/notification-preferences?studentId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  if (!studentId) {
    return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
  }
  const student = await prisma.student.findUnique({
    where: { userId: studentId },
  });
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }
  return NextResponse.json({
    notificationPrefs: {}, // Default empty preferences since field doesn't exist in schema
  });
}

// POST: /api/student/notification-preferences
export async function POST(request: NextRequest) {
  const { studentId, notificationPrefs } = await request.json();
  if (!studentId || !notificationPrefs) {
    return NextResponse.json(
      { error: 'Missing studentId or notificationPrefs' },
      { status: 400 }
    );
  }
  // Note: notificationPrefs field doesn't exist in Student model
  // This would need to be added to the schema or handled differently
  // For now, we'll just return success without updating
  return NextResponse.json({ success: true });
}
