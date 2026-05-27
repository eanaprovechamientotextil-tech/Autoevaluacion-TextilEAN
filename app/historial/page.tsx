import { DashboardShell } from "@/components/prototype/dashboard-shell";
import { HistorialCompareTable } from "@/components/historial/historial-compare-table";
import { createClient } from "@/lib/supabase/server";
import { APP_ROUTES } from "@/src/constants/routes";
import { HISTORIAL_COPY } from "@/src/constants/copy";
import { redirect } from "next/navigation";

type CompanyRow = {
  id: string;
  numero_solicitud: string;
  nombre_empresa: string;
  created_at: string | null;
};

function resolveNextRoute(params: {
  hasDiagnostico: boolean;
  hasCaracterizacion: boolean;
  hasPlanAccion: boolean;
  hasMatrizSeguimiento: boolean;
}) {
  if (!params.hasDiagnostico) return APP_ROUTES.autodiagnostico;
  if (params.hasDiagnostico && !params.hasCaracterizacion) return APP_ROUTES.caracterizacion;
  if (params.hasCaracterizacion && !params.hasPlanAccion) return APP_ROUTES.evaluacionClasificacion;
  if (params.hasPlanAccion && !params.hasMatrizSeguimiento) {
    return APP_ROUTES.matrizSeguimiento;
  }
  return APP_ROUTES.matrizSeguimiento;
}

function resolveProgressLabel(params: {
  hasDiagnostico: boolean;
  hasCaracterizacion: boolean;
  hasPlanAccion: boolean;
  hasMatrizSeguimiento: boolean;
}) {
  if (!params.hasDiagnostico) return "Falta paso 2: Autodiagnóstico";
  if (!params.hasCaracterizacion) return "Falta paso 3: Caracterización";
  if (!params.hasPlanAccion) return "Falta paso 4: Plan de acción y KPIs";
  if (!params.hasMatrizSeguimiento) return "Falta paso 5: Matriz de seguimiento";
  return "Proceso completo";
}

export default async function HistorialPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, numero_solicitud, nombre_empresa, created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (companiesError) {
    return (
      <DashboardShell title={HISTORIAL_COPY.title} stepLabel={HISTORIAL_COPY.subtitle} progressLabel="">
        <section className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {companiesError.message || HISTORIAL_COPY.authRequired}
        </section>
      </DashboardShell>
    );
  }

  const companyRows = (companies ?? []) as CompanyRow[];
  const companyIds = companyRows.map((company) => company.id);
  const requestNumbers = companyRows.map((company) => company.numero_solicitud);

  const [diagnosticosResult, caracterizacionResult, planAccionResult, matrizResult] = await Promise.all([
    companyIds.length
      ? supabase
          .from("diagnosticos")
          .select("id_empresa, numero_solicitud")
          .in("id_empresa", companyIds)
          .in("numero_solicitud", requestNumbers)
      : Promise.resolve({ data: [], error: null }),
    companyIds.length
      ? supabase
          .from("caracterizacion_residuos")
          .select("id_empresa, numero_solicitud")
          .in("id_empresa", companyIds)
          .in("numero_solicitud", requestNumbers)
      : Promise.resolve({ data: [], error: null }),
    companyIds.length
      ? supabase
          .from("plan_accion_kpis")
          .select("id_empresa, numero_solicitud")
          .in("id_empresa", companyIds)
          .in("numero_solicitud", requestNumbers)
      : Promise.resolve({ data: [], error: null }),
    companyIds.length
      ? supabase
          .from("seguimiento_resultado")
          .select("id_empresa, numero_solicitud")
          .in("id_empresa", companyIds)
          .in("numero_solicitud", requestNumbers)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const diagnosticoKeys = new Set(
    (diagnosticosResult.data ?? []).map((row) => `${row.id_empresa}-${row.numero_solicitud}`),
  );
  const caracterizacionKeys = new Set(
    (caracterizacionResult.data ?? []).map((row) => `${row.id_empresa}-${row.numero_solicitud}`),
  );
  const planAccionKeys = new Set(
    (planAccionResult.data ?? []).map((row) => `${row.id_empresa}-${row.numero_solicitud}`),
  );
  const matrizKeys = new Set(
    (matrizResult.data ?? []).map((row) => `${row.id_empresa}-${row.numero_solicitud}`),
  );

  const rows = companyRows.map((company) => {
    const key = `${company.id}-${company.numero_solicitud}`;
    const hasDiagnostico = diagnosticoKeys.has(key);
    const hasCaracterizacion = caracterizacionKeys.has(key);
    const hasPlanAccion = planAccionKeys.has(key);
    const hasMatrizSeguimiento = matrizKeys.has(key);

    const isComplete = hasDiagnostico && hasCaracterizacion && hasPlanAccion && hasMatrizSeguimiento;
    const nextRoute = resolveNextRoute({
      hasDiagnostico,
      hasCaracterizacion,
      hasPlanAccion,
      hasMatrizSeguimiento,
    });

    return {
      ...company,
      isComplete,
      nextRoute,
      progressLabel: resolveProgressLabel({
        hasDiagnostico,
        hasCaracterizacion,
        hasPlanAccion,
        hasMatrizSeguimiento,
      }),
    };
  });

  return (
    <DashboardShell title={HISTORIAL_COPY.title} stepLabel={HISTORIAL_COPY.subtitle} progressLabel="">
      <section className="mx-auto w-full max-w-[1700px] rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--outline)]/50 bg-[var(--surface-subtle)] p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">{HISTORIAL_COPY.emptyTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">{HISTORIAL_COPY.emptyDescription}</p>
          </div>
        ) : (
          <HistorialCompareTable
            rows={rows}
            copy={{
              requestNumber: HISTORIAL_COPY.tableHeaders.requestNumber,
              clientName: HISTORIAL_COPY.tableHeaders.clientName,
              status: HISTORIAL_COPY.tableHeaders.status,
              updatedAt: HISTORIAL_COPY.tableHeaders.updatedAt,
              actions: HISTORIAL_COPY.tableHeaders.actions,
              statusComplete: HISTORIAL_COPY.statusComplete,
              statusInProgress: HISTORIAL_COPY.statusInProgress,
              viewAnalysisButton: HISTORIAL_COPY.viewAnalysisButton,
              continueButton: HISTORIAL_COPY.continueButton,
              compareButton: "Comparar",
              compareTooltip: "Seleccioná 2 solicitudes completadas de la misma empresa",
            }}
          />
        )}
      </section>
    </DashboardShell>
  );
}
