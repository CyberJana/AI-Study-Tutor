import { Sidebar } from "@/components/dashboard/sidebar";
import { requireUser } from "@/lib/auth";

export async function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const displayName = user.name || user.email;

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b bg-white px-5 py-4 sm:px-8">
          <div>
            <p className="text-sm text-slate-500">Your learning workspace</p>
            <p className="font-semibold">{displayName}</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{displayName.slice(0, 1).toUpperCase()}</div>
        </header>
        <main className="mx-auto max-w-7xl p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
