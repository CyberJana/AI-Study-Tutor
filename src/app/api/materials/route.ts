import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { processDocumentUpload } from "@/lib/documents/service";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, mimeType: true, byteSize: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a document to upload." }, { status: 400 });

    const document = await processDocumentUpload(user.id, file);
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Document upload failed", error);
    const message = error instanceof Error && (
      error.message.startsWith("Choose") ||
      error.message.startsWith("Files must") ||
      error.message.startsWith("Only PDF") ||
      error.message.startsWith("No ")
    )
      ? error.message
      : "We could not process this document. Please try again.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
