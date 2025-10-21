import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  if (!studentId) {
    return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
  }

  // Get the student's user and organization
  const user = await prisma.user.findUnique({
    where: { id: studentId },
    select: { organizationId: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Get all students in the same organization
  const students = await prisma.user.findMany({
    where: { organizationId: user.organizationId, role: 'STUDENT' },
    select: { id: true },
  });
  const studentIds = students.map((s: { id: string }) => s.id);

  // Get all quiz attempts for these students
  const allAttempts = await prisma.quizAttempt.findMany({
    where: {
      studentId: { in: studentIds },
      completedAt: { not: null },
    },
  });

  // Calculate average score for each student
  const studentScores: Record<string, number[]> = {};
  for (const attempt of allAttempts as Array<{
    studentId: string;
    score: number | null;
  }>) {
    if (!studentScores[attempt.studentId])
      studentScores[attempt.studentId] = [];
    if (typeof attempt.score === 'number')
      studentScores[attempt.studentId].push(attempt.score);
  }
  const studentAverages = Object.entries(studentScores).map(
    ([id, scores]: [string, number[]]) => ({
      id,
      avg: scores.length
        ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
        : 0,
    })
  );

  // Find this student's average
  const yourAvgObj = studentAverages.find(
    (s: { id: string; avg: number }) => s.id === studentId
  );
  const yourAverage = yourAvgObj ? Math.round(yourAvgObj.avg) : 0;

  // Calculate class average
  const classAverage = studentAverages.length
    ? Math.round(
        studentAverages.reduce(
          (a: number, b: { avg: number }) => a + b.avg,
          0
        ) / studentAverages.length
      )
    : 0;

  // Calculate percentile
  const sorted = studentAverages.sort(
    (a: { avg: number }, b: { avg: number }) => b.avg - a.avg
  );
  const yourRank =
    sorted.findIndex((s: { id: string }) => s.id === studentId) + 1;
  const percentile =
    studentAverages.length > 0
      ? Math.round(
          ((studentAverages.length - yourRank) / studentAverages.length) * 100
        )
      : 0;

  return NextResponse.json({
    percentile,
    classAverage,
    yourAverage,
  });
}
