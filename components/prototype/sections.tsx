import type { ReactNode } from "react";

export function GlassCard({ children }: { children: ReactNode }) {
  return (
    <section className="cl-card p-6 md:p-8 bg-white/85 backdrop-blur-sm">
      {children}
    </section>
  );
}

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-[var(--primary)]">Paso {current} de {total}</span>
        <span className="text-slate-600">{pct}% completado</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-2 bg-[var(--primary)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
