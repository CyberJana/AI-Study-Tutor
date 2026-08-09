import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { retrieveRelevantChunks } from "@/lib/ai/rag-service";
import { prisma } from "@/lib/prisma";
import { quizGenerationSchema } from "@/lib/validation/quiz";
import { z } from "zod";

const generatedQuizSchema = z.object({
  questions: z.array(z.object({
    type: z.enum(["MCQ", "TRUE_FALSE", "SHORT_ANSWER"]),
    prompt: z.string().min(1),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().min(1),
    explanation: z.string().min(1),
  })),
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = quizGenerationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid quiz settings." }, { status: 400 });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI study features are not configured." }, { status: 503 });

  try {
    const settings = parsed.data;
    const sources = await retrieveRelevantChunks(user.id, settings.title, 10);
    if (!sources.length) return NextResponse.json({ error: "No relevant uploaded material was found." }, { status: 422 });
    const context = sources.map((source) => source.content).join("\n\n");
    const response = await new OpenAI({ apiKey }).chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: `Generate exactly ${settings.questionCount} ${settings.difficulty} study questions only from the supplied material. Allowed types: ${settings.types.join(", ")}. MCQ needs exactly four options; TRUE_FALSE needs options ["True","False"]. Return JSON: {"questions":[{"type":"MCQ","prompt":"...","options":["..."],"correctAnswer":"...","explanation":"..."}]}.` }, { role: "user", content: context }],
    });
    const generated = generatedQuizSchema.parse(JSON.parse(response.choices[0]?.message.content ?? "{}"));
    if (generated.questions.length !== settings.questionCount || generated.questions.some((question) => !settings.types.includes(question.type))) throw new Error("Invalid generated quiz.");
    const quiz = await prisma.quiz.create({
      data: {
        userId: user.id, title: settings.title, difficulty: settings.difficulty,
        questions: { create: generated.questions.map((question, position) => ({ ...question, position, options: question.options ?? undefined })) },
      },
      include: { questions: { select: { id: true, prompt: true, type: true, options: true, position: true }, orderBy: { position: "asc" } } },
    });
    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error("Quiz generation failed", error);
    return NextResponse.json({ error: "Quiz generation failed. Please try again." }, { status: 503 });
  }
}
