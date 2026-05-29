import { createClient } from "@/lib/supabase/server";
import { isGlobalAdminEmail } from "@/src/constants/auth";
import { APP_ROUTES } from "@/src/constants/routes";
import { ANALISIS_COPY } from "@/src/constants/copy";
import { CompareCharts } from "@/components/analisis/compare-charts";
import Link from "next/link";
import { redirect } from "next/navigation";

type SearchParams = {
  empresaA?: string;
  solA?: string;
  empresaB?: string;
  solB?: string;
};

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(value);
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

type Snapshot = {
  companyRecord: Record<string, unknown>;
  customerSummaryFields: { label: string; value: unknown }[];
  maturity: number;
  totalWeightedResult: number;
  diagnosticoConclusion: string;
  totalWaste: number;
  recoverableWaste: number;
  totalRecoverablePercent: number;
  avgKpi: number;
  plan: { acciones_alta_prioridad: number; acciones_cerradas: number; acciones_en_riesgo: number; estado_general: string | null } | null;
  seguimientoResultado: { nivel_cumplimiento: string; promedio_cumplimiento: number | null; interpretacion: string | null } | null;
  seguimientoDetalle: Array<{ etapa: string; resultado: string | null; cumplimiento: number | null }>;
  aliados: Array<{ nombre_aliado: string; tipo_aliado: string; estado_alianza: string }>;
  estrategiaTotales: Record<string, number>;
  caracterizacionConclusion: string;
};

async function loadSnapshot(
  supabase: Awaited<ReturnType<typeof createClient>>,
  empresa: string,
  sol: string,
  userId: string,
  isAdmin: boolean,
): Promise<Snapshot | null> {
  let companyQuery = supabase
    .from("companies")
    .select("*")
    .eq("id", empresa)
    .eq("numero_solicitud", sol);

  if (!isAdmin) {
    companyQuery = companyQuery.eq("created_by", userId);
  }

  const { data: company } = await companyQuery.maybeSingle();

  if (!company) return null;

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
    .select("id, resultado_total_ponderado, porcentaje_madurez, conclusion")
    .eq("id_empresa", empresa)
    .eq("numero_solicitud", sol)
    .order("fecha_creacion", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: diagnosticoDetalle } = diagnostico?.id
    ? await supabase
        .from("diagnostico_detalle")
        .select("resultado_ponderado")
        .eq("id_diagnostico", diagnostico.id)
    : { data: [] as Array<{ resultado_ponderado: number }> };

  const recalculatedTotalWeighted = (diagnosticoDetalle ?? []).reduce(
    (acc, row) => acc + toNumber(row.resultado_ponderado),
    0,
  );
  const recalculatedMaturity = (recalculatedTotalWeighted / 5) * 100;

  const { data: caracterizacionRows } = await supabase
    .from("caracterizacion_residuos")
    .select("id, total_residuos_kg_mes, total_aprovechable_kg_mes, porcentaje_total_aprovechable, conclusion_automatica")
    .eq("id_empresa", empresa)
    .eq("numero_solicitud", sol)
    .order("fecha_creacion", { ascending: false })
    .limit(1);

  const caracterizacion = caracterizacionRows?.[0] ?? null;

  const { data: plan } = await supabase
    .from("plan_accion_kpis")
    .select("acciones_alta_prioridad, acciones_cerradas, acciones_en_riesgo, cumplimiento_promedio_kpi, estado_general")
    .eq("id_empresa", empresa)
    .eq("numero_solicitud", sol)
    .order("fecha_creacion", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: seguimientoResultado } = await supabase
    .from("seguimiento_resultado")
    .select("nivel_cumplimiento, promedio_cumplimiento, interpretacion")
    .eq("id_empresa", empresa)
    .eq("numero_solicitud", sol)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: aliados } = await supabase
    .from("aliados")
    .select("nombre_aliado, tipo_aliado, estado_alianza")
    .eq("id_empresa", empresa)
    .eq("numero_solicitud", sol);

  const { data: seguimientoDetalle } = await supabase
    .from("seguimiento_resultado")
    .select("id")
    .eq("id_empresa", empresa)
    .eq("numero_solicitud", sol)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let segDetalle: Array<{ etapa: string; resultado: string | null; cumplimiento: number | null }> = [];
  if (seguimientoDetalle?.id) {
    const { data: detalle } = await supabase
      .from("seguimiento_etapa")
      .select("etapa, resultado, cumplimiento")
      .eq("id_resultado", seguimientoDetalle.id)
      .order("created_at", { ascending: true });
    segDetalle = (detalle ?? []) as Array<{ etapa: string; resultado: string | null; cumplimiento: number | null }>;
  }

  let estrategiaTotales: Record<string, number> = {};
  if (caracterizacion?.id) {
    const { data: caracDetalle } = await supabase
      .from("caracterizacion_residuos_detalle")
      .select("estrategia, cantidad_residuos_kg_mes")
      .eq("id_caracterizacion", caracterizacion.id);

    estrategiaTotales = (caracDetalle ?? []).reduce<Record<string, number>>((acc, row) => {
      const key = (row.estrategia as string) || "Sin estrategia";
      acc[key] = (acc[key] ?? 0) + toNumber(row.cantidad_residuos_kg_mes);
      return acc;
    }, {});
  }

  return {
    companyRecord,
    customerSummaryFields,
    maturity: diagnosticoDetalle?.length ? recalculatedMaturity : toNumber(diagnostico?.porcentaje_madurez),
    totalWeightedResult: diagnosticoDetalle?.length ? recalculatedTotalWeighted : toNumber(diagnostico?.resultado_total_ponderado),
    diagnosticoConclusion: (diagnostico?.conclusion as string) || "",
    totalWaste: toNumber(caracterizacion?.total_residuos_kg_mes),
    recoverableWaste: toNumber(caracterizacion?.total_aprovechable_kg_mes),
    totalRecoverablePercent: toNumber(caracterizacion?.porcentaje_total_aprovechable),
    avgKpi: toNumber(plan?.cumplimiento_promedio_kpi),
    plan: plan as Snapshot["plan"],
    seguimientoResultado: seguimientoResultado as Snapshot["seguimientoResultado"],
    seguimientoDetalle: segDetalle,
    aliados: (aliados ?? []) as Snapshot["aliados"],
    estrategiaTotales,
    caracterizacionConclusion: (caracterizacion?.conclusion_automatica as string) || "",
  };
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--outline)]/30 p-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export default async function CompararAnalisisPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const empresaA = (params.empresaA ?? "").trim();
  const solA = (params.solA ?? "").trim().toUpperCase();
  const empresaB = (params.empresaB ?? "").trim();
  const solB = (params.solB ?? "").trim().toUpperCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(APP_ROUTES.login);

  const isAdmin = isGlobalAdminEmail(user.email);

  if (!empresaA || !solA || !empresaB || !solB) {
    return (
      <section className="mx-auto mt-8 max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Faltan parámetros para la comparación. Se necesitan dos solicitudes.
      </section>
    );
  }

  if (solA === solB && empresaA === empresaB) {
    return (
      <section className="mx-auto mt-8 max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        No podés comparar una solicitud consigo misma.
      </section>
    );
  }

  const [snapA, snapB] = await Promise.all([
    loadSnapshot(supabase, empresaA, solA, user.id, isAdmin),
    loadSnapshot(supabase, empresaB, solB, user.id, isAdmin),
  ]);

  if (!snapA || !snapB) {
    return (
        <section className="mx-auto mt-8 max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          No se encontraron ambas solicitudes o no tenés permisos para acceder.
        </section>
      );
  }

  const nombreA = String(snapA.companyRecord.nombre_empresa ?? "").trim();
  const nombreB = String(snapB.companyRecord.nombre_empresa ?? "").trim();
  const normalize = (v: string) => v.trim().replace(/\s+/g, " ").toLocaleUpperCase("es-CO");

  if (normalize(nombreA) !== normalize(nombreB)) {
    return (
      <section className="mx-auto mt-8 max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Las solicitudes seleccionadas no pertenecen a la misma empresa ({nombreA} vs {nombreB}).
      </section>
    );
  }

  const labelA = `SOL_${solA.replace("SOL_", "")}`;
  const labelB = `SOL_${solB.replace("SOL_", "")}`;

  const metricData = [
    { name: "% Madurez", a: snapA.maturity, b: snapB.maturity, higherBetter: true },
    { name: "Total residuos (kg/mes)", a: snapA.totalWaste, b: snapB.totalWaste, higherBetter: false },
    { name: "Total aprovechable (kg/mes)", a: snapA.recoverableWaste, b: snapB.recoverableWaste, higherBetter: true },
    { name: "% KPI Promedio", a: snapA.avgKpi, b: snapB.avgKpi, higherBetter: true },
  ];

  const allEstrategias = new Set<string>();
  Object.keys(snapA.estrategiaTotales).forEach((k) => allEstrategias.add(k));
  Object.keys(snapB.estrategiaTotales).forEach((k) => allEstrategias.add(k));

  const estrategiaData = Array.from(allEstrategias).map((estrategia) => ({
    estrategia,
    A: snapA.estrategiaTotales[estrategia] ?? 0,
    B: snapB.estrategiaTotales[estrategia] ?? 0,
  }));

  return (
    <section className="mx-auto w-full max-w-6xl p-6 print:p-0">
      <style>{`@media print { .no-print { display:none !important; } body { background:white; } }`}</style>

      <div className="no-print mb-5 flex items-center justify-between gap-3">
        <Link href={APP_ROUTES.historial} className="rounded-xl border border-[var(--outline)] px-4 py-2 font-semibold text-slate-700">
          {ANALISIS_COPY.backToHistory}
        </Link>
      </div>

      <article className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Comparación de Análisis</h1>
        <p className="text-slate-600">{nombreA} — {labelA} vs {labelB}</p>

        {/* Gráficas */}
        <div className="mt-6">
          <CompareCharts
            metricData={metricData}
            estrategiaData={estrategiaData}
            labelA={labelA}
            labelB={labelB}
          />
        </div>

        {/* Detalle lado a lado */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[{ label: labelA, snap: snapA }, { label: labelB, snap: snapB }].map(({ label, snap }) => (
            <div key={label} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">{label}</h3>

              <SectionCard title="Calificación Autodiagnóstico">
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-slate-500">Calificación:</span>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-bold ${scoreTone(snap.totalWeightedResult)}`}>
                      {formatNumber(snap.totalWeightedResult)}
                    </span>
                  </div>
                  <p><span className="font-semibold text-slate-700">Madurez:</span> {formatNumber(snap.maturity)}%</p>
                  <p className="text-xs text-slate-600">{snap.diagnosticoConclusion || "Sin conclusión"}</p>
                </div>
              </SectionCard>

              <SectionCard title="Caracterización de Residuos">
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-semibold text-slate-700">Total:</span> {formatNumber(snap.totalWaste)} kg/mes</p>
                  <p><span className="font-semibold text-slate-700">Aprovechable:</span> {formatNumber(snap.recoverableWaste)} kg/mes</p>
                  <p><span className="font-semibold text-slate-700">% Aprovechable:</span> {formatNumber(snap.totalRecoverablePercent)}%</p>
                </div>
                {Object.keys(snap.estrategiaTotales).length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-slate-700">
                    {Object.entries(snap.estrategiaTotales).map(([k, v]) => (
                      <li key={k}>{k}: {formatNumber(v)} kg/mes</li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard title="Plan de Acción y KPIs">
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-indigo-50 p-2"><p className="text-xs text-slate-500">Alta prioridad</p><p className="font-bold text-indigo-700">{toNumber(snap.plan?.acciones_alta_prioridad)}</p></div>
                  <div className="rounded-lg bg-emerald-50 p-2"><p className="text-xs text-slate-500">Cerradas</p><p className="font-bold text-emerald-700">{toNumber(snap.plan?.acciones_cerradas)}</p></div>
                  <div className="rounded-lg bg-rose-50 p-2"><p className="text-xs text-slate-500">En riesgo</p><p className="font-bold text-rose-700">{toNumber(snap.plan?.acciones_en_riesgo)}</p></div>
                </div>
                <div className={`mt-2 rounded-lg px-3 py-2 text-sm ${cumplimientoTone(Number.isFinite(snap.avgKpi) ? snap.avgKpi : null)}`}>
                  <span className="font-semibold">KPI promedio:</span> {formatNumber(snap.avgKpi)}%
                </div>
              </SectionCard>

              <SectionCard title="Matriz de Seguimiento">
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-semibold text-slate-700">Nivel:</span> {snap.seguimientoResultado?.nivel_cumplimiento || "Sin datos"}</p>
                  <p><span className="font-semibold text-slate-700">Promedio:</span> {formatNumber(toNumber(snap.seguimientoResultado?.promedio_cumplimiento))}%</p>
                </div>
                <p className="mt-2 text-xs text-slate-600 italic">{snap.seguimientoResultado?.interpretacion || ""}</p>
                {snap.seguimientoDetalle.length > 0 ? (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-[var(--surface-subtle)]">
                        <tr>
                          <th className="px-2 py-1 text-left font-bold uppercase text-slate-600">Etapa</th>
                          <th className="px-2 py-1 text-left font-bold uppercase text-slate-600">Resultado</th>
                          <th className="px-2 py-1 text-left font-bold uppercase text-slate-600">Cumplimiento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {snap.seguimientoDetalle.map((row) => (
                          <tr key={row.etapa}>
                            <td className="border-b border-[var(--outline)]/20 px-2 py-1 text-slate-700">{row.etapa}</td>
                            <td className="border-b border-[var(--outline)]/20 px-2 py-1 text-slate-700">{row.resultado || "-"}</td>
                            <td className="border-b border-[var(--outline)]/20 px-2 py-1 font-semibold text-slate-900">{toNumber(row.cumplimiento).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </SectionCard>

              <SectionCard title="Aliados">
                {snap.aliados.length === 0 ? (
                  <p className="text-sm text-slate-600">Sin aliados registrados.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-xs text-slate-700">
                    {snap.aliados.map((a, i) => (
                      <li key={`${a.nombre_aliado}-${i}`}>{a.nombre_aliado} ({a.tipo_aliado}) — {a.estado_alianza}</li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
