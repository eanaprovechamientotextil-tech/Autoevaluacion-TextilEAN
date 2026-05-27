"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { APP_ROUTES } from "@/src/constants/routes";

export type HistorialRow = {
  id: string;
  numero_solicitud: string;
  nombre_empresa: string;
  created_at: string | null;
  isComplete: boolean;
  nextRoute: string;
  progressLabel: string;
};

type Props = {
  rows: HistorialRow[];
  copy: {
    requestNumber: string;
    clientName: string;
    status: string;
    updatedAt: string;
    actions: string;
    statusComplete: string;
    statusInProgress: string;
    viewAnalysisButton: string;
    continueButton: string;
    compareButton: string;
    compareTooltip: string;
  };
};

function normalizeCompanyName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleUpperCase("es-CO");
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function HistorialCompareTable({ rows, copy }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Map<string, HistorialRow>>(new Map());

  function toggleRow(row: HistorialRow) {
    setSelected((prev) => {
      const next = new Map(prev);
      const key = `${row.id}::${row.numero_solicitud}`;

      if (next.has(key)) {
        next.delete(key);
        return next;
      }

      if (next.size >= 2) return prev;

      if (next.size === 1) {
        const firstEntry = next.values().next().value;
        if (firstEntry && normalizeCompanyName(firstEntry.nombre_empresa) !== normalizeCompanyName(row.nombre_empresa)) {
          return prev;
        }
      }

      next.set(key, row);
      return next;
    });
  }

  const selectedArray = Array.from(selected.values());
  const canCompare = selectedArray.length === 2;

  function handleCompare() {
    if (!canCompare) return;
    const [a, b] = selectedArray;
    const url = `${APP_ROUTES.analisisComparar}?empresaA=${encodeURIComponent(a.id)}&solA=${encodeURIComponent(a.numero_solicitud)}&empresaB=${encodeURIComponent(b.id)}&solB=${encodeURIComponent(b.numero_solicitud)}`;
    router.push(url);
  }

  function isRowSelectable(row: HistorialRow) {
    if (!row.isComplete) return false;
    if (selected.size === 0) return true;
    const firstEntry = selected.values().next().value;
    if (!firstEntry) return true;
    return normalizeCompanyName(firstEntry.nombre_empresa) === normalizeCompanyName(row.nombre_empresa);
  }

  function isRowSelected(row: HistorialRow) {
    return selected.has(`${row.id}::${row.numero_solicitud}`);
  }

  const blockedByDifferentCompany =
    selected.size === 1 &&
    rows.some(
      (r) =>
        r.isComplete &&
        !isRowSelected(r) &&
        normalizeCompanyName(r.nombre_empresa) !== normalizeCompanyName(selectedArray[0]?.nombre_empresa ?? ""),
    );

  return (
    <div>
      {blockedByDifferentCompany && (
        <p className="mb-3 rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
          Solo podés comparar solicitudes de la misma empresa. Desmarcá la selección actual para elegir otra empresa.
        </p>
      )}

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Seleccioná 2 solicitudes completadas de la misma empresa para comparar.
        </p>
        <button
          type="button"
          onClick={handleCompare}
          disabled={!canCompare}
          className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
            canCompare
              ? "bg-[var(--primary)] text-white hover:brightness-110"
              : "cursor-not-allowed bg-slate-200 text-slate-500"
          }`}
          title={canCompare ? "" : copy.compareTooltip}
        >
          {copy.compareButton} ({selected.size}/2)
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead className="bg-[var(--surface-subtle)]">
            <tr>
              <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600 w-10">
                <span className="sr-only">Seleccionar</span>
              </th>
              <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                {copy.requestNumber}
              </th>
              <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                {copy.clientName}
              </th>
              <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                {copy.status}
              </th>
              <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                {copy.updatedAt}
              </th>
              <th className="border-b border-[var(--outline)]/40 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                {copy.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const selectable = isRowSelectable(row);
              const selected = isRowSelected(row);

              return (
                <tr
                  key={`${row.id}-${row.numero_solicitud}`}
                  className={`${selected ? "bg-sky-50" : ""} ${row.isComplete && !selectable && !selected ? "opacity-50" : ""}`}
                >
                  <td className="border-b border-[var(--outline)]/20 px-3 py-3">
                    {row.isComplete ? (
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleRow(row)}
                        disabled={!selectable && !selected}
                        className="h-4 w-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                    ) : null}
                  </td>
                  <td className="border-b border-[var(--outline)]/20 px-3 py-3 text-sm font-medium text-slate-700">
                    {row.numero_solicitud}
                  </td>
                  <td className="border-b border-[var(--outline)]/20 px-3 py-3 text-sm text-slate-700">
                    {row.nombre_empresa}
                  </td>
                  <td className="border-b border-[var(--outline)]/20 px-3 py-3 text-sm text-slate-700">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        row.isComplete
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {row.isComplete ? copy.statusComplete : copy.statusInProgress}
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
                        {copy.viewAnalysisButton}
                      </Link>
                    ) : (
                      <Link
                        href={`${row.nextRoute}?empresa=${encodeURIComponent(row.id)}&sol=${encodeURIComponent(row.numero_solicitud)}`}
                        className="inline-flex rounded-xl bg-[var(--primary)] px-3 py-1.5 font-semibold text-white hover:opacity-90"
                      >
                        {copy.continueButton}
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
