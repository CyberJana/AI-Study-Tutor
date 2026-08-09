export type TextChunk = {
  content: string;
  tokenCount: number;
};

const CHUNK_SIZE = 1_200;
const CHUNK_OVERLAP = 180;

export function cleanExtractedText(input: string) {
  return input
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function chunkText(text: string): TextChunk[] {
  const cleaned = cleanExtractedText(text);
  if (!cleaned) return [];

  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = Math.min(start + CHUNK_SIZE, cleaned.length);
    if (end < cleaned.length) {
      const boundary = Math.max(cleaned.lastIndexOf("\n", end), cleaned.lastIndexOf(". ", end), cleaned.lastIndexOf(" ", end));
      if (boundary > start + CHUNK_SIZE / 2) end = boundary + 1;
    }

    const content = cleaned.slice(start, end).trim();
    if (content) chunks.push({ content, tokenCount: estimateTokenCount(content) });
    if (end >= cleaned.length) break;
    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }

  return chunks;
}

function estimateTokenCount(text: string) {
  return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3);
}
