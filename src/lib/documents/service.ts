import { randomUUID } from "node:crypto";
import { DocumentStatus } from "@prisma/client";
import { createEmbeddings, vectorLiteral } from "@/lib/ai/embedding-service";
import { extractText } from "@/lib/documents/extract";
import { isSupportedDocumentType, MAX_DOCUMENT_SIZE_BYTES, type SupportedMimeType } from "@/lib/documents/constants";
import { chunkText } from "@/lib/documents/text";
import { prisma } from "@/lib/prisma";

export async function processDocumentUpload(userId: string, file: File) {
  validateDocument(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type as SupportedMimeType;
  const extractedText = await extractText(buffer, mimeType);
  const chunks = chunkText(extractedText);
  if (!chunks.length) throw new Error("No usable study content was found in this document.");

  const document = await prisma.document.create({
    data: {
      userId,
      name: file.name,
      mimeType,
      byteSize: file.size,
      fileData: buffer,
      extractedText,
      status: DocumentStatus.PROCESSING,
    },
  });

  try {
    const embeddings = await createEmbeddings(chunks.map((chunk) => chunk.content));
    await prisma.$transaction(
      chunks.map((chunk, index) =>
        prisma.$executeRaw`
          INSERT INTO "DocumentChunk" ("id", "documentId", "content", "chunkIndex", "tokenCount", "embedding", "createdAt", "updatedAt")
          VALUES (${randomUUID()}, ${document.id}, ${chunk.content}, ${index}, ${chunk.tokenCount}, ${vectorLiteral(embeddings[index] ?? [])}::vector, NOW(), NOW())
        `,
      ),
    );
    return prisma.document.update({
      where: { id: document.id },
      data: { status: DocumentStatus.READY },
      select: { id: true, name: true, byteSize: true, status: true, createdAt: true },
    });
  } catch (error) {
    await prisma.document.update({
      where: { id: document.id },
      data: { status: DocumentStatus.FAILED },
    });
    throw error;
  }
}

function validateDocument(file: File): asserts file is File & { type: SupportedMimeType } {
  if (!file.name || !file.size) throw new Error("Choose a non-empty document to upload.");
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) throw new Error(`Files must be ${MAX_DOCUMENT_SIZE_BYTES / 1024 / 1024} MB or smaller.`);
  if (!isSupportedDocumentType(file.type, file.name)) {
    throw new Error("Only PDF, DOCX, PPTX, and TXT files are supported.");
  }
}
