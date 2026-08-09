import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border bg-white p-7 shadow-sm sm:p-8">
        <Link href="/" className="text-sm font-bold text-blue-700">AI Study Tutor</Link>
        <h1 className="mt-6 text-2xl font-bold">Start learning smarter</h1>
        <p className="mt-2 text-sm text-slate-600">Create your personal study workspace.</p>
        <div className="mt-7"><AuthForm mode="register" /></div>
      </section>
    </main>
  );
}
