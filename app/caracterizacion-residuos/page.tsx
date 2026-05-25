import { DashboardShell } from "@/components/prototype/dashboard-shell";
import { CaracterizacionResiduosForm } from "@/components/prototype/caracterizacion-residuos-form";
import { CARACTERIZACION_COPY } from "@/src/constants/copy";
import { Suspense } from "react";

export default function CaracterizacionResiduosPage() {
  return (
    <DashboardShell title={CARACTERIZACION_COPY.title} stepLabel={CARACTERIZACION_COPY.stepLabel} progressLabel={CARACTERIZACION_COPY.totalProgressValue}>
      <div className="mx-auto w-full max-w-[1700px]">
        <Suspense fallback={<div className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm" />}>
          <CaracterizacionResiduosForm />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
