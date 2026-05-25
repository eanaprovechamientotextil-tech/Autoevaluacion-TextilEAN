"use client";

import { ANALISIS_COPY } from "@/src/constants/copy";

export function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-xl bg-[var(--primary)] px-4 py-2 font-semibold text-white hover:opacity-90"
    >
      {ANALISIS_COPY.printAction}
    </button>
  );
}
