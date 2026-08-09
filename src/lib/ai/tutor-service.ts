import OpenAI from "openai";
import { z } from "zod";
import type { RetrievedChunk } from "@/lib/ai/rag-service";
import type { ExplanationMode } from "@prisma/client";

const tutorResponseSchema = z.object({
  answer: z.string().trim().min(1).max(12_000),
});

const modeInstructions: Record<ExplanationMode, string> = {
  BEGINNER: "Use simple language, short paragraphs, and a helpful analogy when the sources support one.",
  INTERMEDIATE: "Explain clearly with standard subject terminology and one concrete example when supported.",
  ADVANCED: "Use precise technical terminology, explain relevant mechanisms, and note important distinctions.",
  EXAM: "Focus on definitions, key points, likely exam concepts, and concise revision notes.",
};

export async function generateGroundedTutorAnswer(question: string, mode: ExplanationMode, sources: RetrievedChunk[]) {
  if (!sources.length) {
    return "I could not find information supporting that answer in your uploaded study materials. Try uploading relevant material or asking about a topic that appears in your library.";
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("AI study features are not configured.");

  const context = sources
    .map((source, index) => `[Source ${index + 1}: ${source.documentName}]\n${source.content}`)
    .join("\n\n");
  const response = await new OpenAI({ apiKey }).chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You are an AI study tutor. Answer only from the supplied source excerpts.",
          "If the excerpts do not support an answer, say exactly that the information was not found in the provided study material.",
          "Never claim a source supports information it does not contain. Do not use outside knowledge.",
          modeInstructions[mode],
          'Return valid JSON only: {"answer":"..."}',
        ].join(" "),
      },
      { role: "user", content: `Question: ${question}\n\nStudy material:\n${context}` },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (!content) throw new Error("The AI provider returned an empty response.");

  const parsedJson: unknown = JSON.parse(content);
  const parsed = tutorResponseSchema.safeParse(parsedJson);
  if (!parsed.success) throw new Error("The AI provider returned an invalid response.");
  return parsed.data.answer;
}
