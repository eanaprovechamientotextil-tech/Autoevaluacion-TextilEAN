"use client";

import { APP_ROUTES } from "@/src/constants/routes";
import { CARACTERIZACION_COPY } from "@/src/constants/copy";
import { emptyCaracterizacionRow, rowPercentage, toNonNegativeNumber, withComputedFields } from "@/src/domain/caracterizacion";
import { getLatestCaracterizacionId, resolveSolicitudContext, supabase } from "@/src/repositories/solicitud-repository";
import { CaracterizacionRow } from "@/src/types/caracterizacion";
import { useMemo, useState } from "react";

export function useCaracterizacionForm(searchParams: URLSearchParams, push: (path: string) => void) {
  const [rows, setRows] = useState<CaracterizacionRow[]>([emptyCaracterizacionRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hydratedSearch, setHydratedSearch] = useState("");

  const totalResiduos = useMemo(() => rows.reduce((acc, row) => acc + row.cantidad_residuos_kg_mes, 0), [rows]);
  const totalAprovechable = useMemo(() => rows.reduce((acc, row) => acc + row.cantidad_aprovechable_kg_mes, 0), [rows]);
  const porcentajeTotal = useMemo(() => (totalResiduos <= 0 ? 0 : (totalAprovechable / totalResiduos) * 100), [totalAprovechable, totalResiduos]);
  const strategyTotals = useMemo(() => {
    const grouped = new Map<string, number>();
    rows.forEach((row) => {
      const key = row.estrategia.trim();
      if (!key) return;
      grouped.set(key, (grouped.get(key) ?? 0) + row.cantidad_residuos_kg_mes);
    });
    return Array.from(grouped.entries()).filter(([, total]) => total > 0).sort((a, b) => b[1] - a[1]);
  }, [rows]);
  const conclusion = useMemo(() => !strategyTotals.length ? CARACTERIZACION_COPY.summary.noStrategyData : `Conclusión: La estrategia prioritaria es ${strategyTotals[0][0]} donde se tiene un total de ${strategyTotals[0][1].toFixed(2)} kg/mes residuos mensuales`, [strategyTotals]);
  const hasMeaningfulRows = useMemo(() => rows.some((row) => Object.values(row).some((value) => typeof value === "number" ? value > 0 : String(value ?? "").trim())), [rows]);

  async function load() {
    const resolved = await resolveSolicitudContext(searchParams);
    setHydratedSearch(resolved.hydratedSearch);
    if (!resolved.context) return setIsLoading(false);
    const parentId = await getLatestCaracterizacionId(resolved.context.idEmpresa, resolved.context.numeroSolicitud);
    if (!parentId) return setIsLoading(false);
    const { data: details } = await supabase.from("caracterizacion_residuos_detalle").select("etapa_generacion, tipo_residuo, material, nombre_rango_etapa, nombre_rango_tipo, cantidad_residuos_kg_mes, cantidad_aprovechable_kg_mes, estrategia, potencial, observaciones").eq("id_caracterizacion", parentId);
    if (details?.length) {
      setRows(details.map((row) => withComputedFields({ etapa_generacion: row.etapa_generacion ?? "", tipo_residuo: row.tipo_residuo ?? "", material: row.material ?? "", nombre_rango_etapa: row.nombre_rango_etapa, nombre_rango_tipo: row.nombre_rango_tipo, cantidad_residuos_kg_mes: Number(row.cantidad_residuos_kg_mes ?? 0), cantidad_aprovechable_kg_mes: Number(row.cantidad_aprovechable_kg_mes ?? 0), estrategia: row.estrategia ?? "", potencial: row.potencial ?? "", observaciones: row.observaciones ?? "" })));
    }
    setIsLoading(false);
  }

  function updateRow(index: number, patch: Partial<CaracterizacionRow>) { setRows((prev) => prev.map((row, i) => i === index ? withComputedFields({ ...row, ...patch }) : row)); }
  function addRow() { setRows((prev) => [...prev, emptyCaracterizacionRow()]); }
  function removeRow(index: number) { setRows((prev) => prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)); }

  async function saveAndContinue() {
    setSubmitError(null);
    const detailRows = rows.filter((row) => Object.values(row).some((value) => typeof value === "number" ? value > 0 : String(value ?? "").trim()));
    if (!detailRows.length) return setSubmitError(CARACTERIZACION_COPY.submit.saveError);
    setIsSubmitting(true);
    try {
      const resolved = await resolveSolicitudContext(searchParams);
      setHydratedSearch(resolved.hydratedSearch);
      if (!resolved.context?.userId) return setSubmitError(CARACTERIZACION_COPY.submit.authRequired);
      if (!resolved.context) return setSubmitError(CARACTERIZACION_COPY.submit.companyContextMissing);
      const existingId = await getLatestCaracterizacionId(resolved.context.idEmpresa, resolved.context.numeroSolicitud);
      let parentId = existingId;
      if (!parentId) {
        const { data: createdParent, error: createParentError } = await supabase
          .from("caracterizacion_residuos")
          .insert({
            id_empresa: resolved.context.idEmpresa,
            numero_solicitud: resolved.context.numeroSolicitud,
            total_residuos_kg_mes: totalResiduos,
            total_aprovechable_kg_mes: totalAprovechable,
            porcentaje_total_aprovechable: porcentajeTotal,
            conclusion_automatica: conclusion,
            creado_por: resolved.context.userId,
          })
          .select("id")
          .single();
        if (createParentError) return setSubmitError(createParentError.message || CARACTERIZACION_COPY.submit.saveError);
        parentId = createdParent?.id ?? null;
      }
      if (!parentId) return setSubmitError(CARACTERIZACION_COPY.submit.saveError);

      const { error: deleteDetalleError } = await supabase
        .from("caracterizacion_residuos_detalle")
        .delete()
        .eq("id_caracterizacion", parentId);
      if (deleteDetalleError) return setSubmitError(deleteDetalleError.message || CARACTERIZACION_COPY.submit.saveError);

      const rowsToInsert = detailRows.map((row) => ({ id_caracterizacion: parentId, etapa_generacion: row.etapa_generacion.trim(), tipo_residuo: row.tipo_residuo.trim(), material: row.material.trim(), nombre_rango_etapa: row.nombre_rango_etapa ?? null, nombre_rango_tipo: row.nombre_rango_tipo ?? null, cantidad_residuos_kg_mes: row.cantidad_residuos_kg_mes, cantidad_aprovechable_kg_mes: row.cantidad_aprovechable_kg_mes, porcentaje_aprovechable: rowPercentage(row), estrategia: row.estrategia.trim(), potencial: row.potencial.trim(), observaciones: row.observaciones.trim() || null }));
      const { error } = await supabase.from("caracterizacion_residuos_detalle").insert(rowsToInsert);
      if (error) return setSubmitError(error.message || CARACTERIZACION_COPY.submit.saveError);

      const { data: persistedRows, error: persistedRowsError } = await supabase
        .from("caracterizacion_residuos_detalle")
        .select("estrategia, cantidad_residuos_kg_mes, cantidad_aprovechable_kg_mes")
        .eq("id_caracterizacion", parentId);

      if (persistedRowsError) {
        return setSubmitError(persistedRowsError.message || CARACTERIZACION_COPY.submit.saveError);
      }

      const persistedTotalResiduos = (persistedRows ?? []).reduce(
        (acc, row) => acc + Number(row.cantidad_residuos_kg_mes ?? 0),
        0,
      );
      const persistedTotalAprovechable = (persistedRows ?? []).reduce(
        (acc, row) => acc + Number(row.cantidad_aprovechable_kg_mes ?? 0),
        0,
      );
      const persistedPorcentaje =
        persistedTotalResiduos <= 0 ? 0 : (persistedTotalAprovechable / persistedTotalResiduos) * 100;

      const persistedStrategyTotals = new Map<string, number>();
      (persistedRows ?? []).forEach((row) => {
        const key = String(row.estrategia ?? "").trim();
        if (!key) return;
        persistedStrategyTotals.set(
          key,
          (persistedStrategyTotals.get(key) ?? 0) + Number(row.cantidad_residuos_kg_mes ?? 0),
        );
      });

      const sortedStrategies = Array.from(persistedStrategyTotals.entries()).sort((a, b) => b[1] - a[1]);
      const persistedConclusion =
        sortedStrategies.length === 0
          ? CARACTERIZACION_COPY.summary.noStrategyData
          : `Conclusión: La estrategia prioritaria es ${sortedStrategies[0][0]} donde se tiene un total de ${sortedStrategies[0][1].toFixed(2)} kg/mes residuos mensuales`;

      const { error: updateResumenError } = await supabase
        .from("caracterizacion_residuos")
        .update({
          total_residuos_kg_mes: persistedTotalResiduos,
          total_aprovechable_kg_mes: persistedTotalAprovechable,
          porcentaje_total_aprovechable: persistedPorcentaje,
          conclusion_automatica: persistedConclusion,
        })
        .eq("id", parentId);

      if (updateResumenError) {
        return setSubmitError(updateResumenError.message || CARACTERIZACION_COPY.submit.saveError);
      }

      push(`${APP_ROUTES.evaluacionClasificacion}${resolved.hydratedSearch}`);
    } catch (error) {
      console.error("[caracterizacion/saveAndContinue] unexpected error", error);
      if (error instanceof Error && error.message.trim()) {
        setSubmitError(error.message);
      } else {
        setSubmitError(CARACTERIZACION_COPY.submit.saveError);
      }
    } finally { setIsSubmitting(false); }
  }

  return { rows, setRows, updateRow, addRow, removeRow, rowPercentage, toNonNegativeNumber, totalResiduos, totalAprovechable, porcentajeTotal, strategyTotals, conclusion, hasMeaningfulRows, isSubmitting, isLoading, submitError, hydratedSearch, load, saveAndContinue };
}
