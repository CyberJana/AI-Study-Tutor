"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { LoaderCircle, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Mode = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXAM";
type SourceRef = { documentId: string; documentName: string; chunkId: string };
type Message = { id: string; role: "USER" | "ASSISTANT"; content: string; sourceRefs: SourceRef[] };

const modes: { value: Mode; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "EXAM", label: "Exam mode" },
];

export function TutorChat({ initialSessionId, initialMessages }: { initialSessionId?: string; initialMessages: Message[] }) {
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [messages, setMessages] = useState(initialMessages);
  const [mode, setMode] = useState<Mode>("INTERMEDIATE");
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function sendQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 2 || isSending) return;

    setQuestion("");
    setError(null);
    setIsSending(true);
    const optimisticMessage: Message = { id: `pending-${Date.now()}`, role: "USER", content: trimmedQuestion, sourceRefs: [] };
    setMessages((current) => [...current, optimisticMessage]);
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, question: trimmedQuestion, mode }),
      });
      const data: { error?: string; sessionId?: string; message?: { id: string; content: string; sourceRefs: SourceRef[] } } = await response.json();
      if (!response.ok || !data.message || !data.sessionId) {
        setMessages((current) => current.filter((message) => message.id !== optimisticMessage.id));
        setQuestion(trimmedQuestion);
        setError(data.error ?? "The tutor could not answer right now.");
        return;
      }
      setSessionId(data.sessionId);
      setMessages((current) => [...current, { id: data.message!.id, role: "ASSISTANT", content: data.message!.content, sourceRefs: data.message!.sourceRefs }]);
    } catch {
      setMessages((current) => current.filter((message) => message.id !== optimisticMessage.id));
      setQuestion(trimmedQuestion);
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Source-grounded learning</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">AI Tutor</h1>
        <p className="mt-2 text-slate-600">Answers use only your uploaded study materials and show the documents that support them.</p>
      </section>
      <Card className="min-h-96 p-5 sm:p-6">
        {messages.length ? (
          <div className="grid gap-5">
            {messages.map((message) => (
              <article key={message.id} className={message.role === "USER" ? "ml-auto max-w-[85%] rounded-2xl bg-blue-600 px-4 py-3 text-white" : "max-w-[90%] rounded-2xl bg-slate-100 px-4 py-3"}>
                <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                {message.role === "ASSISTANT" && message.sourceRefs.length > 0 && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.sourceRefs.map((source) => <Link className="rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-700 hover:underline" href={`/materials/${source.documentId}`} key={source.chunkId}>{source.documentName}</Link>)}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-80 place-items-center text-center">
            <div>
              <Sparkles className="mx-auto text-blue-600" size={32} />
              <h2 className="mt-4 font-semibold">Ask about your study material</h2>
              <p className="mt-2 max-w-md text-sm text-slate-600">Try “Explain this topic simply,” “Summarize this chapter,” or “What are the important exam points?”</p>
            </div>
          </div>
        )}
      </Card>
      <Card className="p-4">
        <form className="grid gap-3" onSubmit={sendQuestion}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="text-sm font-medium" htmlFor="mode">Explanation mode</label>
            <select id="mode" value={mode} onChange={(event) => setMode(event.target.value as Mode)} className="h-9 rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-600">
              {modes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={4000} required minLength={2} rows={4} placeholder="Ask a question about your uploaded material..." className="w-full resize-y rounded-lg border bg-white p-3 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600" />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <div className="flex justify-end"><Button type="submit" disabled={isSending}>{isSending ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={16} />}<span className="ml-2">{isSending ? "Thinking..." : "Send question"}</span></Button></div>
        </form>
      </Card>
    </div>
  );
}
