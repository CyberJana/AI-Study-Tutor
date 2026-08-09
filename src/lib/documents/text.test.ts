import { describe, expect, it } from "vitest";
import { chunkText, cleanExtractedText } from "@/lib/documents/text";

describe("cleanExtractedText", () => {
  it("normalizes whitespace while retaining paragraph boundaries", () => {
    expect(cleanExtractedText("  First   line \r\n\r\n\r\nSecond\t line  ")).toBe("First line\n\nSecond line");
  });
});

describe("chunkText", () => {
  it("preserves all text across overlapping chunks", () => {
    const text = Array.from({ length: 500 }, (_, index) => `word${index}`).join(" ");
    const chunks = chunkText(text);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.content).toContain("word0");
    expect(chunks.at(-1)?.content).toContain("word499");
    expect(chunks.every((chunk) => chunk.tokenCount > 0)).toBe(true);
  });
});
