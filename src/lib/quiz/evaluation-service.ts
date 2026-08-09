import type { QuizQuestion } from "@prisma/client";

export function evaluateAnswer(question: QuizQuestion, answer: string) {
  const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
  const correct = normalize(question.correctAnswer);
  const submitted = normalize(answer);
  const isCorrect = submitted === correct;
  return {
    isCorrect,
    feedback: isCorrect ? "Correct." : `Not quite. ${question.explanation}`,
  };
}
