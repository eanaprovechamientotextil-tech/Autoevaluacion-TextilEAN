import { DashboardShell } from "@/components/prototype/dashboard-shell";
import { PlanAccionKpisForm } from "@/components/prototype/plan-accion-kpis-form";
import { PLAN_ACCION_KPIS_COPY } from "@/src/constants/copy";
import { Suspense } from "react";

export default function EvaluacionClasificacionPage() {
  return (
    <DashboardShell
      title={PLAN_ACCION_KPIS_COPY.title}
      stepLabel={PLAN_ACCION_KPIS_COPY.stepLabel}
      progressLabel={PLAN_ACCION_KPIS_COPY.progress}
    >
      <div className="mx-auto w-full max-w-[1700px]">
        <Suspense fallback={<div className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm" />}>
          <PlanAccionKpisForm />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
