import { AutodiagnosticoMatriz } from "@/components/prototype/autodiagnostico-matriz";
import { DashboardShell } from "@/components/prototype/dashboard-shell";
import { AUTODIAGNOSTICO_COPY } from "@/src/constants/copy";
import { Suspense } from "react";

export default function AutodiagnosticoDetalladoPage() {
  return (
    <DashboardShell title={AUTODIAGNOSTICO_COPY.title} stepLabel={AUTODIAGNOSTICO_COPY.stepLabel} progressLabel={AUTODIAGNOSTICO_COPY.progress}>
      <div className="mx-auto w-full max-w-[1700px]">
        <Suspense fallback={<div className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm" />}>
          <AutodiagnosticoMatriz />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
