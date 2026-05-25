import type { ReactNode } from "react";
import Link from "next/link";
import { PLATFORM_COPY } from "@/src/constants/copy";
import { APP_ROUTES } from "@/src/constants/routes";
import { SignoutIconButton } from "@/components/auth/signout-icon-button";

type DashboardShellProps = {
  children: ReactNode;
  title?: string;
  stepLabel?: string;
  progressLabel?: string;
};

export function DashboardShell({
  children,
  title,
  stepLabel,
  progressLabel,
}: DashboardShellProps) {
  const progressMatch = progressLabel?.match(/(\d+(?:\.\d+)?)\s*%/);
  const progressPercent = progressMatch
    ? Math.max(0, Math.min(100, Number(progressMatch[1])))
    : 50;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--outline)]/40 bg-white/80 px-4 backdrop-blur-md md:px-8">
        <Link href={APP_ROUTES.homeApp} className="text-3xl font-extrabold tracking-tight text-[var(--primary)] hover:opacity-90">
          {PLATFORM_COPY.brand}
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={APP_ROUTES.historial}
            className="rounded-xl bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-900 transition hover:bg-violet-200"
          >
            {PLATFORM_COPY.historyButton}
          </Link>
          <SignoutIconButton />
          {/*<Link href={APP_ROUTES.registroEmpresa} className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white">
            {PLATFORM_COPY.ctaStart}
          </Link> */}
        </div>
      </header>

      <div className="flex-1 px-2 py-4 md:px-4">
        <main className="mx-auto w-full max-w-[1700px]">
          {(title || stepLabel) && (
            <div className="mb-6 w-full">
              <div className="mb-2 flex items-end justify-between">
                <div>
                  {stepLabel ? <p className="text-xs font-bold tracking-wider text-[var(--primary)]">{stepLabel}</p> : null}
                  {title ? <h1 className="text-3xl font-bold">{title}</h1> : null}
                </div>
                {progressLabel ? <p className="text-sm text-slate-500">{progressLabel}</p> : null}
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-subtle)]">
                <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}
          {children}
        </main>
      </div>

      <footer className="border-t border-[var(--outline)]/30 bg-[var(--surface-subtle)] px-4 py-6 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-slate-600 md:flex-row">
          <span>{PLATFORM_COPY.footer.copyright}</span>
          <span>{PLATFORM_COPY.footer.links.join(" · ")}</span>
        </div>
      </footer>
    </div>
  );
}
