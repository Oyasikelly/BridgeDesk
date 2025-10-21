import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  if (!studentId) {
    return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
  }

  // Fetch all quiz attempts for the student
  const attempts = await prisma.quizAttempt.findMany({
    where: { studentId, completedAt: { not: null } },
    include: {
      quiz: { include: { subject: true } },
    },
  });

  // Group attempts by subject
  const subjectScores: Record<string, { name: string; scores: number[] }> = {};
  for (const a of attempts) {
    const subject = a.quiz?.subject;
    if (!subject) continue;
    if (!subjectScores[subject.id])
      subjectScores[subject.id] = { name: subject.name, scores: [] };
    if (typeof a.score === 'number')
      subjectScores[subject.id].scores.push(a.score);
  }

  // Build recommendations
  const recommendations = [];
  for (const subjId in subjectScores) {
    const subj = subjectScores[subjId];
    const avg = subj.scores.length
      ? subj.scores.reduce((a, b) => a + b, 0) / subj.scores.length
      : 0;
    if (avg < 70) {
      recommendations.push({
        id: `rec-${subjId}`,
        text: `Practice more on ${subj.name} to boost your score.`,
      });
    }
  }
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-more-quizzes',
      text: 'Take more quizzes to keep improving your performance!',
    });
  }

  return NextResponse.json({ recommendations });
}
