"use client";

import { APP_ROUTES } from "@/src/constants/routes";
import { PLAN_ACCION_KPIS_COPY } from "@/src/constants/copy";
import { clamp1to5, cumplimiento, emptyActionRow, priorityIndex, priorityLabel, toScore } from "@/src/domain/plan-accion";
import { getLatestPlanId, resolveSolicitudContext, supabase } from "@/src/repositories/solicitud-repository";
import { ActionRow, KpiRow } from "@/src/types/plan-accion";
import { useMemo, useRef, useState } from "react";

export function usePlanAccionKpisForm(searchParams: URLSearchParams, push: (path: string) => void) {
  const autoActualIndicators = new Set([
    "% Residuos textiles aprovechados",
    "Kg residuos recuperados/mes",
    "Acciones cerradas de la hoja de ruta",
  ]);
  const initialRows = PLAN_ACCION_KPIS_COPY.initialActionRows.map((row) => ({ ...row, locked: true }));
  const [actionRows, setActionRows] = useState<ActionRow[]>(initialRows);
  const [kpiRows, setKpiRows] = useState<KpiRow[]>(PLAN_ACCION_KPIS_COPY.initialKpiRows);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [prerequisiteError, setPrerequisiteError] = useState<string | null>(null);
  const [existingPlanId, setExistingPlanId] = useState<string | null>(null);
  const [lastSavedSignature, setLastSavedSignature] = useState("");
  const [hydratedSearch, setHydratedSearch] = useState("");
  const loadRunRef = useRef(0);

  const resumen = useMemo(() => {
    const cumplimientoValues = kpiRows
      .map((row) => cumplimiento(row.actual, row.meta))
      .filter((value): value is number => value !== null);

    const promedioKpi = cumplimientoValues.length
      ? cumplimientoValues.reduce((acc, value) => acc + value, 0) / cumplimientoValues.length
      : null;

    const estadoBase =
      promedioKpi === null
        ? "Sin datos"
        : promedioKpi >= 80
          ? "En control"
          : promedioKpi >= 50
            ? "En seguimiento"
            : "Crítico";

    return {
      altas: actionRows.filter((row) => {
        const indice = priorityIndex(row.impacto, row.esfuerzo);
        return priorityLabel(indice) === PLAN_ACCION_KPIS_COPY.priorities.alta;
      }).length,
      cerradas: actionRows.filter((row) => row.estado === "Cerrado").length,
      riesgo: actionRows.filter((row) => row.estado === "En riesgo").length,
      promedioKpi,
      estadoGeneral: `${estadoBase}${actionRows.filter((row) => row.estado === "En riesgo").length >= 1 ? " con acciones en riesgo" : ""}`,
    };
  }, [actionRows, kpiRows]);
  const signatureFor = (rows: ActionRow[], kpis: KpiRow[]) => JSON.stringify({ rows, kpis });

  function applyCaracterizacionToKpis(rows: KpiRow[], payload: { porcentaje: number; recuperado: number }) {
    return rows.map((kpi) => {
      if (kpi.indicador === "% Residuos textiles aprovechados") {
        return { ...kpi, actual: Number(payload.porcentaje ?? 0) };
      }
      if (kpi.indicador === "Kg residuos recuperados/mes") {
        return { ...kpi, actual: Number(payload.recuperado ?? 0) };
      }
      return kpi;
    });
  }

  const syncClosedActionsKpi = (nextActionRows: ActionRow[], prevKpis: KpiRow[]) => {
    const closedCount = nextActionRows.filter((row) => row.estado === "Cerrado").length;
    return prevKpis.map((row) =>
      row.indicador === "Acciones cerradas de la hoja de ruta"
        ? { ...row, actual: closedCount }
        : row,
    );
  };

  async function load() {
    const runId = ++loadRunRef.current;
    const resolved = await resolveSolicitudContext(searchParams);
    if (runId !== loadRunRef.current) return;
    setHydratedSearch(resolved.hydratedSearch);
    if (!resolved.context) return setIsLoading(false);
    setPrerequisiteError(null);

    const { data: carac, error: caracError } = await supabase
      .from("caracterizacion_residuos")
      .select("porcentaje_total_aprovechable, total_aprovechable_kg_mes")
      .eq("id_empresa", resolved.context.idEmpresa)
      .eq("numero_solicitud", resolved.context.numeroSolicitud)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (runId !== loadRunRef.current) return;

    if (caracError) {
      setPrerequisiteError(`No se pudo leer Caracterización de Residuos: ${caracError.message}`);
      setIsLoading(false);
      return;
    }

    if (!carac) {
      setPrerequisiteError("Esta solicitud aún no tiene Caracterización de Residuos. Debes completar ese paso antes de continuar con KPIs.");
      setIsLoading(false);
      return;
    }

    const caracPayload = {
      porcentaje: Number(carac.porcentaje_total_aprovechable ?? 0),
      recuperado: Number(carac.total_aprovechable_kg_mes ?? 0),
    };

    const planId = await getLatestPlanId(resolved.context.idEmpresa, resolved.context.numeroSolicitud, resolved.context.userId);
    if (runId !== loadRunRef.current) return;
    if (!planId) {
      setKpiRows((prev) => applyCaracterizacionToKpis(prev, caracPayload));
      return setIsLoading(false);
    }
    const [{ data: actions }, { data: kpis }] = await Promise.all([
      supabase.from("plan_accion_detalle").select("fase, accion, responsable, fecha_inicio, fecha_fin, impacto, esfuerzo, estado").eq("id_plan", planId),
      supabase.from("plan_kpi_detalle").select("indicador, valor_actual, valor_meta").eq("id_plan", planId),
    ]);
    const mappedActions =
      actions?.map((row, index) => ({
        locked: index < PLAN_ACCION_KPIS_COPY.initialActionRows.length,
        fase: row.fase ?? "",
        accion: row.accion ?? "",
        responsable: row.responsable ?? "",
        fecha_inicio: row.fecha_inicio ?? "",
        fecha_fin: row.fecha_fin ?? "",
        impacto: row.impacto ?? "",
        esfuerzo: row.esfuerzo ?? "",
        estado: row.estado ?? "No iniciado",
      })) ?? [];
    const mappedKpis = kpis?.map((row) => ({ indicador: row.indicador ?? "", actual: Number(row.valor_actual ?? 0), meta: Number(row.valor_meta ?? 0) })) ?? [];
    if (mappedActions.length) setActionRows(mappedActions);
    if (mappedKpis.length) {
      setKpiRows(syncClosedActionsKpi(mappedActions.length ? mappedActions : actionRows, applyCaracterizacionToKpis(mappedKpis, caracPayload)));
    } else {
      setKpiRows((prev) => syncClosedActionsKpi(mappedActions.length ? mappedActions : actionRows, applyCaracterizacionToKpis(prev, caracPayload)));
    }
    setExistingPlanId(planId);
    setLastSavedSignature(signatureFor(mappedActions.length ? mappedActions : actionRows, mappedKpis.length ? mappedKpis : kpiRows));
    setIsLoading(false);
  }

  async function saveAndContinue() {
    setSubmitError(null);
    if (prerequisiteError) return setSubmitError(prerequisiteError);
    setIsSubmitting(true);
    try {
      const resolved = await resolveSolicitudContext(searchParams);
      setHydratedSearch(resolved.hydratedSearch);
      if (!resolved.context?.userId) return setSubmitError(PLAN_ACCION_KPIS_COPY.submit.authRequired);
      const currentSignature = signatureFor(actionRows, kpiRows);
      if (currentSignature === lastSavedSignature && existingPlanId) return push(`${APP_ROUTES.vinculacionAliados}${resolved.hydratedSearch}`);
      const planId = existingPlanId ?? (await supabase.from("plan_accion_kpis").insert({ id_empresa: resolved.context.idEmpresa, numero_solicitud: resolved.context.numeroSolicitud, creado_por: resolved.context.userId }).select("id").single()).data?.id;
      if (!planId) return setSubmitError(PLAN_ACCION_KPIS_COPY.submit.saveError);
      await Promise.all([supabase.from("plan_accion_detalle").delete().eq("id_plan", planId), supabase.from("plan_kpi_detalle").delete().eq("id_plan", planId)]);
      await supabase.from("plan_accion_detalle").insert(actionRows.map((row) => { const indice = priorityIndex(row.impacto, row.esfuerzo); return { id_plan: planId, fase: row.fase, accion: row.accion, responsable: row.responsable, fecha_inicio: row.fecha_inicio || null, fecha_fin: row.fecha_fin || null, impacto: toScore(row.impacto) || 1, esfuerzo: toScore(row.esfuerzo) || 1, indice_prioridad: indice === "" ? null : indice, prioridad: priorityLabel(indice) || null, estado: row.estado }; }));
      await supabase.from("plan_kpi_detalle").insert(kpiRows.map((row) => ({ id_plan: planId, indicador: row.indicador, valor_actual: row.actual, valor_meta: row.meta, porcentaje_cumplimiento: cumplimiento(row.actual, row.meta) })));

      const [{ data: persistedActions, error: persistedActionsError }, { data: persistedKpis, error: persistedKpisError }] =
        await Promise.all([
          supabase
            .from("plan_accion_detalle")
            .select("impacto, esfuerzo, estado")
            .eq("id_plan", planId),
          supabase
            .from("plan_kpi_detalle")
            .select("porcentaje_cumplimiento")
            .eq("id_plan", planId),
        ]);

      if (persistedActionsError || persistedKpisError) {
        return setSubmitError(PLAN_ACCION_KPIS_COPY.submit.saveError);
      }

      const persistedAltas = (persistedActions ?? []).filter((row) => {
        const indice = priorityIndex(Number(row.impacto ?? 0), Number(row.esfuerzo ?? 0));
        return priorityLabel(indice) === PLAN_ACCION_KPIS_COPY.priorities.alta;
      }).length;
      const persistedCerradas = (persistedActions ?? []).filter((row) => row.estado === "Cerrado").length;
      const persistedRiesgo = (persistedActions ?? []).filter((row) => row.estado === "En riesgo").length;

      const cumplimientoValues = (persistedKpis ?? [])
        .map((row) => (row.porcentaje_cumplimiento === null ? null : Number(row.porcentaje_cumplimiento)))
        .filter((value): value is number => value !== null && Number.isFinite(value));

      const persistedPromedioKpi = cumplimientoValues.length
        ? cumplimientoValues.reduce((acc, value) => acc + value, 0) / cumplimientoValues.length
        : null;

      const estadoBase =
        persistedPromedioKpi === null
          ? "Sin datos"
          : persistedPromedioKpi >= 80
            ? "En control"
            : persistedPromedioKpi >= 50
              ? "En seguimiento"
              : "Crítico";

      const persistedEstadoGeneral = `${estadoBase}${persistedRiesgo >= 1 ? " con acciones en riesgo" : ""}`;

      await supabase
        .from("plan_accion_kpis")
        .update({
          objetivo: PLAN_ACCION_KPIS_COPY.objective,
          acciones_alta_prioridad: persistedAltas,
          acciones_cerradas: persistedCerradas,
          acciones_en_riesgo: persistedRiesgo,
          cumplimiento_promedio_kpi: persistedPromedioKpi,
          estado_general: persistedEstadoGeneral,
        })
        .eq("id", planId);

      setExistingPlanId(planId);
      setLastSavedSignature(currentSignature);
      push(`${APP_ROUTES.vinculacionAliados}${resolved.hydratedSearch}`);
    } catch { setSubmitError(PLAN_ACCION_KPIS_COPY.submit.saveError); } finally { setIsSubmitting(false); }
  }

  return {
    actionRows,
    kpiRows,
    setActionRows,
    setKpiRows,
    isSubmitting,
    isLoading,
    submitError,
    prerequisiteError,
    hydratedSearch,
    resumen,
    load,
    saveAndContinue,
    clamp1to5,
    cumplimiento,
    priorityIndex,
    priorityLabel,
    addActionRow: () =>
      setActionRows((prev) => {
        const nextRows = [...prev, { ...emptyActionRow(), locked: false }];
        setKpiRows((prevKpis) => syncClosedActionsKpi(nextRows, prevKpis));
        return nextRows;
      }),
    removeActionRow: (index: number) =>
      setActionRows((prev) => {
        const row = prev[index];
        if (!row || row.locked || prev.length <= 1) return prev;
        const nextRows = prev.filter((_, i) => i !== index);
        setKpiRows((prevKpis) => syncClosedActionsKpi(nextRows, prevKpis));
        return nextRows;
      }),
    updateActionRow: (index: number, patch: Partial<ActionRow>) =>
      setActionRows((prev) => {
        const nextRows = prev.map((row, i) => (i === index ? { ...row, ...patch } : row));
        setKpiRows((prevKpis) => syncClosedActionsKpi(nextRows, prevKpis));
        return nextRows;
      }),
    updateKpiRow: (index: number, patch: Partial<KpiRow>) =>
      setKpiRows((prev) =>
        prev.map((row, i) => {
          if (i !== index) return row;
          if (autoActualIndicators.has(row.indicador)) {
            const { actual, ...restPatch } = patch;
            void actual;
            return { ...row, ...restPatch };
          }
          return { ...row, ...patch };
        }),
      ),
  };
}
