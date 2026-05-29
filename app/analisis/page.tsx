import { createClient } from "@/lib/supabase/server";
import { isGlobalAdminEmail } from "@/src/constants/auth";
import { ANALISIS_COPY } from "@/src/constants/copy";
import { APP_ROUTES } from "@/src/constants/routes";
import Link from "next/link";
import { redirect } from "next/navigation";

type SearchParams = {
  empresa?: string;
  sol?: string;
};

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function scoreTone(value: number) {
  if (value < 3) return "bg-red-50 text-red-700 border-red-200";
  if (value <= 4.5) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function cumplimientoTone(value: number | null) {
  if (value === null) return "bg-slate-100 text-slate-600";
  if (value >= 80) return "bg-emerald-50 text-emerald-700";
  if (value >= 50) return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

function estadoGeneralTone(value: string | null | undefined) {
  const normalized = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (!normalized || normalized === "sin datos") return "bg-slate-100 text-slate-600";
  if (normalized.startsWith("en control")) return "bg-emerald-50 text-emerald-700";
  if (normalized.startsWith("en seguimiento")) return "bg-amber-50 text-amber-700";
  if (normalized.startsWith("critico")) return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-600";
}

export default async function AnalisisPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const empresa = (params.empresa ?? "").trim();
  const sol = (params.sol ?? "").trim().toUpperCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(APP_ROUTES.login);

  if (!empresa || !sol) {
    return <section className="mx-auto mt-8 max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{ANALISIS_COPY.noContext}</section>;
  }

  const isAdmin = isGlobalAdminEmail(user.email);

  let companyQuery = supabase
    .from("companies")
    .select("*")
    .eq("id", empresa)
    .eq("numero_solicitud", sol);

  if (!isAdmin) {
    companyQuery = companyQuery.eq("created_by", user.id);
  }

  const { data: company } = await companyQuery.maybeSingle();

  if (!company) {
    return <section className="mx-auto mt-8 max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{ANALISIS_COPY.noContext}</section>;
  }

  const companyRecord = company as Record<string, unknown>;
  const customerSummaryFields = [
    { label: "Número de solicitud", value: companyRecord.numero_solicitud },
    { label: "Nombre de empresa", value: companyRecord.nombre_empresa },
    { label: "Dirección", value: companyRecord.direccion },
    { label: "Ciudad", value: companyRecord.ciudad_municipio },
    { label: "Número de empleados", value: companyRecord.employee_count },
    { label: "Tamaño de empresa", value: companyRecord.tamano_empresa },
    { label: "Nombre responsable", value: companyRecord.responsable_aprovechamiento },
    { label: "Teléfono", value: companyRecord.telefono_contacto },
    { label: "Cargo", value: companyRecord.cargo_responsable },
  ];

  const { data: diagnostico } = await supabase
    .from("diagnosticos")
    .select("id, resultado_total_ponderado, porcentaje_madurez, conclusion, fecha_creacion")
    .eq("id_empresa", empresa)
    .eq("numero_solicitud", sol)
    .order("fecha_creacion", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: diagnosticoDetalle } = diagnostico?.id
    ? await supabase
        .from("diagnostico_detalle")
        .select("peso_porcentaje, calificacion, resultado_ponderado")
        .eq("id_diagnostico", diagnostico.id)
    : { data: [] as Array<{ peso_porcentaje: number; calificacion: number; resultado_ponderado: number }> };

  const recalculatedTotalWeighted = (diagnosticoDetalle ?? []).reduce(
    (acc, row) => acc + toNumber(row.resultado_ponderado),
    0,
  );
  const recalculatedMaturity = (recalculatedTotalWeighted / 5) * 100;

  const { data: caracterizacionRows } = await supabase
    .from("caracterizacion_residuos")
    .select("id, total_residuos_kg_mes, total_aprovechable_kg_mes, porcentaje_total_aprovechable, conclusion_automatica, fecha_creacion")
    .eq("numero_solicitud", sol)
    .order("fecha_creacion", { ascending: false })
    .limit(1);

  const caracterizacion = caracterizacionRows?.[0] ?? null;

  const { data: plan } = await supabase
    .from("plan_accion_kpis")
    .select("id, acciones_alta_prioridad, acciones_cerradas, acciones_en_riesgo, cumplimiento_promedio_kpi, estado_general")
    .eq("numero_solicitud", sol)
    .order("fecha_creacion", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: seguimientoResultado } = await supabase
    .from("seguimiento_resultado")
    .select("id, interpretacion, nivel_cumplimiento, promedio_cumplimiento, created_at")
    .eq("numero_solicitud", sol)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: aliados } = await supabase
    .from("aliados")
    .select("nombre_aliado, tipo_aliado, estado_alianza")
    .eq("id_empresa", empresa)
    .eq("numero_solicitud", sol)
    .order("created_at", { ascending: true });

  const { data: seguimientoDetalle } = seguimientoResultado
    ? await supabase
        .from("seguimiento_etapa")
        .select("etapa, resultado, cumplimiento")
        .eq("id_resultado", seguimientoResultado.id)
        .order("created_at", { ascending: true })
    : { data: [] as Array<{ etapa: string; resultado: string | null; cumplimiento: number | null }> };

  const { data: caracterizacionDetalle } = caracterizacion?.id
    ? await supabase
        .from("caracterizacion_residuos_detalle")
        .select("estrategia, cantidad_residuos_kg_mes")
        .eq("id_caracterizacion", caracterizacion.id)
    : { data: [] as Array<{ estrategia: string; cantidad_residuos_kg_mes: number }> };

  const estrategiaTotales = (caracterizacionDetalle ?? []).reduce<Record<string, number>>((acc, row) => {
    const key = row.estrategia || "Sin estrategia";
    acc[key] = (acc[key] ?? 0) + toNumber(row.cantidad_residuos_kg_mes);
    return acc;
  }, {});

  const maturity = diagnosticoDetalle?.length ? recalculatedMaturity : toNumber(diagnostico?.porcentaje_madurez);
  const totalWeightedResult = diagnosticoDetalle?.length ? recalculatedTotalWeighted : toNumber(diagnostico?.resultado_total_ponderado);
  const totalWaste = toNumber(caracterizacion?.total_residuos_kg_mes);
  const recoverableWaste = toNumber(caracterizacion?.total_aprovechable_kg_mes);
  const totalRecoverablePercent = toNumber(caracterizacion?.porcentaje_total_aprovechable);
  const avgKpi = toNumber(plan?.cumplimiento_promedio_kpi);
  return (
    <section className="mx-auto w-full max-w-6xl p-6 print:p-0">
      <style>{`@media print { .no-print { display:none !important; } body { background:white; } .print-card { box-shadow:none !important; border-color:#d1d5db !important; } }`}</style>

      <div className="no-print mb-5 flex items-center justify-between gap-3">
        <Link href={APP_ROUTES.historial} className="rounded-xl border border-[var(--outline)] px-4 py-2 font-semibold text-slate-700">
          {ANALISIS_COPY.backToHistory}
        </Link>
      </div>

      <article className="print-card rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{ANALISIS_COPY.title}</h1>
        <p className="text-slate-600">{ANALISIS_COPY.subtitle}</p>

        <div className="mt-5 rounded-xl border border-[var(--outline)]/30 p-4">
          <h2 className="text-lg font-bold text-slate-900">Datos Clientes</h2>
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
            {customerSummaryFields.map((field) => (
              <div key={field.label} className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="font-semibold text-slate-700">{field.label}:</span>{" "}
                <span className="text-slate-900">{field.value === null || field.value === "" ? "-" : String(field.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[{ label: ANALISIS_COPY.metrics.maturity, value: `${formatNumber(maturity)}%`, color: "bg-sky-100 text-sky-800" }, { label: ANALISIS_COPY.metrics.totalWaste, value: formatNumber(totalWaste), color: "bg-violet-100 text-violet-800" }, { label: ANALISIS_COPY.metrics.recoverableWaste, value: formatNumber(recoverableWaste), color: "bg-emerald-100 text-emerald-800" }, { label: ANALISIS_COPY.metrics.avgKpi, value: `${formatNumber(avgKpi)}%`, color: "bg-amber-100 text-amber-800" }].map((card) => (
            <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">{card.label}</p>
              <p className="mt-2 text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-[var(--outline)]/30 p-4">
            <h2 className="text-lg font-bold text-slate-900">Calificación Autodiagnóstico</h2>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Calificación Autodiagnóstico</p>
                <p className="mt-1">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-lg font-bold ${scoreTone(totalWeightedResult)}`}>
                    {formatNumber(totalWeightedResult)}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">% Madurez</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(maturity)}%</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Conclusión</p>
                <p className={`mt-1 rounded-xl border px-4 py-3 font-medium ${scoreTone(totalWeightedResult)}`}>
                  {diagnostico?.conclusion || ANALISIS_COPY.noConclusion}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--outline)]/30 p-4">
            <h2 className="text-lg font-bold text-slate-900">Caracterización de Residuos</h2>

            <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-700">Total residuos</p>
                <p className="text-slate-900">{formatNumber(totalWaste)} kg/mes</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-700">Total aprovechable</p>
                <p className="text-slate-900">{formatNumber(recoverableWaste)} kg/mes</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-700">Porcentaje total aprovechable</p>
                <p className="text-slate-900">{formatNumber(totalRecoverablePercent)}%</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <p className="font-semibold text-slate-700">Totales por estrategia</p>
              {Object.entries(estrategiaTotales).length === 0 ? (
                <p className="mt-1 text-slate-900">-</p>
              ) : (
                <ul className="mt-1 space-y-1 text-slate-900">
                  {Object.entries(estrategiaTotales).map(([name, value]) => (
                    <li key={`summary-${name}`}>
                      {name}: {formatNumber(value)} kg/mes
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <p className="font-semibold text-slate-700">Conclusión</p>
              <p className="mt-1 text-slate-900">{caracterizacion?.conclusion_automatica ? `Conclusión: ${caracterizacion.conclusion_automatica}` : ANALISIS_COPY.noConclusion}</p>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--outline)]/30 p-4">
            <h2 className="text-lg font-bold text-slate-900">{ANALISIS_COPY.sections.planSummary}</h2>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-indigo-50 p-3"><p className="text-xs text-slate-500">{ANALISIS_COPY.labels.highPriority}</p><p className="text-xl font-bold text-indigo-700">{toNumber(plan?.acciones_alta_prioridad)}</p></div>
              <div className="rounded-lg bg-emerald-50 p-3"><p className="text-xs text-slate-500">{ANALISIS_COPY.labels.closed}</p><p className="text-xl font-bold text-emerald-700">{toNumber(plan?.acciones_cerradas)}</p></div>
              <div className="rounded-lg bg-rose-50 p-3"><p className="text-xs text-slate-500">{ANALISIS_COPY.labels.atRisk}</p><p className="text-xl font-bold text-rose-700">{toNumber(plan?.acciones_en_riesgo)}</p></div>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div className={`rounded-lg px-3 py-2 ${cumplimientoTone(Number.isFinite(avgKpi) ? avgKpi : null)}`}>
                <p className="font-semibold">Cumplimiento promedio KPI</p>
                <p className="text-lg font-bold">{formatNumber(avgKpi)}%</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-700">Estado general</p>
                <p className="mt-1">
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${estadoGeneralTone(plan?.estado_general)}`}>
                    {plan?.estado_general || "Sin datos"}
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--outline)]/30 p-4">
            <h2 className="text-lg font-bold text-slate-900">Matriz de seguimiento (resumen)</h2>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-700">Nivel de cumplimiento</p>
                <p className="text-slate-900">{seguimientoResultado?.nivel_cumplimiento || "Sin datos"}</p>
              </div>
              <div className={`rounded-lg px-3 py-2 ${cumplimientoTone(seguimientoResultado?.promedio_cumplimiento == null ? null : toNumber(seguimientoResultado.promedio_cumplimiento))}`}>
                <p className="font-semibold">Promedio cumplimiento</p>
                <p className="text-slate-900">{formatNumber(toNumber(seguimientoResultado?.promedio_cumplimiento))}%</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <p className="font-semibold text-slate-700">Interpretación</p>
              <p className="mt-1 text-slate-900">{seguimientoResultado?.interpretacion || "Sin resumen de seguimiento."}</p>
            </div>

            {!seguimientoDetalle?.length ? (
              <p className="mt-4 text-sm text-slate-600">No hay matriz de seguimiento guardada para esta solicitud.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead className="bg-[var(--surface-subtle)]">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Etapa</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Resultado</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seguimientoDetalle.map((row) => (
                      <tr key={`resumen-${row.etapa}`}>
                        <td className="border-b border-[var(--outline)]/20 px-3 py-2 text-sm text-slate-700">{row.etapa}</td>
                        <td className="border-b border-[var(--outline)]/20 px-3 py-2 text-sm text-slate-700">{row.resultado || "-"}</td>
                        <td className="border-b border-[var(--outline)]/20 px-3 py-2 text-sm font-semibold text-slate-900">{toNumber(row.cumplimiento).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-[var(--outline)]/30 p-4">
          <h2 className="text-lg font-bold text-slate-900">Aliados registrados</h2>
          {!aliados?.length ? (
            <p className="mt-3 text-sm text-slate-600">No hay aliados guardados para esta solicitud.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {aliados.map((aliado) => (
                <li key={`${aliado.nombre_aliado}-${aliado.tipo_aliado}`} className="rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-semibold">{aliado.nombre_aliado}</span> - {aliado.tipo_aliado} - {aliado.estado_alianza}
                </li>
              ))}
            </ul>
          )}
        </section>

      </article>
    </section>
  );
}
