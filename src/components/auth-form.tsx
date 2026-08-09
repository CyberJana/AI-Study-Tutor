"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthFormProps = { mode: "login" | "register" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {isRegister && (
        <label className="grid gap-2 text-sm font-medium">
          Name <Input name="name" autoComplete="name" placeholder="Your name" minLength={2} maxLength={80} />
        </label>
      )}
      <label className="grid gap-2 text-sm font-medium">
        Email <Input name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Password <Input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} placeholder={isRegister ? "At least 12 characters" : "Your password"} required minLength={isRegister ? 12 : 1} maxLength={128} />
      </label>
      {isRegister && (
        <label className="grid gap-2 text-sm font-medium">
          Confirm password <Input name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} />
        </label>
      )}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
      <Button className="w-full" type="submit" size="lg" disabled={isLoading}>
        {isLoading ? "Please wait..." : isRegister ? "Create account" : "Log in"}
      </Button>
      <p className="text-center text-sm text-slate-600">
        {isRegister ? "Already have an account?" : "New to AI Study Tutor?"}{" "}
        <Link className="font-semibold text-blue-700 hover:underline" href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
