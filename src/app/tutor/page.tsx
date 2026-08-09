import { AppShell } from "@/components/dashboard/app-shell";
import { TutorChat } from "@/components/tutor-chat";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TutorPage() {
  const user = await requireUser();
  const session = await prisma.chatSession.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 30 } },
  });
  const messages = (session?.messages ?? []).map((message) => ({
    id: message.id,
    role: message.role === "USER" ? "USER" : "ASSISTANT",
    content: message.content,
    sourceRefs: Array.isArray(message.sourceRefs) ? message.sourceRefs.filter(isSourceRef) : [],
  }));
  return <AppShell><TutorChat initialSessionId={session?.id} initialMessages={messages} /></AppShell>;
}

function isSourceRef(value: unknown): value is { documentId: string; documentName: string; chunkId: string } {
  return typeof value === "object" && value !== null &&
    typeof (value as { documentId?: unknown }).documentId === "string" &&
    typeof (value as { documentName?: unknown }).documentName === "string" &&
    typeof (value as { chunkId?: unknown }).chunkId === "string";
}
