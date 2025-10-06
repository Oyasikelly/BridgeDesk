export interface Database {
  users: User;
  quizzes: Quiz;
  questions: Question;
  quiz_attempts: QuizAttempt;
  quiz_answers: QuizAnswer;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  created_at: Date;
  updated_at: Date;
  organizationId?: string;
  institution?: string;
  department?: string;
  studentId?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  subject: string;
  time_limit?: number;
  total_points: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Question {
  id: string;
  quiz_id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correct_answer: string | string[];
  points: number;
  order: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_points: number;
  time_spent: number;
  completed_at: Date;
  created_at: Date;
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  answer: string | string[];
  is_correct: boolean;
  points_earned: number;
}
