import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { retrieveRelevantChunks } from "@/lib/ai/rag-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length > 1_000) return NextResponse.json({ error: "Enter a search query of up to 1,000 characters." }, { status: 400 });

  try {
    return NextResponse.json({ results: await retrieveRelevantChunks(user.id, query) });
  } catch (error) {
    console.error("Material search failed", error);
    return NextResponse.json({ error: "Search is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
