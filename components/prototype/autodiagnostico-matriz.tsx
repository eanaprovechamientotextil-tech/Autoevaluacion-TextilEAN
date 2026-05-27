"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AUTODIAGNOSTICO_COPY } from "@/src/constants/copy";
import { SCORE_OPTIONS } from "@/src/domain/autodiagnostico";
import { useAutodiagnosticoForm } from "@/src/hooks/useAutodiagnosticoForm";
import { SolicitudSelector } from "@/components/prototype/solicitud-selector";

export function AutodiagnosticoMatriz() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasSelectedSolicitud = Boolean(searchParams.get("empresa") && searchParams.get("sol"));
  const form = useAutodiagnosticoForm(searchParams, (path) => router.push(path));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { form.load().catch(() => undefined); }, []);
  const tableHeadClasses = "border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600";
  const tableCellClasses = "border-b border-[var(--outline)]/20 px-3 py-3 align-top text-sm text-slate-700";
  const scoreTone = (score: number) => {
    if (score <= 2) return "bg-red-50 text-red-700 border-red-200";
    if (score === 3) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };
  const weightedTone = (value: number) => {
    if (value < 3) return "bg-red-50 text-red-700 border-red-200";
    if (value <= 4.5) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };
  return <section className="space-y-6">{/* UI kept */}
    <SolicitudSelector paso={2} />
    {!hasSelectedSolicitud ? (
      <article className="rounded-2xl border border-dashed border-[var(--outline)]/40 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Selecciona una solicitud para habilitar el formulario de autodiagnostico.
      </article>
    ) : null}
    {hasSelectedSolicitud ? (
      <>
    <article className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-slate-900">{AUTODIAGNOSTICO_COPY.objective}</h2><p className="mt-2 text-slate-600">{AUTODIAGNOSTICO_COPY.instructions}</p><p className="mt-2 text-sm text-slate-500">{AUTODIAGNOSTICO_COPY.weightRule}</p></article>
    {form.isLoading ? <p className="text-sm text-slate-500">Cargando datos guardados...</p> : null}
    <article className="rounded-2xl border border-[var(--outline)]/30 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`text-sm font-semibold ${form.isWeightTotalValid ? "text-emerald-700" : "text-red-600"}`}>
          {AUTODIAGNOSTICO_COPY.weightValidation.totalLabel}: {form.totalWeight}%
        </p>
        {!form.isWeightTotalValid ? <p className="text-sm text-red-600">{AUTODIAGNOSTICO_COPY.weightValidation.invalid}</p> : null}
      </div>
    </article>
    <article className="rounded-2xl border border-[var(--outline)]/30 bg-white shadow-sm"><table className="w-full table-fixed"><thead className="bg-[var(--surface-subtle)]"><tr><th className={tableHeadClasses}>{AUTODIAGNOSTICO_COPY.headers.dimension}</th><th className={tableHeadClasses}>{AUTODIAGNOSTICO_COPY.headers.criteria}</th><th className={tableHeadClasses}>{AUTODIAGNOSTICO_COPY.headers.weight}</th><th className={tableHeadClasses}>{AUTODIAGNOSTICO_COPY.headers.score}</th><th className={tableHeadClasses}>{AUTODIAGNOSTICO_COPY.headers.weightedResult}</th><th className={tableHeadClasses}>{AUTODIAGNOSTICO_COPY.headers.gap}</th><th className={tableHeadClasses}>{AUTODIAGNOSTICO_COPY.headers.level}</th><th className={tableHeadClasses}>{AUTODIAGNOSTICO_COPY.headers.recommendation}</th></tr></thead><tbody>{form.computedRows.map((row) => <tr key={row.key}><td className={`${tableCellClasses} font-semibold`}>{row.name}</td><td className={tableCellClasses}>{row.criteria}</td><td className={tableCellClasses}><input type="number" min={0} max={100} value={row.weight} onFocus={(event) => { if (row.weight === 0) event.currentTarget.select(); }} onChange={(event) => form.setWeights((prev) => ({ ...prev, [row.key]: Math.max(0, Math.min(100, Math.trunc(Number(event.target.value) || 0))) }))} className="h-9 w-14 rounded-lg border border-[var(--outline)] bg-white px-2 text-sm font-semibold" /></td><td className={tableCellClasses}><select className={`h-9 w-14 rounded-lg border px-2 text-sm font-semibold ${scoreTone(row.score)}`} value={row.score} onChange={(event) => form.setScores((prev) => ({ ...prev, [row.key]: Number(event.target.value) }))}>{SCORE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></td><td className={`${tableCellClasses} font-semibold`}>{row.weightedResult.toFixed(2)}</td><td className={tableCellClasses}>{row.gap}</td><td className={tableCellClasses}>{row.level}</td><td className={tableCellClasses}>{row.recommendation}</td></tr>)}</tbody></table></article>
    <article className="grid gap-4 rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm md:grid-cols-2">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{AUTODIAGNOSTICO_COPY.summary.totalWeighted}</p>
        <p className="mt-1"><span className={`inline-flex rounded-full border px-3 py-1 text-xl font-bold ${weightedTone(form.totalWeightedResult)}`}>{form.totalWeightedResult.toFixed(2)}</span></p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{AUTODIAGNOSTICO_COPY.summary.maturityPercent}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{form.maturityPercent.toFixed(2)}%</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{AUTODIAGNOSTICO_COPY.summary.maturityLevel}</p>
        <p className="mt-1 text-lg font-semibold text-slate-800">{form.globalLevel}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{AUTODIAGNOSTICO_COPY.summary.weakestDimension}</p>
        <p className="mt-1 text-lg font-semibold text-slate-800">{form.weakestDimension?.name ?? AUTODIAGNOSTICO_COPY.summary.noWeakDimension}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{AUTODIAGNOSTICO_COPY.summary.biggestGap}</p>
        <p className="mt-1 text-lg font-semibold text-slate-800">{form.largestGapDimension.toFixed(2)}</p>
      </div>
      <div className="md:col-span-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{AUTODIAGNOSTICO_COPY.summary.conclusion}</p>
        <p className={`mt-1 rounded-xl border px-4 py-3 text-sm font-medium ${weightedTone(form.totalWeightedResult)}`}>{form.conclusion}</p>
      </div>
    </article>
    {form.submitError ? <p className="text-sm font-medium text-red-600">{form.submitError}</p> : null}
    <div className="flex items-center justify-end gap-3"><button type="button" onClick={form.saveAndContinue} disabled={!form.isWeightTotalValid || form.isSubmitting} className="rounded-xl bg-[var(--primary)] px-5 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{form.isSubmitting ? AUTODIAGNOSTICO_COPY.submit.saving : AUTODIAGNOSTICO_COPY.actions.saveContinue}</button></div>
      </>
    ) : null}
  </section>;
}
