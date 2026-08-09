"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BookOpen, BrainCircuit, CalendarDays, FileText, Flashlight, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/materials", label: "Study Materials", icon: FileText },
  { href: "/tutor", label: "AI Tutor", icon: BrainCircuit },
  { href: "/quiz", label: "Quizzes", icon: BookOpen },
  { href: "/flashcards", label: "Flashcards", icon: Flashlight },
  { href: "/study-plan", label: "Study Plan", icon: CalendarDays },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <Link href="/dashboard" className="px-5 py-5 text-lg font-bold">AI Study Tutor</Link>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn("inline-flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950", pathname === href && "bg-blue-50 text-blue-700")}>
            <Icon size={18} />{label}
          </Link>
        ))}
      </nav>
      <button onClick={logout} className="m-3 inline-flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 md:mt-auto">
        <LogOut size={18} />Log out
      </button>
    </aside>
  );
}
