import { ChatRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { generateGroundedTutorAnswer } from "@/lib/ai/tutor-service";
import { retrieveRelevantChunks } from "@/lib/ai/rag-service";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tutorMessageSchema } from "@/lib/validation/tutor";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  const parsed = tutorMessageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid question." }, { status: 400 });

  const { question, mode, sessionId } = parsed.data;
  let session;
  if (sessionId) {
    session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId: user.id } });
    if (!session) return NextResponse.json({ error: "Chat session not found." }, { status: 404 });
  } else {
    session = await prisma.chatSession.create({
      data: { userId: user.id, title: question.slice(0, 80) },
    });
  }

  try {
    const sources = await retrieveRelevantChunks(user.id, question);
    const answer = await generateGroundedTutorAnswer(question, mode, sources);
    const sourceRefs = sources.map((source) => ({ documentId: source.documentId, documentName: source.documentName, chunkId: source.id }));

    const [, assistantMessage] = await prisma.$transaction([
      prisma.chatMessage.create({ data: { sessionId: session.id, role: ChatRole.USER, content: question, mode } }),
      prisma.chatMessage.create({ data: { sessionId: session.id, role: ChatRole.ASSISTANT, content: answer, mode, sourceRefs } }),
      prisma.chatSession.update({ where: { id: session.id }, data: { updatedAt: new Date() } }),
    ]);

    return NextResponse.json({
      sessionId: session.id,
      message: { id: assistantMessage.id, content: assistantMessage.content, sourceRefs },
    });
  } catch (error) {
    console.error("Tutor request failed", error);
    return NextResponse.json({ error: "The tutor is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
