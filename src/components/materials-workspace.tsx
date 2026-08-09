"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { FileSearch, FileText, LoaderCircle, Search, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Document = {
  id: string;
  name: string;
  mimeType: string;
  byteSize: number;
  status: "PROCESSING" | "READY" | "FAILED";
  createdAt: Date;
};

type SearchResult = {
  id: string;
  documentId: string;
  documentName: string;
  content: string;
  similarity: number;
};

export function MaterialsWorkspace({ initialDocuments }: { initialDocuments: Document[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const uploadInput = useRef<HTMLInputElement>(null);

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = uploadInput.current?.files?.[0];
    if (!file) {
      setError("Choose a document to upload.");
      return;
    }

    setError(null);
    setIsUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    try {
      const response = await fetch("/api/materials", { method: "POST", body: formData });
      const data: { error?: string; document?: Document } = await response.json();
      if (!response.ok || !data.document) {
        setError(data.error ?? "We could not upload this document.");
        return;
      }
      setDocuments((current) => [data.document!, ...current]);
      event.currentTarget.reset();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteDocument(id: string) {
    setError(null);
    const response = await fetch(`/api/materials/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("We could not delete this document. Please try again.");
      return;
    }
    setDocuments((current) => current.filter((document) => document.id !== id));
    setResults((current) => current.filter((result) => result.documentId !== id));
  }

  async function searchMaterials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("query");
    if (typeof query !== "string" || !query.trim()) return;

    setError(null);
    setIsSearching(true);
    try {
      const response = await fetch(`/api/materials/search?q=${encodeURIComponent(query.trim())}`);
      const data: { error?: string; results?: SearchResult[] } = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Search is unavailable.");
        return;
      }
      setResults(data.results ?? []);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="grid gap-7">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">Study materials</h1>
        <p className="mt-1 text-slate-600">Upload your notes to build a private, source-grounded study library.</p>
      </section>
      <Card className="p-5 sm:p-6">
        <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={uploadDocument}>
          <label className="grid flex-1 gap-2 text-sm font-medium">
            Add a study document
            <Input ref={uploadInput} name="file" type="file" accept=".pdf,.docx,.pptx,.txt" disabled={isUploading} />
            <span className="text-xs font-normal text-slate-500">PDF, DOCX, PPTX, or TXT up to 15 MB</span>
          </label>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? <LoaderCircle className="animate-spin" size={16} /> : <Upload size={16} />}
            <span className="ml-2">{isUploading ? "Processing..." : "Upload"}</span>
          </Button>
        </form>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
      </Card>
      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold">Search your materials</h2>
        <p className="mt-1 text-sm text-slate-600">Find relevant source sections with semantic search.</p>
        <form className="mt-4 flex gap-2" onSubmit={searchMaterials}>
          <Input name="query" placeholder="e.g. TCP congestion control" maxLength={1000} />
          <Button type="submit" variant="outline" disabled={isSearching}>{isSearching ? <LoaderCircle className="animate-spin" size={16} /> : <Search size={16} />}</Button>
        </form>
        {results.length > 0 && (
          <div className="mt-5 grid gap-3">
            {results.map((result) => (
              <Link key={result.id} href={`/materials/${result.documentId}`} className="rounded-lg border p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-4"><p className="font-medium">{result.documentName}</p><span className="text-xs text-slate-500">{Math.round(result.similarity * 100)}% relevant</span></div>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{result.content}</p>
              </Link>
            ))}
          </div>
        )}
      </Card>
      <section>
        <h2 className="text-lg font-semibold">Your library</h2>
        {documents.length ? (
          <div className="mt-4 grid gap-3">
            {documents.map((document) => (
              <Card className="flex items-center gap-4 p-4" key={document.id}>
                <FileText className="shrink-0 text-blue-600" size={22} />
                <Link href={`/materials/${document.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium">{document.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatBytes(document.byteSize)} · {formatStatus(document.status)} · {new Date(document.createdAt).toLocaleDateString()}</p>
                </Link>
                <Button aria-label={`Delete ${document.name}`} variant="ghost" size="sm" onClick={() => deleteDocument(document.id)}><Trash2 size={17} /></Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-4 grid place-items-center gap-2 border-dashed p-10 text-center">
            <FileSearch className="text-slate-400" size={28} />
            <p className="font-medium">No materials yet</p>
            <p className="text-sm text-slate-500">Upload a document to make it available for search and tutoring.</p>
          </Card>
        )}
      </section>
    </div>
  );
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`;
}

function formatStatus(status: Document["status"]) {
  return status === "READY" ? "Ready" : status === "FAILED" ? "Processing failed" : "Processing";
}
