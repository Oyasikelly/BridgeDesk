import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define interfaces for export data structure
interface TeacherData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  timeLimit: number | null;
  totalPoints: number;
  status: string;
  questions: number;
  attempts: number;
  createdAt: Date;
}

interface QuizAttemptData {
  id: string;
  score: number;
  totalPoints: number;
  timeSpent: number;
  completedAt: Date | null;
  student: {
    id: string;
    name: string | null;
    email: string;
  };
  quiz: {
    id: string;
    title: string;
  };
}

interface SummaryData {
  totalQuizzes: number;
  totalQuestions: number;
  totalAttempts: number;
  totalStudents: number;
  averageScore: number;
}

interface ExportData {
  exportDate: string;
  teacher: TeacherData;
  quizzes: QuizData[];
  quizAttempts: QuizAttemptData[];
  summary: SummaryData;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const format = searchParams.get('format') || 'json';

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

    const [
      teacherData, // skip settings
      ,
      quizzes,
      questions,
      quizAttempts, // skip subjects
      ,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: teacherId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.teacherSettings.findUnique({
        where: { teacherId },
      }),
      prisma.quiz.findMany({
        where: { teacherId },
        include: {
          questions: true,
          attempts: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.question.findMany({
        where: {
          quiz: {
            teacherId: teacherId,
          },
        },
      }),
      prisma.quizAttempt.findMany({
        where: {
          quiz: {
            teacherId: teacherId,
          },
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          quiz: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.subject.findMany({
        where: { organizationId: teacher.organizationId },
      }),
    ]);

    // Add a runtime check for teacherData
    if (!teacherData) {
      return NextResponse.json(
        { error: 'Teacher data not found' },
        { status: 404 }
      );
    }

    // Compile export data
    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      teacher: teacherData,
      quizzes: quizzes.map((quiz) => ({
        ...quiz,
        questions: quiz.questions.length,
        attempts: quiz.attempts.length,
      })),
      quizAttempts: quizAttempts, // Keep the full array for export formats
      summary: {
        totalQuizzes: quizzes.length,
        totalQuestions: questions.length,
        totalAttempts: quizAttempts.length,
        totalStudents: new Set(
          quizAttempts.map((attempt) => attempt.student.id)
        ).size,
        averageScore:
          quizAttempts.length > 0
            ? quizAttempts.reduce(
                (sum, attempt) => sum + (attempt.score || 0),
                0
              ) / quizAttempts.length
            : 0,
      },
    };

    // Return data based on format
    switch (format.toLowerCase()) {
      case 'json':
        return NextResponse.json(exportData);

      case 'csv':
        const csvData = generateCSV(exportData);
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="teacher-data-${
              new Date().toISOString().split('T')[0]
            }.csv"`,
          },
        });

      case 'pdf':
        const pdfBuffer = await generatePDF(exportData);
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="teacher-data-${
              new Date().toISOString().split('T')[0]
            }.pdf"`,
          },
        });

      case 'docx':
        const docxBuffer = await generateDOCX(exportData);
        return new NextResponse(docxBuffer, {
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="teacher-data-${
              new Date().toISOString().split('T')[0]
            }.docx"`,
          },
        });

      default:
        return NextResponse.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting teacher data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

// Helper function to generate CSV
function generateCSV(data: ExportData): string {
  const lines = [];

  // Header
  lines.push('Teacher Data Export');
  lines.push(`Export Date: ${data.exportDate}`);
  lines.push('');

  // Teacher Info
  lines.push('TEACHER INFORMATION');
  lines.push('Name,Email,Role,Organization ID,Created At');
  lines.push(
    `${data.teacher.name || 'N/A'},${data.teacher.email},${data.teacher.role},${
      data.teacher.organizationId
    },${data.teacher.createdAt}`
  );
  lines.push('');

  // Summary
  lines.push('SUMMARY');
  lines.push(
    'Total Quizzes,Total Questions,Total Attempts,Total Students,Average Score'
  );
  lines.push(
    `${data.summary.totalQuizzes},${data.summary.totalQuestions},${
      data.summary.totalAttempts
    },${data.summary.totalStudents},${data.summary.averageScore.toFixed(2)}`
  );
  lines.push('');

  // Quizzes
  lines.push('QUIZZES');
  lines.push(
    'Title,Description,Subject ID,Time Limit,Total Points,Status,Questions Count,Attempts Count,Created At'
  );
  data.quizzes.forEach((quiz) => {
    lines.push(
      `"${quiz.title}","${quiz.description}",${quiz.subjectId},${
        quiz.timeLimit || 'N/A'
      },${quiz.totalPoints},${quiz.status},${quiz.questions},${quiz.attempts},${
        quiz.createdAt
      }`
    );
  });
  lines.push('');

  // Quiz Attempts
  lines.push('QUIZ ATTEMPTS');
  lines.push(
    'Student Name,Student Email,Quiz Title,Score,Total Points,Time Spent,Completed At'
  );
  if (Array.isArray(data.quizAttempts)) {
    data.quizAttempts.forEach((attempt) => {
      lines.push(
        `"${attempt.student.name || 'N/A'}","${attempt.student.email}","${
          attempt.quiz.title
        }",${attempt.score},${attempt.totalPoints},${attempt.timeSpent},${
          attempt.completedAt || 'N/A'
        }`
      );
    });
  }

  return lines.join('\n');
}

// Helper function to generate PDF
async function generatePDF(data: ExportData): Promise<Buffer> {
  // For now, return a simple text-based PDF
  // In a real implementation, you'd use a library like jsPDF or Puppeteer
  const content = `
Teacher Data Export
Export Date: ${data.exportDate}

TEACHER INFORMATION
Name: ${data.teacher.name || 'N/A'}
Email: ${data.teacher.email}
Role: ${data.teacher.role}
Organization ID: ${data.teacher.organizationId}
Created At: ${data.teacher.createdAt}

SUMMARY
Total Quizzes: ${data.summary.totalQuizzes}
Total Questions: ${data.summary.totalQuestions}
Total Attempts: ${data.summary.totalAttempts}
Total Students: ${data.summary.totalStudents}
Average Score: ${data.summary.averageScore.toFixed(2)}

QUIZZES
${data.quizzes
  .map(
    (quiz) => `
Title: ${quiz.title}
Description: ${quiz.description}
Subject ID: ${quiz.subjectId}
Time Limit: ${quiz.timeLimit || 'N/A'}
Total Points: ${quiz.totalPoints}
Status: ${quiz.status}
Questions: ${quiz.questions}
Attempts: ${quiz.attempts}
Created At: ${quiz.createdAt}
`
  )
  .join('\n')}

QUIZ ATTEMPTS
${
  Array.isArray(data.quizAttempts)
    ? data.quizAttempts
        .map(
          (attempt) => `
Student: ${attempt.student.name || 'N/A'} (${attempt.student.email})
Quiz: ${attempt.quiz.title}
Score: ${attempt.score}/${attempt.totalPoints}
Time Spent: ${attempt.timeSpent} minutes
Completed At: ${attempt.completedAt || 'N/A'}
`
        )
        .join('\n')
    : 'No quiz attempts found'
}
  `;

  // Return a simple text file as PDF for now
  // In production, you'd use a proper PDF library
  return Buffer.from(content, 'utf-8');
}

// Helper function to generate DOCX
async function generateDOCX(data: ExportData): Promise<Buffer> {
  // For now, return a simple text-based DOCX
  // In a real implementation, you'd use a library like docx
  const content = `
Teacher Data Export
Export Date: ${data.exportDate}

TEACHER INFORMATION
Name: ${data.teacher.name || 'N/A'}
Email: ${data.teacher.email}
Role: ${data.teacher.role}
Organization ID: ${data.teacher.organizationId}
Created At: ${data.teacher.createdAt}

SUMMARY
Total Quizzes: ${data.summary.totalQuizzes}
Total Questions: ${data.summary.totalQuestions}
Total Attempts: ${data.summary.totalAttempts}
Total Students: ${data.summary.totalStudents}
Average Score: ${data.summary.averageScore.toFixed(2)}

QUIZZES
${data.quizzes
  .map(
    (quiz) => `
Title: ${quiz.title}
Description: ${quiz.description}
Subject ID: ${quiz.subjectId}
Time Limit: ${quiz.timeLimit || 'N/A'}
Total Points: ${quiz.totalPoints}
Status: ${quiz.status}
Questions: ${quiz.questions}
Attempts: ${quiz.attempts}
Created At: ${quiz.createdAt}
`
  )
  .join('\n')}

QUIZ ATTEMPTS
${
  Array.isArray(data.quizAttempts)
    ? data.quizAttempts
        .map(
          (attempt) => `
Student: ${attempt.student.name || 'N/A'} (${attempt.student.email})
Quiz: ${attempt.quiz.title}
Score: ${attempt.score}/${attempt.totalPoints}
Time Spent: ${attempt.timeSpent} minutes
Completed At: ${attempt.completedAt || 'N/A'}
`
        )
        .join('\n')
    : 'No quiz attempts found'
}
  `;

  // Return a simple text file as DOCX for now
  // In production, you'd use a proper DOCX library
  return Buffer.from(content, 'utf-8');
}
