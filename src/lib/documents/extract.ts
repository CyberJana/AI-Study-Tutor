import JSZip from "jszip";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import { cleanExtractedText } from "@/lib/documents/text";
import type { SupportedMimeType } from "@/lib/documents/constants";

export async function extractText(buffer: Buffer, mimeType: SupportedMimeType) {
  let text: string;
  switch (mimeType) {
    case "text/plain":
      text = buffer.toString("utf8");
      break;
    case "application/pdf":
      text = (await pdf(buffer)).text;
      break;
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      text = (await mammoth.extractRawText({ buffer })).value;
      break;
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      text = await extractPptxText(buffer);
      break;
  }

  const cleaned = cleanExtractedText(text);
  if (!cleaned) throw new Error("No readable text was found in this document.");
  return cleaned;
}

async function extractPptxText(buffer: Buffer) {
  const archive = await JSZip.loadAsync(buffer);
  const slides = Object.keys(archive.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort((first, second) => getSlideNumber(first) - getSlideNumber(second));

  const text = await Promise.all(
    slides.map(async (path) => {
      const xml = await archive.file(path)?.async("text");
      return xml ? [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((match) => decodeXml(match[1])).join(" ") : "";
    }),
  );
  return text.join("\n\n");
}

function getSlideNumber(path: string) {
  return Number(path.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
}

function decodeXml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
}
