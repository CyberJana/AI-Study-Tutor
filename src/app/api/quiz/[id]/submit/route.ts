import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { evaluateAnswer } from "@/lib/quiz/evaluation-service";
import { prisma } from "@/lib/prisma";
import { quizSubmissionSchema } from "@/lib/validation/quiz";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  const parsed = quizSubmissionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid quiz submission." }, { status: 400 });
  const { id } = await params;
  const quiz = await prisma.quiz.findFirst({ where: { id, userId: user.id }, include: { questions: true } });
  if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 });

  const byId = new Map(quiz.questions.map((question) => [question.id, question]));
  const graded = parsed.data.answers.flatMap(({ questionId, answer }) => {
    const question = byId.get(questionId);
    return question ? [{ question, answer, ...evaluateAnswer(question, answer) }] : [];
  });
  if (graded.length !== quiz.questions.length) return NextResponse.json({ error: "Answer every quiz question." }, { status: 400 });

  const score = (graded.filter((answer) => answer.isCorrect).length / quiz.questions.length) * 100;
  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: user.id,
      score,
      answers: { create: graded.map((answer) => ({ questionId: answer.question.id, answer: answer.answer, isCorrect: answer.isCorrect, feedback: answer.feedback })) },
    },
    include: { answers: true },
  });
  return NextResponse.json({ attempt });
}
