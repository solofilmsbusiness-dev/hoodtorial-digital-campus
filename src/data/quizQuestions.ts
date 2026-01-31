// Quiz Question Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizData {
  quizId: string;
  questions: QuizQuestion[];
}

// Import all quiz question modules
import { hu101Questions, hu102Questions, hu201Questions, hu301Questions } from './quizzes/cinematography';
import { hu103Questions, hu104Questions, hu202Questions, hu302Questions } from './quizzes/post-production';
import { hu105Questions, hu203Questions, hu204Questions, hu303Questions } from './quizzes/directing';
import { hu106Questions, hu205Questions, hu206Questions, hu304Questions } from './quizzes/production';

// Combined quiz questions database
export const quizQuestions: Record<string, QuizQuestion[]> = {
  // Cinematography Department
  ...hu101Questions,
  ...hu102Questions,
  ...hu201Questions,
  ...hu301Questions,
  
  // Post-Production Department
  ...hu103Questions,
  ...hu104Questions,
  ...hu202Questions,
  ...hu302Questions,
  
  // Directing Department
  ...hu105Questions,
  ...hu203Questions,
  ...hu204Questions,
  ...hu303Questions,
  
  // Production Department
  ...hu106Questions,
  ...hu205Questions,
  ...hu206Questions,
  ...hu304Questions,
};

// Helper function to get questions for a specific quiz
export function getQuizQuestions(quizId: string): QuizQuestion[] {
  return quizQuestions[quizId] || [];
}

// Helper function to calculate score
export function calculateScore(answers: Record<string, number>, questions: QuizQuestion[]): number {
  let correct = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) {
      correct++;
    }
  });
  return Math.round((correct / questions.length) * 100);
}
