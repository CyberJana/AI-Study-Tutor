import { AppShell } from "@/components/dashboard/app-shell";
import { Card } from "@/components/ui/card";

type ComingSoonPageProps = {
  title: string;
  description: string;
  nextStep: string;
};

export async function ComingSoonPage({ title, description, nextStep }: ComingSoonPageProps) {
  return (
    <AppShell>
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Coming in the next phase</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 text-slate-600">{description}</p>
        <Card className="mt-8 p-6">
          <h2 className="font-semibold">What to expect</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{nextStep}</p>
        </Card>
      </div>
    </AppShell>
  );
}
