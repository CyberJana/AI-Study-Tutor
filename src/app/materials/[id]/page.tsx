import { notFound } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const document = await prisma.document.findFirst({
    where: { id, userId: user.id },
    select: { name: true, status: true, byteSize: true, extractedText: true, createdAt: true, _count: { select: { chunks: true } } },
  });
  if (!document) notFound();

  return (
    <AppShell>
      <p className="text-sm font-medium text-blue-700">Study material</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{document.name}</h1>
      <p className="mt-2 text-sm text-slate-600">{document._count.chunks} chunks · {document.status === "READY" ? "Ready for AI study features" : "Processing status: " + document.status.toLowerCase()}</p>
      <Card className="mt-8 p-6">
        <h2 className="font-semibold">Extracted text</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{document.extractedText}</p>
      </Card>
    </AppShell>
  );
}
