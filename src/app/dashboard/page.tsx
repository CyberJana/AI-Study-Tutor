import { ArrowUpRight, BookOpen, Clock3, Flame, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

const metrics = [
  { label: "Total study time", value: "0h", detail: "Start your first session", icon: Clock3 },
  { label: "Topics completed", value: "0", detail: "Upload materials to begin", icon: BookOpen },
  { label: "Quiz accuracy", value: "--", detail: "No attempts yet", icon: Target },
  { label: "Learning streak", value: "0 days", detail: "Study today to begin", icon: Flame },
];

export default function DashboardPage() {
  return (
    <div className="grid gap-7">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">Welcome to your study dashboard</h1>
        <p className="mt-1 text-slate-600">Your personalized learning insights will appear as you study.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <Card className="p-5" key={label}>
            <div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-600">{label}</p><Icon className="text-blue-600" size={19} /></div>
            <p className="mt-5 text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{detail}</p>
          </Card>
        ))}
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Get started</h2><ArrowUpRight size={18} className="text-slate-400" /></div>
          <p className="mt-2 text-sm text-slate-600">Upload your first study material to unlock grounded tutoring, quizzes, and flashcards.</p>
          <a href="/materials" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Upload materials</a>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold">Recent activity</h2>
          <div className="mt-5 rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">Your study activity will show up here.</div>
        </Card>
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6"><h2 className="font-semibold">Weak topics</h2><p className="mt-2 text-sm text-slate-600">Complete a quiz to identify concepts that need more attention.</p></Card>
        <Card className="p-6"><h2 className="font-semibold">Recommended next step</h2><p className="mt-2 text-sm text-slate-600">Add a study material to begin building your personalized plan.</p></Card>
      </section>
    </div>
  );
}
