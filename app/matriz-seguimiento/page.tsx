"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/prototype/dashboard-shell";
import { SolicitudSelector } from "@/components/prototype/solicitud-selector";
import { APP_ROUTES } from "@/src/constants/routes";
import { createClient } from "@/lib/supabase/client";

type Row = {
  etapa: string;
  accion: string;
  kpi: string;
  resultado: string;
  cumplimiento: number;
};

const BASE_ROWS: Row[] = [
  { etapa: "Gestion de conocimiento", accion: "Capacitación en economia circular", kpi: "% Personal capacitado", resultado: "", cumplimiento: 0 },
  { etapa: "Diagnostico", accion: "Aplicación matriz diagnostica", kpi: "Matriz diligenciada", resultado: "", cumplimiento: 0 },
  { etapa: "Clasificacion", accion: "Caracterización de residuos", kpi: "% Residuos clasificados", resultado: "", cumplimiento: 0 },
  { etapa: "Aprovechamiento", accion: "Reutilización de retales", kpi: "Kg Aprovechados", resultado: "", cumplimiento: 0 },
  { etapa: "Alianzas", accion: "Vinculación con aliados estrategicos", kpi: "Número de alianzas activas", resultado: "", cumplimiento: 0 },
  { etapa: "Comercial", accion: "Participación en ferias sostenibles", kpi: "Número de eventos", resultado: "", cumplimiento: 0 },
];

function estadoPorCumplimiento(value: number) {
  if (value <= 0) return "Sin Calificar";
  if (value <= 2) return "Pendiente";
  if (value <= 3) return "En proceso";
  if (value <= 4) return "Avanzado";
  return "Cumplido";
}

function nivelPorPromedio(value: number) {
  if (value <= 2) return "Bajo";
  if (value <= 3.5) return "Medio";
  return "Alto";
}

function interpretacionPorNivel(nivel: string) {
  if (nivel === "Bajo") {
    return "La empresa presenta un nivel inicial de implementacion de la hoja de ruta y requiere fortalecer acciones relacionadas con economia circular, seguimiento y sostenibilidad.";
  }
  if (nivel === "Medio") {
    return "La empresa evidencia avances parciales en la implementacion de estrategias de economia circular; sin embargo, aun existen oportunidades de mejora y fortalecimiento en algunas etapas de la hoja de ruta.";
  }
  return "La empresa presenta un nivel favorable de implementacion de la hoja de ruta, evidenciando avances significativos en sostenibilidad, aprovechamiento textil y fortalecimiento empresarial.";
}

function nivelTone(nivel: string) {
  if (nivel === "Bajo") return "bg-red-50 text-red-700 border-red-200";
  if (nivel === "Medio") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function kpiResultadoMode(kpi: string) {
  const normalized = kpi.toLowerCase();
  if (normalized.includes("%")) return "percent" as const;
  if (normalized.includes("numero") || normalized.includes("kg")) return "number" as const;
  return "text" as const;
}

function clampResultadoByMode(value: string, mode: "text" | "percent" | "number") {
  if (mode === "text") return value;
  if (value === "") return "";

  const parsed = Number(value);
  if (Number.isNaN(parsed)) return "";

  if (mode === "percent") return Math.max(0, Math.min(100, parsed)).toString();
  return Math.max(0, parsed).toString();
}

function MatrizSeguimientoContent() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const searchParams = useSearchParams();
  const empresa = searchParams.get("empresa") ?? "";
  const sol = searchParams.get("sol") ?? "";
  const hasSelectedSolicitud = Boolean(empresa && sol);
  const [rows, setRows] = useState<Row[]>(BASE_ROWS);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadExistingMatrix() {
      if (!hasSelectedSolicitud) {
        if (mounted) {
          setRows(BASE_ROWS);
          setSubmitError(null);
        }
        return;
      }

      const { data, error } = await supabase
        .from("seguimiento_resultado")
        .select("id")
        .eq("id_empresa", empresa)
        .eq("numero_solicitud", sol)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setSubmitError(error.message || "No se pudo cargar la matriz guardada.");
        setRows(BASE_ROWS);
        return;
      }

      if (!data?.id) {
        setRows(BASE_ROWS);
        return;
      }

      const detalleResult = await supabase
        .from("seguimiento_etapa")
        .select("etapa, accion, kpi, resultado, cumplimiento")
        .eq("id_resultado", data.id)
        .order("created_at", { ascending: true });

      if (!mounted) return;

      if (detalleResult.error) {
        setSubmitError(detalleResult.error.message || "No se pudo cargar el detalle de la matriz.");
        setRows(BASE_ROWS);
        return;
      }

      const detalleRows = (detalleResult.data ?? []) as Array<{
        etapa: string;
        accion: string;
        kpi: string;
        resultado: string | null;
        cumplimiento: number | null;
      }>;

      if (!detalleRows.length) {
        setRows(BASE_ROWS);
        return;
      }

      const hydratedRows = BASE_ROWS.map((baseRow) => {
        const found = detalleRows.find(
          (item) => item.etapa === baseRow.etapa && item.accion === baseRow.accion && item.kpi === baseRow.kpi,
        );

        if (!found) return baseRow;

        return {
          ...baseRow,
          resultado: found.resultado ?? "",
          cumplimiento: found.cumplimiento ?? 0,
        };
      });

      setRows(hydratedRows);
    }

    loadExistingMatrix().catch(() => {
      if (!mounted) return;
      setSubmitError("No se pudo cargar la matriz guardada.");
      setRows(BASE_ROWS);
    });

    return () => {
      mounted = false;
    };
  }, [empresa, hasSelectedSolicitud, sol, supabase]);

  const promedioCumplimiento = useMemo(() => {
    const total = rows.reduce((acc, row) => acc + row.cumplimiento, 0);
    return rows.length ? total / rows.length : 0;
  }, [rows]);

  const nivelCumplimiento = nivelPorPromedio(promedioCumplimiento);
  const interpretacion = interpretacionPorNivel(nivelCumplimiento);

  function updateResultado(index: number, value: string, mode: "text" | "percent" | "number") {
    const safeValue = clampResultadoByMode(value, mode);
    setRows((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, resultado: safeValue } : row)));
  }

  function updateCumplimiento(index: number, value: string) {
    const parsed = Number(value);
    const safeValue = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(5, parsed));
    setRows((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, cumplimiento: safeValue } : row)));
  }

  async function handleSaveAndFinish() {
    if (!hasSelectedSolicitud) return;
    setSubmitError(null);

    const hasIncompleteRows = rows.some(
      (row) => String(row.resultado ?? "").trim().length === 0 || Number(row.cumplimiento ?? 0) <= 0,
    );

    if (hasIncompleteRows) {
      setSubmitError("Para finalizar, debés completar todas las etapas: resultado y cumplimiento mayor a 0.");
      return;
    }

    setIsSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        setSubmitError("Debes iniciar sesión para guardar la matriz de seguimiento.");
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from("seguimiento_resultado")
        .select("id")
        .eq("id_empresa", empresa)
        .eq("numero_solicitud", sol)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingError) {
        setSubmitError(existingError.message || "No se pudo consultar la matriz de seguimiento.");
        return;
      }

      let matrizId = existing?.id ?? null;

      if (!matrizId) {
        const { data: created, error: createError } = await supabase
          .from("seguimiento_resultado")
          .insert({
            id_empresa: empresa,
            numero_solicitud: sol,
            promedio_cumplimiento: Number(promedioCumplimiento.toFixed(2)),
            nivel_cumplimiento: nivelCumplimiento,
            interpretacion: interpretacion,
            creado_por: user.id,
          })
          .select("id")
          .single();

        if (createError || !created?.id) {
          setSubmitError(createError?.message || "No se pudo crear la matriz de seguimiento.");
          return;
        }

        matrizId = created.id;
      }

      const { error: updateError } = await supabase
        .from("seguimiento_resultado")
        .update({
          promedio_cumplimiento: Number(promedioCumplimiento.toFixed(2)),
          nivel_cumplimiento: nivelCumplimiento,
          interpretacion: interpretacion,
        })
        .eq("id", matrizId);

      if (updateError) {
        setSubmitError(updateError.message || "No se pudo actualizar la matriz de seguimiento.");
        return;
      }

      const { error: deleteError } = await supabase.from("seguimiento_etapa").delete().eq("id_resultado", matrizId);

      if (deleteError) {
        setSubmitError(deleteError.message || "No se pudo limpiar el detalle previo de la matriz.");
        return;
      }

      const { error: insertDetailError } = await supabase.from("seguimiento_etapa").insert(
        rows.map((row) => ({
          id_resultado: matrizId,
          etapa: row.etapa,
          accion: row.accion,
          kpi: row.kpi,
          resultado: row.resultado || null,
          cumplimiento: row.cumplimiento,
        })),
      );

      if (insertDetailError) {
        setSubmitError(insertDetailError.message || "No se pudo guardar el detalle de la matriz.");
        return;
      }

      const { data: persistedRows, error: persistedRowsError } = await supabase
        .from("seguimiento_etapa")
        .select("cumplimiento")
        .eq("id_resultado", matrizId);

      if (persistedRowsError) {
        setSubmitError(persistedRowsError.message || "No se pudo recalcular la matriz de seguimiento.");
        return;
      }

      const persistedAvg = (persistedRows ?? []).length
        ? (persistedRows ?? []).reduce((acc, row) => acc + Number(row.cumplimiento ?? 0), 0) / (persistedRows ?? []).length
        : 0;
      const persistedLevel = nivelPorPromedio(persistedAvg);
      const persistedInterpretation = interpretacionPorNivel(persistedLevel);

      const { error: syncParentError } = await supabase
        .from("seguimiento_resultado")
        .update({
          promedio_cumplimiento: Number(persistedAvg.toFixed(2)),
          nivel_cumplimiento: persistedLevel,
          interpretacion: persistedInterpretation,
        })
        .eq("id", matrizId);

      if (syncParentError) {
        setSubmitError(syncParentError.message || "No se pudo sincronizar el resumen de la matriz.");
        return;
      }

    router.push(`${APP_ROUTES.analisis}?empresa=${encodeURIComponent(empresa)}&sol=${encodeURIComponent(sol)}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DashboardShell title="Matriz de Seguimiento" stepLabel="Paso 5 de 5" progressLabel="100% Completado">
      <section className="mx-auto w-full max-w-[1700px] space-y-6">
        <SolicitudSelector paso={5} />
        {!hasSelectedSolicitud ? (
          <article className="rounded-2xl border border-dashed border-[var(--outline)]/40 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Selecciona una solicitud para habilitar la matriz de seguimiento.
          </article>
        ) : null}

        {hasSelectedSolicitud ? (
          <>
        <article className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Objetivo</h2>
          <p className="mt-3 rounded-xl bg-[var(--surface-subtle)] p-4 text-sm leading-relaxed text-slate-700">
            Registrar, monitorear y evaluar el nivel de cumplimiento de las acciones implementadas en cada etapa de la hoja de ruta de economia circular, facilitando el seguimiento de avances, resultados obtenidos y oportunidades de fortalecimiento dentro de las empresas lideradas por mujeres del sector textil.
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
          <div className="overflow-x-auto rounded-xl border border-[var(--outline)]/30">
            <table className="w-full min-w-[1200px] table-auto">
              <thead className="bg-[var(--surface-subtle)]">
                <tr>
                  <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Etapa</th>
                  <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Accion implementada</th>
                  <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-700">KPI evaluado</th>
                  <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Resultado obtenido</th>
                  <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Cumplimiento (1-5)</th>
                  <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Estado</th>
                </tr>
              </thead>
              <tbody>
              {rows.map((row, index) => (
                <tr key={row.etapa} className="bg-white align-top">
                  {(() => {
                    const mode = kpiResultadoMode(row.kpi);
                    return (
                      <>
                  <td className="border-b border-[var(--outline)]/20 px-3 py-3 text-sm break-words whitespace-normal text-slate-800">{row.etapa}</td>
                  <td className="border-b border-[var(--outline)]/20 px-3 py-3 text-sm break-words whitespace-normal text-slate-700">{row.accion}</td>
                  <td className="border-b border-[var(--outline)]/20 px-3 py-3 text-sm break-words whitespace-normal text-slate-700">{row.kpi}</td>
                  <td className="border-b border-[var(--outline)]/20 px-3 py-2">
                    {mode === "text" ? (
                      <input
                        value={row.resultado}
                        onChange={(event) => updateResultado(index, event.target.value, mode)}
                        className="h-10 w-full rounded-lg border border-[var(--outline)] bg-white px-3 text-sm text-slate-800 outline-none focus:border-[var(--primary)]"
                        placeholder="Ingresa resultado"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={mode === "percent" ? 0.1 : 1}
                          max={mode === "percent" ? 100 : undefined}
                          value={row.resultado}
                          onChange={(event) => updateResultado(index, event.target.value, mode)}
                          className="h-10 w-full rounded-lg border border-[var(--outline)] bg-white px-3 text-sm text-slate-800 outline-none focus:border-[var(--primary)]"
                          placeholder={mode === "percent" ? "0 - 100" : "Ingresa valor"}
                        />
                        {mode === "percent" ? (
                          <span className="text-sm font-semibold text-slate-500">%</span>
                        ) : null}
                      </div>
                    )}
                  </td>
                  <td className="border-b border-[var(--outline)]/20 px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={row.cumplimiento || ""}
                      onChange={(event) => updateCumplimiento(index, event.target.value)}
                      className="h-10 w-full rounded-lg border border-[var(--outline)] bg-white px-3 text-sm text-slate-800 outline-none focus:border-[var(--primary)]"
                      placeholder="1 - 5"
                    />
                  </td>
                  <td className="border-b border-[var(--outline)]/20 px-3 py-3 text-sm font-semibold text-slate-800">{estadoPorCumplimiento(row.cumplimiento)}</td>
                      </>
                    );
                  })()}
                </tr>
              ))}
              <tr className="bg-[var(--surface-subtle)]">
                <td className="border-b border-[var(--outline)]/30 px-3 py-3 text-sm font-semibold text-slate-800" colSpan={4}>
                  Promedio final
                </td>
                <td className="border-b border-[var(--outline)]/30 px-3 py-3 text-sm font-bold text-slate-900">{promedioCumplimiento.toFixed(2)}</td>
                <td className="border-b border-[var(--outline)]/30 px-3 py-3 text-sm font-bold text-[var(--primary)]">{nivelCumplimiento}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <div className={`rounded-xl border px-4 py-3 ${nivelTone(nivelCumplimiento)}`}>
            <p className="text-sm font-semibold text-slate-800">Nivel de cumplimiento</p>
            <p className="mt-1 text-base font-bold">{nivelCumplimiento}</p>
            </div>
            <div className={`rounded-xl border px-5 py-4 text-center text-base leading-relaxed md:text-lg ${nivelTone(nivelCumplimiento)}`}>
              {interpretacion}
            </div>
          </div>
        </article>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveAndFinish}
            disabled={isSaving}
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Guardar y finalizar"}
          </button>
        </div>
        {submitError ? <p className="text-sm font-medium text-red-600">{submitError}</p> : null}
          </>
        ) : null}
      </section>
    </DashboardShell>
  );
}

export default function MatrizSeguimientoPage() {
  return (
    <Suspense fallback={<section className="mx-auto w-full max-w-6xl p-6 text-sm text-slate-600">Cargando matriz de seguimiento...</section>}>
      <MatrizSeguimientoContent />
    </Suspense>
  );
}
