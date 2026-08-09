import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;

  const deleted = await prisma.document.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
