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
/**
 * Calculate raw correct count (not percentage)
 * Used for storing in database where score = correct count
 */
export function calculateCorrectCount(
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
  return correct;
}

/**
 * Calculate score as percentage from shuffled answers
 * Handles mapping from shuffled to original indices
 */
export function calculateShuffledScore(
  answers: Record<string, number>,
  shuffledQuestions: ShuffledQuestion[]
): number {
  const correct = calculateCorrectCount(answers, shuffledQuestions);
  return shuffledQuestions.length > 0 
    ? Math.round((correct / shuffledQuestions.length) * 100) 
    : 0;
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

/**
 * Urban-style motivational messages for quiz results
 */
export interface MotivationalMessage {
  headline: string;
  subtext: string;
}

export const failureMessages: MotivationalMessage[] = [
  { headline: "NAH, YOU GOT THIS!", subtext: "Every master was once a disaster. Get back in there." },
  { headline: "NOT TODAY... BUT SOON!", subtext: "Legends ain't built in a day. Review that material and run it back." },
  { headline: "LEVELS TO THIS!", subtext: "You ain't where you wanna be yet, but you closer than yesterday." },
  { headline: "STAY IN THE FIGHT!", subtext: "Real ones don't quit. Hit the books and come back stronger." },
  { headline: "GRIND DON'T STOP!", subtext: "Take this L, learn from it, and flip it into a W." },
  { headline: "IT'S A MARATHON!", subtext: "Ain't about how hard you fall, it's about how fast you get up." },
];

export const successMessages: MotivationalMessage[] = [
  { headline: "YOU DID THAT!", subtext: "Knowledge unlocked. On to the next level." },
  { headline: "CERTIFIED!", subtext: "You put in the work, now you got the results." },
  { headline: "THAT'S A W!", subtext: "All that studying paid off. Keep this energy." },
];

export const cooldownMessages: MotivationalMessage[] = [
  { headline: "USE THIS TIME WISELY", subtext: "Go back through the lessons. Knowledge is power." },
  { headline: "THE GRIND CONTINUES", subtext: "Review the material. Come back ready to dominate." },
];

/**
 * Get a random motivational message based on result type
 */
export function getRandomMotivationalMessage(type: "success" | "failure" | "cooldown"): MotivationalMessage {
  const messages = type === "success" 
    ? successMessages 
    : type === "failure" 
      ? failureMessages 
      : cooldownMessages;
  
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Format cooldown time remaining as MM:SS
 */
export function formatCooldown(ms: number): string {
  if (ms <= 0) return "0:00";
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
