import { z } from "zod";

export const quizGenerationSchema = z.object({
  title: z.string().trim().min(2).max(120),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  types: z.array(z.enum(["MCQ", "TRUE_FALSE", "SHORT_ANSWER"])).min(1),
  questionCount: z.number().int().min(1).max(20),
});

export const quizSubmissionSchema = z.object({
  answers: z.array(z.object({ questionId: z.string().cuid(), answer: z.string().trim().max(4_000) })).min(1),
});
