import type { QuizQuestion } from "@/data/quizQuestions";

/**
 * Shuffled question with mapped options for grading
 */
export interface ShuffledQuestion {
  id: string;
  question: string;
  originalOptions: string[];
  shuffledOptions: string[];
  optionMapping: number[]; // shuffledIndex -> originalIndex
  originalCorrectAnswer: number;
  shuffledCorrectAnswer: number;
  explanation?: string;
}

/**
 * Fisher-Yates shuffle algorithm
 * Returns a new shuffled array without modifying the original
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffle question options and track the mapping for grading
 * Returns a ShuffledQuestion with optionMapping to convert shuffled index to original
 */
export function shuffleQuestionOptions(question: QuizQuestion): ShuffledQuestion {
  const originalOptions = question.options;
  
  // Create array of indices and shuffle them
  const indices = originalOptions.map((_, i) => i);
  const shuffledIndices = shuffleArray(indices);
  
  // Create shuffled options array
  const shuffledOptions = shuffledIndices.map(i => originalOptions[i]);
  
  // optionMapping[shuffledIndex] = originalIndex
  const optionMapping = shuffledIndices;
  
  // Find new correct answer index (where the original correct answer ended up)
  const shuffledCorrectAnswer = shuffledIndices.findIndex(
    originalIndex => originalIndex === question.correctAnswer
  );

  return {
    id: question.id,
    question: question.question,
    originalOptions,
    shuffledOptions,
    optionMapping,
    originalCorrectAnswer: question.correctAnswer,
    shuffledCorrectAnswer,
    explanation: question.explanation,
  };
}

/**
 * Shuffle an array of questions and their options
 * Returns fully randomized questions for anti-cheat
 */
export function getRandomizedQuiz(questions: QuizQuestion[]): ShuffledQuestion[] {
  // First shuffle the question order
  const shuffledQuestions = shuffleArray(questions);
  
  // Then shuffle options for each question
  return shuffledQuestions.map(q => shuffleQuestionOptions(q));
}

/**
 * Map a user's answer on a shuffled question back to original option index
 * Used when saving to database for consistent grading
 */
export function mapShuffledAnswerToOriginal(
  shuffledQuestion: ShuffledQuestion,
  shuffledAnswerIndex: number
): number {
  return shuffledQuestion.optionMapping[shuffledAnswerIndex];
}

/**
 * Calculate score from shuffled answers
 * Handles mapping from shuffled to original indices
 */
export function calculateShuffledScore(
  answers: Record<string, number>,
  shuffledQuestions: ShuffledQuestion[]
): number {
  let correct = 0;
  shuffledQuestions.forEach((q) => {
    const userAnswer = answers[q.id];
    if (userAnswer !== undefined && userAnswer === q.shuffledCorrectAnswer) {
      correct++;
    }
  });
  return Math.round((correct / shuffledQuestions.length) * 100);
}

/**
 * Get grading data for saving to database
 * Maps answers back to original indices for consistent admin review
 */
export function getGradingData(
  answers: Record<string, number>,
  shuffledQuestions: ShuffledQuestion[]
): Array<{
  questionId: string;
  selectedAnswer: number; // Original index
  isCorrect: boolean;
}> {
  return shuffledQuestions.map((q) => {
    const shuffledAnswer = answers[q.id];
    const originalAnswer = shuffledAnswer !== undefined 
      ? mapShuffledAnswerToOriginal(q, shuffledAnswer)
      : -1;
    
    return {
      questionId: q.id,
      selectedAnswer: originalAnswer,
      isCorrect: originalAnswer === q.originalCorrectAnswer,
    };
  });
}

/**
 * Calculate default time limit based on question count
 * Default: 1 minute per question for quizzes, 45 seconds for assessments
 */
export function getDefaultTimeLimit(questionCount: number, isAssessment: boolean = false): number {
  if (isAssessment) {
    // 45 seconds per question for assessments
    return Math.ceil((questionCount * 45) / 60);
  }
  // 1 minute per question for regular quizzes
  return questionCount;
}

/**
 * Format remaining time as MM:SS
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get per-question time in seconds
 * Default: 60 seconds per question
 */
export function getPerQuestionTime(perQuestionSeconds?: number): number {
  return perQuestionSeconds ?? 60;
}
