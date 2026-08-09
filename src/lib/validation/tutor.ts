import { z } from "zod";

export const explanationModes = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXAM"] as const;

export const tutorMessageSchema = z.object({
  sessionId: z.string().cuid().optional(),
  question: z.string().trim().min(2, "Enter a question with at least 2 characters.").max(4_000),
  mode: z.enum(explanationModes),
});
