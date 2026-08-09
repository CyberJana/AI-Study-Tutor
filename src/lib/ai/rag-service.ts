import { prisma } from "@/lib/prisma";
import { createEmbeddings, vectorLiteral } from "@/lib/ai/embedding-service";

export type RetrievedChunk = {
  id: string;
  documentId: string;
  documentName: string;
  content: string;
  similarity: number;
};

export async function retrieveRelevantChunks(userId: string, query: string, limit = 6): Promise<RetrievedChunk[]> {
  const [embedding] = await createEmbeddings([query]);
  if (!embedding) return [];
  const vector = vectorLiteral(embedding);
  const safeLimit = Math.max(1, Math.min(limit, 20));

  return prisma.$queryRaw<RetrievedChunk[]>`
    SELECT
      chunk."id",
      chunk."documentId",
      document."name" AS "documentName",
      chunk."content",
      1 - (chunk."embedding" <=> ${vector}::vector) AS "similarity"
    FROM "DocumentChunk" AS chunk
    INNER JOIN "Document" AS document ON document."id" = chunk."documentId"
    WHERE document."userId" = ${userId} AND document."status" = 'READY'
    ORDER BY chunk."embedding" <=> ${vector}::vector
    LIMIT ${safeLimit}
  `;
}
