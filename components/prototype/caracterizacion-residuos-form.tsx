"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ETAPAS_GENERACION_OPTIONS,
  getMaterialesByEtapaTipo,
  getRangeNames,
  getTiposByEtapa,
} from "@/src/constants/caracterizacion-catalog";
import { CARACTERIZACION_COPY } from "@/src/constants/copy";
import { withComputedFields } from "@/src/domain/caracterizacion";
import { useCaracterizacionForm } from "@/src/hooks/useCaracterizacionForm";
import { SolicitudSelector } from "@/components/prototype/solicitud-selector";

export function CaracterizacionResiduosForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasSelectedSolicitud = Boolean(searchParams.get("empresa") && searchParams.get("sol"));
  const form = useCaracterizacionForm(searchParams, (path) => router.push(path));

  useEffect(() => {
    form.load().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateEtapa = (index: number, etapa: string) =>
    form.setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const allowedTipos = getTiposByEtapa(etapa);
        const nextTipo = allowedTipos.includes(row.tipo_residuo) ? row.tipo_residuo : "";
        const allowedMateriales = getMaterialesByEtapaTipo(etapa, nextTipo);
        const nextMaterial = allowedMateriales.includes(row.material) ? row.material : "";
        const ranges = getRangeNames(etapa, nextTipo);

        return withComputedFields({
          ...row,
          etapa_generacion: etapa,
          tipo_residuo: nextTipo,
          material: nextMaterial,
          nombre_rango_etapa: ranges.nombre_rango_etapa,
          nombre_rango_tipo: ranges.nombre_rango_tipo,
        });
      }),
    );

  const updateTipo = (index: number, tipo: string) =>
    form.setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const allowedMateriales = getMaterialesByEtapaTipo(row.etapa_generacion, tipo);
        const nextMaterial = allowedMateriales.includes(row.material) ? row.material : "";
        const ranges = getRangeNames(row.etapa_generacion, tipo);

        return withComputedFields({
          ...row,
          tipo_residuo: tipo,
          material: nextMaterial,
          nombre_rango_etapa: ranges.nombre_rango_etapa,
          nombre_rango_tipo: ranges.nombre_rango_tipo,
        });
      }),
    );

  const tableHeadClasses =
    "border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600";
  const tableCellClasses = "border-b border-[var(--outline)]/20 px-3 py-3 align-top text-sm text-slate-700";
  const winningStrategy = form.strategyTotals[0]?.[0] ?? "";

  const conclusionContent = (() => {
    if (!winningStrategy || !form.conclusion.includes(winningStrategy)) {
      return <>{form.conclusion}</>;
    }

    const [before, ...rest] = form.conclusion.split(winningStrategy);
    const after = rest.join(winningStrategy);

    return (
      <>
        {before}
        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">{winningStrategy}</span>
        {after}
      </>
    );
  })();

  return (
    <section className="space-y-6">
      <SolicitudSelector paso={3} />
      {!hasSelectedSolicitud ? (
        <article className="rounded-2xl border border-dashed border-[var(--outline)]/40 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Selecciona una solicitud para habilitar el formulario de caracterizacion de residuos.
        </article>
      ) : null}
      {hasSelectedSolicitud ? (
        <>
      <article className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{CARACTERIZACION_COPY.inventoryTitle}</h2>
            <p className="mt-2 text-slate-600">{CARACTERIZACION_COPY.instructions}</p>
          </div>
          <button
            type="button"
            onClick={form.addRow}
            className="rounded-lg border border-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary)]"
          >
            {CARACTERIZACION_COPY.addRow}
          </button>
        </div>

        {form.isLoading ? <p className="mb-4 text-sm text-slate-500">Cargando datos guardados...</p> : null}

        <div className="overflow-x-auto md:overflow-x-visible">
          <table className="w-full table-auto">
            <thead className="bg-[var(--surface-subtle)]">
              <tr>
                <th className={`${tableHeadClasses} w-[18%]`}>{CARACTERIZACION_COPY.headers.etapa_generacion}</th>
                <th className={`${tableHeadClasses} w-[16%]`}>{CARACTERIZACION_COPY.headers.tipo_residuo}</th>
                <th className={`${tableHeadClasses} w-[16%]`}>{CARACTERIZACION_COPY.headers.material}</th>
                <th className={`${tableHeadClasses} w-[12%]`}>{CARACTERIZACION_COPY.headers.cantidad_residuos_kg_mes}</th>
                <th className={`${tableHeadClasses} w-[12%]`}>{CARACTERIZACION_COPY.headers.cantidad_aprovechable_kg_mes}</th>
                <th className={`${tableHeadClasses} w-[8%]`}>{CARACTERIZACION_COPY.headers.porcentaje_aprovechable}</th>
                <th className={`${tableHeadClasses} w-[10%]`}>{CARACTERIZACION_COPY.headers.estrategia}</th>
                <th className={`${tableHeadClasses} w-[7%]`}>{CARACTERIZACION_COPY.headers.potencial}</th>
                {/* <th className={tableHeadClasses}>{CARACTERIZACION_COPY.headers.observaciones}</th> */}
                <th className={`${tableHeadClasses} w-[44px] text-center`}>{CARACTERIZACION_COPY.headers.acciones}</th>
              </tr>
            </thead>
            <tbody>
              {form.rows.map((row, index) => (
                <tr key={`${index}-${row.etapa_generacion}-${row.tipo_residuo}-${row.material}`}>
                  <td className={tableCellClasses}>
                    <select
                      value={row.etapa_generacion}
                      onChange={(event) => updateEtapa(index, event.target.value)}
                      className="h-9 w-full rounded-lg border border-[var(--outline)] bg-white px-2 text-sm leading-tight"
                    >
                      <option value="">{CARACTERIZACION_COPY.selects.etapaDefaultOption}</option>
                      {ETAPAS_GENERACION_OPTIONS.map((etapa) => (
                        <option key={etapa} value={etapa}>
                          {etapa}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={tableCellClasses}>
                    <select
                      value={row.tipo_residuo}
                      onChange={(event) => updateTipo(index, event.target.value)}
                      disabled={!row.etapa_generacion}
                      className="h-9 w-full rounded-lg border border-[var(--outline)] bg-white px-2 text-sm leading-tight disabled:opacity-60"
                    >
                      <option value="">{CARACTERIZACION_COPY.selects.tipoDefaultOption}</option>
                      {getTiposByEtapa(row.etapa_generacion).map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={tableCellClasses}>
                    <select
                      value={row.material}
                      onChange={(event) => form.updateRow(index, { material: event.target.value })}
                      disabled={!row.etapa_generacion || !row.tipo_residuo}
                      className="h-9 w-full rounded-lg border border-[var(--outline)] bg-white px-2 text-sm leading-tight disabled:opacity-60"
                    >
                      <option value="">{CARACTERIZACION_COPY.selects.materialDefaultOption}</option>
                      {getMaterialesByEtapaTipo(row.etapa_generacion, row.tipo_residuo).map((material) => (
                        <option key={material} value={material}>
                          {material}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={tableCellClasses}>
                    <input
                      type="number"
                      min={0}
                      value={row.cantidad_residuos_kg_mes}
                      onFocus={(event) => {
                        if (row.cantidad_residuos_kg_mes === 0) {
                          event.currentTarget.select();
                        }
                      }}
                      onChange={(event) =>
                        form.updateRow(index, {
                          cantidad_residuos_kg_mes: form.toNonNegativeNumber(event.target.value),
                        })
                      }
                      className="h-9 w-full rounded-lg border border-[var(--outline)] bg-white px-2 text-sm"
                    />
                  </td>
                  <td className={tableCellClasses}>
                    <input
                      type="number"
                      min={0}
                      value={row.cantidad_aprovechable_kg_mes}
                      onFocus={(event) => {
                        if (row.cantidad_aprovechable_kg_mes === 0) {
                          event.currentTarget.select();
                        }
                      }}
                      onChange={(event) =>
                        form.updateRow(index, {
                          cantidad_aprovechable_kg_mes: form.toNonNegativeNumber(event.target.value),
                        })
                      }
                      className="h-9 w-full rounded-lg border border-[var(--outline)] bg-white px-2 text-sm"
                    />
                  </td>
                  <td className={`${tableCellClasses} font-semibold`}>{form.rowPercentage(row).toFixed(2)}%</td>
                  <td className={tableCellClasses}>
                    <p className="whitespace-normal break-words text-sm leading-snug text-slate-700">
                      {row.estrategia || "—"}
                    </p>
                  </td>
                  <td className={tableCellClasses}>
                    <p className="whitespace-normal break-words text-sm leading-snug text-slate-700">
                      {row.potencial || "—"}
                    </p>
                  </td>
                  {/* <td className={tableCellClasses}>
                    <input
                      value={row.observaciones}
                      onChange={(event) => form.updateRow(index, { observaciones: event.target.value })}
                      className="h-10 w-full rounded-lg border border-[var(--outline)] bg-white px-3"
                      placeholder={CARACTERIZACION_COPY.fields.observacionesPlaceholder}
                    />
                  </td> */}
                  <td className={`${tableCellClasses} px-1 text-center`}>
                    <button
                      type="button"
                      onClick={() => form.removeRow(index)}
                      disabled={form.rows.length <= 1}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      aria-label={CARACTERIZACION_COPY.deleteRow}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="grid gap-4 rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {CARACTERIZACION_COPY.summary.totalResiduos}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{form.totalResiduos.toFixed(2)} kg/mes</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {CARACTERIZACION_COPY.summary.totalAprovechable}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{form.totalAprovechable.toFixed(2)} kg/mes</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {CARACTERIZACION_COPY.summary.totalPorcentaje}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{form.porcentajeTotal.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {CARACTERIZACION_COPY.summary.strategyTotals}
          </p>
          {form.strategyTotals.length ? (
            <ul className="mt-1 space-y-1 text-sm text-slate-700">
              {form.strategyTotals.map(([strategy, total]) => (
                <li key={strategy}>
                  {strategy}: {total.toFixed(2)} kg/mes
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-slate-500">{CARACTERIZACION_COPY.summary.noStrategyData}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {CARACTERIZACION_COPY.summary.automaticConclusion}
          </p>
          <p className="mt-1 text-slate-700">{conclusionContent}</p>
        </div>
      </article>

      {form.submitError ? <p className="text-sm font-medium text-red-600">{form.submitError}</p> : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={form.saveAndContinue}
          disabled={!form.hasMeaningfulRows || form.isSubmitting}
          className="rounded-xl bg-[var(--primary)] px-5 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {form.isSubmitting ? CARACTERIZACION_COPY.submit.saving : CARACTERIZACION_COPY.actions.saveContinue}
        </button>
      </div>
        </>
      ) : null}
    </section>
  );
}
