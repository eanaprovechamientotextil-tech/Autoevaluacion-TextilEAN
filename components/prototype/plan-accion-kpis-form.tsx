"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PLAN_ACCION_KPIS_COPY } from "@/src/constants/copy";
import { usePlanAccionKpisForm } from "@/src/hooks/usePlanAccionKpisForm";
import { SolicitudSelector } from "@/components/prototype/solicitud-selector";

export function PlanAccionKpisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSolicitudKey = `${searchParams.get("empresa") ?? ""}::${searchParams.get("sol") ?? ""}`;
  const hasSelectedSolicitud = Boolean(searchParams.get("empresa") && searchParams.get("sol"));
  const form = usePlanAccionKpisForm(searchParams, (path) => router.push(path));

  useEffect(() => {
    form.load().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSolicitudKey]);

  useEffect(() => {
    const textareas = document.querySelectorAll<HTMLTextAreaElement>("textarea[data-autogrow='true']");
    textareas.forEach((textarea) => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [form.actionRows]);

  const tableHeadClasses =
    "border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600";
  const tableCellClasses = "border-b border-[var(--outline)]/20 px-3 py-3 align-top text-sm text-slate-700";
  const autoResizeTextarea = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };
  const normalizeIndicator = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const isReadonlyActualIndicator = (indicator: string) => {
    const normalized = normalizeIndicator(indicator);
    return (
      normalized.includes("% residuos textiles aprovechados") ||
      normalized.includes("kg residuos recuperados/mes") ||
      normalized.includes("acciones cerradas de la hoja de ruta")
    );
  };

  const estadoGeneralTone = (label: string) => {
    const normalized = label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (normalized.startsWith("en control")) return "bg-emerald-50 text-emerald-700";
    if (normalized.startsWith("en seguimiento")) return "bg-amber-50 text-amber-700";
    if (normalized.startsWith("critico")) return "bg-red-50 text-red-700";
    return "bg-slate-100 text-slate-600";
  };

  const cumplimientoTone = (value: number | null) => {
    if (value === null) {
      return {
        dot: "bg-slate-300",
        text: "text-slate-500",
        chip: "bg-slate-100",
      };
    }
    if (value >= 80) {
      return {
        dot: "bg-emerald-500",
        text: "text-emerald-700",
        chip: "bg-emerald-50",
      };
    }
    if (value >= 50) {
      return {
        dot: "bg-amber-500",
        text: "text-amber-700",
        chip: "bg-amber-50",
      };
    }
    return {
      dot: "bg-red-500",
      text: "text-red-700",
      chip: "bg-red-50",
    };
  };

  return (
    <section className="space-y-6">
      <SolicitudSelector paso={4} />
      {!hasSelectedSolicitud ? (
        <article className="rounded-2xl border border-dashed border-[var(--outline)]/40 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Selecciona una solicitud para habilitar el formulario de plan de accion y KPIs.
        </article>
      ) : null}
      {hasSelectedSolicitud ? (
        <>
      <article className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">{PLAN_ACCION_KPIS_COPY.objective}</h2>
      </article>

      {form.isLoading ? (
        <article className="rounded-2xl border border-[var(--outline)]/30 bg-white p-4 text-sm text-slate-600 shadow-sm">
          Cargando datos guardados...
        </article>
      ) : null}

      {form.prerequisiteError ? (
        <article className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-800 shadow-sm">
          {form.prerequisiteError}
        </article>
      ) : null}

      <article className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">{PLAN_ACCION_KPIS_COPY.actionsTitle}</h3>
          <button type="button" onClick={form.addActionRow} className="font-semibold text-[var(--primary)]">
            {PLAN_ACCION_KPIS_COPY.actions.addRow}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1620px] w-full table-auto">
            <thead className="bg-[var(--surface-subtle)]">
              <tr>
                <th className={`${tableHeadClasses} w-[16%]`}>{PLAN_ACCION_KPIS_COPY.headers.fase}</th>
                <th className={`${tableHeadClasses} w-[22%]`}>{PLAN_ACCION_KPIS_COPY.headers.accion}</th>
                <th className={`${tableHeadClasses} w-[13%]`}>{PLAN_ACCION_KPIS_COPY.headers.responsable}</th>
                <th className={`${tableHeadClasses} w-[8%]`}>{PLAN_ACCION_KPIS_COPY.headers.fechaInicio}</th>
                <th className={`${tableHeadClasses} w-[8%]`}>{PLAN_ACCION_KPIS_COPY.headers.fechaFin}</th>
                <th className={tableHeadClasses}>{PLAN_ACCION_KPIS_COPY.headers.impacto}</th>
                <th className={tableHeadClasses}>{PLAN_ACCION_KPIS_COPY.headers.esfuerzo}</th>
                <th className={tableHeadClasses}>{PLAN_ACCION_KPIS_COPY.headers.indicePrioridad}</th>
                <th className={tableHeadClasses}>{PLAN_ACCION_KPIS_COPY.headers.prioridad}</th>
                <th className={`${tableHeadClasses} w-[10%]`}>{PLAN_ACCION_KPIS_COPY.headers.estado}</th>
                <th className={`${tableHeadClasses} w-[4%]`}>{PLAN_ACCION_KPIS_COPY.headers.acciones}</th>
              </tr>
            </thead>
            <tbody>
              {form.actionRows.map((row, index) => {
                const indice = form.priorityIndex(row.impacto, row.esfuerzo);
                return (
                  <tr key={`action-row-${index}`}>
                    <td className={tableCellClasses}>
                      <textarea
                        data-autogrow="true"
                        value={row.fase}
                        onChange={(e) => form.updateActionRow(index, { fase: e.target.value })}
                        onInput={(e) => autoResizeTextarea(e.currentTarget)}
                        rows={2}
                        className="w-full resize-none overflow-hidden rounded-lg border border-[var(--outline)] bg-white px-3 py-2 leading-snug"
                      />
                    </td>
                    <td className={tableCellClasses}>
                      <textarea
                        data-autogrow="true"
                        value={row.accion}
                        onChange={(e) => form.updateActionRow(index, { accion: e.target.value })}
                        onInput={(e) => autoResizeTextarea(e.currentTarget)}
                        rows={3}
                        className="w-full resize-none overflow-hidden rounded-lg border border-[var(--outline)] bg-white px-3 py-2 leading-snug"
                      />
                    </td>
                    <td className={tableCellClasses}>
                      <input
                        value={row.responsable}
                        onChange={(e) => form.updateActionRow(index, { responsable: e.target.value })}
                        className="h-10 w-full rounded-lg border border-[var(--outline)] bg-white px-3"
                      />
                    </td>
                    <td className={tableCellClasses}>
                      <input
                        type="date"
                        value={row.fecha_inicio}
                        onChange={(e) => form.updateActionRow(index, { fecha_inicio: e.target.value })}
                        className="h-10 w-full rounded-lg border border-[var(--outline)] bg-white px-3"
                      />
                    </td>
                    <td className={tableCellClasses}>
                      <input
                        type="date"
                        value={row.fecha_fin}
                        onChange={(e) => form.updateActionRow(index, { fecha_fin: e.target.value })}
                        className="h-10 w-full rounded-lg border border-[var(--outline)] bg-white px-3"
                      />
                    </td>
                    <td className={tableCellClasses}>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={row.impacto}
                        onFocus={(e) => {
                          if (row.impacto === 0 || row.impacto === "") {
                            e.currentTarget.select();
                          }
                        }}
                        onChange={(e) =>
                          form.updateActionRow(index, {
                            impacto: e.target.value === "" ? "" : form.clamp1to5(Number(e.target.value) || 1),
                          })
                        }
                        className="h-10 w-full rounded-lg border border-[var(--outline)] bg-slate-100 px-3"
                      />
                    </td>
                    <td className={tableCellClasses}>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={row.esfuerzo}
                        onFocus={(e) => {
                          if (row.esfuerzo === 0 || row.esfuerzo === "") {
                            e.currentTarget.select();
                          }
                        }}
                        onChange={(e) =>
                          form.updateActionRow(index, {
                            esfuerzo: e.target.value === "" ? "" : form.clamp1to5(Number(e.target.value) || 1),
                          })
                        }
                        className="h-10 w-full rounded-lg border border-[var(--outline)] bg-slate-100 px-3"
                      />
                    </td>
                    <td className={`${tableCellClasses} font-semibold bg-slate-100`}>{indice === "" ? "" : indice.toFixed(2)}</td>
                    <td className={`${tableCellClasses} font-semibold bg-slate-100`}>{form.priorityLabel(indice)}</td>
                    <td className={tableCellClasses}>
                      <select
                        value={row.estado}
                        onChange={(e) => form.updateActionRow(index, { estado: e.target.value })}
                        className="h-10 w-full min-w-[140px] rounded-lg border border-[var(--outline)] bg-white px-3"
                      >
                        {PLAN_ACCION_KPIS_COPY.estados.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={`${tableCellClasses} text-center`}>
                      {row.locked ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => form.removeActionRow(index)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-base font-bold text-red-600 hover:bg-red-50"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>

      <article className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
          <div>
            <h3 className="mb-4 text-lg font-bold text-slate-900">{PLAN_ACCION_KPIS_COPY.kpisTitle}</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-[var(--surface-subtle)]">
                  <tr>
                    <th className={tableHeadClasses}>{PLAN_ACCION_KPIS_COPY.headers.indicador}</th>
                    <th className={tableHeadClasses}>{PLAN_ACCION_KPIS_COPY.headers.actual}</th>
                    <th className={tableHeadClasses}>{PLAN_ACCION_KPIS_COPY.headers.meta}</th>
                    <th className={tableHeadClasses}>{PLAN_ACCION_KPIS_COPY.headers.cumplimiento}</th>
                  </tr>
                </thead>
                <tbody>
                  {form.kpiRows.map((row, index) => {
                    const value = form.cumplimiento(row.actual, row.meta);
                    const isActualReadonly = isReadonlyActualIndicator(row.indicador);
                    const editableInputClasses =
                      "h-10 w-full rounded-lg border border-[var(--outline)] bg-white px-3";
                    const tone = cumplimientoTone(value);
                    return (
                      <tr key={`${row.indicador}-${index}`}>
                        <td className={tableCellClasses}>{row.indicador}</td>
                        <td className={tableCellClasses}>
                          <input
                            type="number"
                            value={row.actual}
                            onChange={(e) => form.updateKpiRow(index, { actual: Number(e.target.value) || 0 })}
                            onFocus={(e) => {
                              if (!isActualReadonly && row.actual === 0) {
                                e.currentTarget.select();
                              }
                            }}
                            disabled={isActualReadonly}
                            className={`${editableInputClasses} disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600`}
                          />
                        </td>
                        <td className={tableCellClasses}>
                          <input
                            type="number"
                            value={row.meta}
                            onChange={(e) => form.updateKpiRow(index, { meta: Number(e.target.value) || 0 })}
                            onFocus={(e) => {
                              if (row.meta === 0) {
                                e.currentTarget.select();
                              }
                            }}
                            className={editableInputClasses}
                          />
                        </td>
                        <td className={tableCellClasses}>
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ${tone.chip} ${tone.text}`}
                          >
                            <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                            {value === null ? "" : `${value.toFixed(0)}%`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-slate-900">{PLAN_ACCION_KPIS_COPY.summaryTitle}</h3>
            <table className="w-full table-auto border border-[var(--outline)]/40">
              <tbody>
                <tr>
                  <td className={tableCellClasses}>{PLAN_ACCION_KPIS_COPY.summary.altaPrioridad}</td>
                  <td className={`${tableCellClasses} text-right font-semibold`}>{form.resumen.altas}</td>
                </tr>
                <tr>
                  <td className={tableCellClasses}>{PLAN_ACCION_KPIS_COPY.summary.cerradas}</td>
                  <td className={`${tableCellClasses} text-right font-semibold`}>{form.resumen.cerradas}</td>
                </tr>
                <tr>
                  <td className={tableCellClasses}>{PLAN_ACCION_KPIS_COPY.summary.riesgo}</td>
                  <td className={`${tableCellClasses} text-right font-semibold`}>{form.resumen.riesgo}</td>
                </tr>
                <tr>
                  <td className={tableCellClasses}>{PLAN_ACCION_KPIS_COPY.summary.promedioKpi}</td>
                  <td className={`${tableCellClasses} text-right font-semibold`}>{form.resumen.promedioKpi === null ? "" : `${form.resumen.promedioKpi.toFixed(0)}%`}</td>
                </tr>
                <tr>
                  <td className={tableCellClasses}>{PLAN_ACCION_KPIS_COPY.summary.estadoGeneral}</td>
                  <td className={`${tableCellClasses} text-right font-semibold`}>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${estadoGeneralTone(form.resumen.estadoGeneral)}`}>
                      {form.resumen.estadoGeneral}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </article>

      {form.submitError ? <p className="text-sm font-medium text-red-600">{form.submitError}</p> : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={form.saveAndContinue}
          disabled={form.isSubmitting || Boolean(form.prerequisiteError)}
          className="rounded-xl bg-[var(--primary)] px-5 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {form.isSubmitting ? PLAN_ACCION_KPIS_COPY.submit.saving : PLAN_ACCION_KPIS_COPY.actions.saveContinue}
        </button>
      </div>
        </>
      ) : null}
    </section>
  );
}
