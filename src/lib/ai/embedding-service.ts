import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("AI study features are not configured.");
  return new OpenAI({ apiKey });
}

export async function createEmbeddings(inputs: string[]) {
  if (!inputs.length) return [];
  const response = await getClient().embeddings.create({
    model: EMBEDDING_MODEL,
    input: inputs,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  const embeddings = response.data.sort((first, second) => first.index - second.index).map((item) => item.embedding);
  if (embeddings.some((embedding) => embedding.length !== EMBEDDING_DIMENSIONS)) {
    throw new Error("The embedding provider returned an unexpected vector size.");
  }
  return embeddings;
}

export function vectorLiteral(embedding: number[]) {
  if (embedding.length !== EMBEDDING_DIMENSIONS || embedding.some((value) => !Number.isFinite(value))) {
    throw new Error("Invalid embedding vector.");
  }
  return `[${embedding.join(",")}]`;
}
