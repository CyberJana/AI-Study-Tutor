import { AppShell } from "@/components/dashboard/app-shell";
import { MaterialsWorkspace } from "@/components/materials-workspace";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MaterialsPage() {
  const user = await requireUser();
  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, mimeType: true, byteSize: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return <AppShell><MaterialsWorkspace initialDocuments={documents} /></AppShell>;
}
