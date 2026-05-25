import type { ReactNode } from "react";
import { MAIN_NAV_LINKS } from "@/src/constants/routes";

type AppShellProps = {
  title: string;
  children: ReactNode;
};

export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md border-[var(--outline)]">
        <div className="mx-auto max-w-6xl px-4 md:px-12 h-16 flex items-center justify-between">
          <h1 className="font-extrabold text-2xl text-[var(--primary)]">Circular Loom</h1>
          <nav className="hidden md:flex gap-8">
            {MAIN_NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={link.active ? "font-bold text-[var(--primary)]" : "text-slate-600"}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 md:px-12 py-8">
        <h2 className="text-3xl font-bold text-[var(--primary)] mb-6">{title}</h2>
        {children}
      </main>
    </div>
  );
}
