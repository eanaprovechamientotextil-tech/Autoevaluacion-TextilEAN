import { DashboardShell } from "@/components/prototype/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { APP_ROUTES } from "@/src/constants/routes";
import { HISTORIAL_COPY } from "@/src/constants/copy";
import Link from "next/link";
import { redirect } from "next/navigation";

type CompanyRow = {
  id: string;
  numero_solicitud: string;
  nombre_empresa: string;
  created_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return HISTORIAL_COPY.fallbackDate;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return HISTORIAL_COPY.fallbackDate;

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

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

  const rows = companyRows
    .map((company) => {
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-[var(--surface-subtle)]">
                <tr>
                  <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    {HISTORIAL_COPY.tableHeaders.requestNumber}
                  </th>
                  <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    {HISTORIAL_COPY.tableHeaders.clientName}
                  </th>
                  <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    {HISTORIAL_COPY.tableHeaders.status}
                  </th>
                  <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    {HISTORIAL_COPY.tableHeaders.updatedAt}
                  </th>
                  <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    {HISTORIAL_COPY.tableHeaders.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.id}-${row.numero_solicitud}`}>
                    <td className="border-b border-[var(--outline)]/20 px-3 py-3 text-sm font-medium text-slate-700">
                      {row.numero_solicitud}
                    </td>
                    <td className="border-b border-[var(--outline)]/20 px-3 py-3 text-sm text-slate-700">{row.nombre_empresa}</td>
                    <td className="border-b border-[var(--outline)]/20 px-3 py-3 text-sm text-slate-700">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          row.isComplete
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {row.isComplete ? HISTORIAL_COPY.statusComplete : HISTORIAL_COPY.statusInProgress}
                      </span>
                      <p className="mt-1 text-xs text-slate-500">{row.progressLabel}</p>
                    </td>
                    <td className="border-b border-[var(--outline)]/20 px-3 py-3 text-sm text-slate-700">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="border-b border-[var(--outline)]/20 px-3 py-3 text-sm text-slate-700">
                      {row.isComplete ? (
                        <Link
                          href={`${APP_ROUTES.analisis}?empresa=${encodeURIComponent(row.id)}&sol=${encodeURIComponent(row.numero_solicitud)}`}
                          className="inline-flex rounded-xl border border-[var(--primary)] px-3 py-1.5 font-semibold text-[var(--primary)] hover:bg-[var(--surface-subtle)]"
                        >
                          {HISTORIAL_COPY.viewAnalysisButton}
                        </Link>
                      ) : (
                        <Link
                          href={`${row.nextRoute}?empresa=${encodeURIComponent(row.id)}&sol=${encodeURIComponent(row.numero_solicitud)}`}
                          className="inline-flex rounded-xl bg-[var(--primary)] px-3 py-1.5 font-semibold text-white hover:opacity-90"
                        >
                          {HISTORIAL_COPY.continueButton}
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
