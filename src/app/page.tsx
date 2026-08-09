import Link from "next/link";
import { ArrowRight, BrainCircuit, FileText, Sparkles } from "lucide-react";

const features = [
  { icon: FileText, title: "Study your material", text: "Upload your notes and keep every learning resource in one focused workspace." },
  { icon: BrainCircuit, title: "Learn with context", text: "Ask questions and get explanations grounded in the materials you provide." },
  { icon: Sparkles, title: "Build momentum", text: "Turn your study time into quizzes, flashcards, and an adaptive plan." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-lg font-bold">AI Study Tutor</Link>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/login" className="text-slate-300 hover:text-white">Log in</Link>
          <Link href="/register" className="rounded-lg bg-white px-4 py-2 text-slate-950 hover:bg-slate-100">Get started</Link>
        </div>
      </nav>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-20 text-center lg:pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Personalized learning</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Turn study materials into real understanding.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">AI Study Tutor helps you learn from your own materials with grounded answers, targeted practice, and progress you can see.</p>
          <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-3 font-semibold hover:bg-blue-400">Create your account <ArrowRight size={18} /></Link>
        </div>
        <div className="grid gap-5 text-left md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <Icon className="mb-5 text-blue-300" size={28} />
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
