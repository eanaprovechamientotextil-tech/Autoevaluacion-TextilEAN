"use client";

import { APP_ROUTES } from "@/src/constants/routes";
import { buildComputedRows, getConclusion, getGlobalLevelByPercent } from "@/src/domain/autodiagnostico";
import { getLatestDiagnosticoId, resolveSolicitudContext, supabase, upsertDiagnostico } from "@/src/repositories/solicitud-repository";
import { ScoreByDimension, WeightByDimension } from "@/src/types/autodiagnostico";
import { AUTODIAGNOSTICO_COPY } from "@/src/constants/copy";
import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";

const initialScores = AUTODIAGNOSTICO_COPY.dimensions.reduce<ScoreByDimension>((acc, d) => ({ ...acc, [d.key]: 1 }), {});
const initialWeights = AUTODIAGNOSTICO_COPY.dimensions.reduce<WeightByDimension>((acc, d) => ({ ...acc, [d.key]: d.weight }), {});

export function useAutodiagnosticoForm(searchParams: URLSearchParams, push: (path: string) => void) {
  const [scores, setScoresState] = useState(initialScores);
  const [weights, setWeightsState] = useState(initialWeights);
  const scoresRef = useRef(initialScores);
  const weightsRef = useRef(initialWeights);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hydratedSearch, setHydratedSearch] = useState("");
  const loadRunRef = useRef(0);

  const computedRows = useMemo(() => buildComputedRows(scores, weights), [scores, weights]);
  const totalWeight = useMemo(() => computedRows.reduce((acc, row) => acc + row.weight, 0), [computedRows]);
  const isWeightTotalValid = totalWeight === 100;
  const totalWeightedResult = useMemo(() => computedRows.reduce((acc, row) => acc + row.weightedResult, 0), [computedRows]);
  const maturityPercent = useMemo(() => (totalWeightedResult / 5) * 100, [totalWeightedResult]);
  const globalLevel = useMemo(() => getGlobalLevelByPercent(maturityPercent), [maturityPercent]);
  const weakestDimension = useMemo(() => computedRows.reduce((lowest, current) => (!lowest || current.score < lowest.score ? current : lowest), null as (typeof computedRows)[number] | null), [computedRows]);
  const largestGapDimension = useMemo(() => computedRows.reduce((largest, current) => (current.gap > largest ? current.gap : largest), 0), [computedRows]);
  const conclusion = useMemo(() => getConclusion(totalWeightedResult), [totalWeightedResult]);

  const setScores: Dispatch<SetStateAction<ScoreByDimension>> = (nextState) => {
    const next = typeof nextState === "function" ? nextState(scoresRef.current) : nextState;
    scoresRef.current = next;
    setScoresState(next);
  };

  const setWeights: Dispatch<SetStateAction<WeightByDimension>> = (nextState) => {
    const next = typeof nextState === "function" ? nextState(weightsRef.current) : nextState;
    weightsRef.current = next;
    setWeightsState(next);
  };

  function resetToInitialState() {
    scoresRef.current = { ...initialScores };
    weightsRef.current = { ...initialWeights };
    setScoresState({ ...initialScores });
    setWeightsState({ ...initialWeights });
  }

  async function load() {
    const runId = ++loadRunRef.current;
    setIsLoading(true);
    const resolved = await resolveSolicitudContext(searchParams);
    if (runId !== loadRunRef.current) return;
    setHydratedSearch(resolved.hydratedSearch);
    if (!resolved.context) {
      resetToInitialState();
      return setIsLoading(false);
    }
    const diagId = await getLatestDiagnosticoId(resolved.context.idEmpresa, resolved.context.numeroSolicitud);
    if (runId !== loadRunRef.current) return;
    if (!diagId) {
      resetToInitialState();
      return setIsLoading(false);
    }
    const { data: details } = await supabase.from("diagnostico_detalle").select("dimension_clave, peso_porcentaje, calificacion").eq("id_diagnostico", diagId);
    if (runId !== loadRunRef.current) return;
    if (details?.length) {
      const nextScores = { ...initialScores };
      const nextWeights = { ...initialWeights };
      details.forEach((row) => {
        if (row.dimension_clave in nextScores) {
          nextScores[row.dimension_clave] = Number(row.calificacion ?? 1);
          nextWeights[row.dimension_clave] = Number(row.peso_porcentaje ?? nextWeights[row.dimension_clave]);
        }
      });
      scoresRef.current = nextScores;
      weightsRef.current = nextWeights;
      setScoresState(nextScores);
      setWeightsState(nextWeights);
    } else {
      resetToInitialState();
    }
    setIsLoading(false);
  }

  async function saveAndContinue() {
    if (!isWeightTotalValid) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const resolved = await resolveSolicitudContext(searchParams);
      setHydratedSearch(resolved.hydratedSearch);
      if (!resolved.context) return setSubmitError(AUTODIAGNOSTICO_COPY.submit.companyContextMissing);
      const existingId = await getLatestDiagnosticoId(resolved.context.idEmpresa, resolved.context.numeroSolicitud);
      const rowsToPersist = buildComputedRows(scoresRef.current, weightsRef.current);
      const totalWeightedResultToPersist = rowsToPersist.reduce((acc, row) => acc + row.weightedResult, 0);
      const maturityPercentToPersist = (totalWeightedResultToPersist / 5) * 100;
      const globalLevelToPersist = getGlobalLevelByPercent(maturityPercentToPersist);
      const weakestDimensionToPersist = rowsToPersist.reduce((lowest, current) => (!lowest || current.score < lowest.score ? current : lowest), null as (typeof rowsToPersist)[number] | null);
      const largestGapDimensionToPersist = rowsToPersist.reduce((largest, current) => (current.gap > largest ? current.gap : largest), 0);
      const conclusionToPersist = getConclusion(totalWeightedResultToPersist);
      const details = rowsToPersist.map((row) => ({ dimension_clave: row.key, dimension: row.name, criterio: row.criteria, peso_porcentaje: row.weight, calificacion: row.score, resultado_ponderado: row.weightedResult, brecha: row.gap, nivel: row.level, recomendacion_automatica: row.recommendation }));
      const result = await upsertDiagnostico({ existingId, idEmpresa: resolved.context.idEmpresa, numeroSolicitud: resolved.context.numeroSolicitud, totalWeightedResult: totalWeightedResultToPersist, maturityPercent: maturityPercentToPersist, globalLevel: globalLevelToPersist, weakestDimension: weakestDimensionToPersist?.name ?? AUTODIAGNOSTICO_COPY.summary.noWeakDimension, largestGapDimension: largestGapDimensionToPersist, conclusion: conclusionToPersist, userId: resolved.context.userId, details });
      if (result.error) return setSubmitError(result.error.message || AUTODIAGNOSTICO_COPY.submit.saveError);
      push(`${APP_ROUTES.caracterizacion}${resolved.hydratedSearch}`);
    } catch {
      setSubmitError(AUTODIAGNOSTICO_COPY.submit.saveError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return { scores, setScores, weights, setWeights, computedRows, totalWeight, isWeightTotalValid, totalWeightedResult, maturityPercent, globalLevel, weakestDimension, largestGapDimension, conclusion, isSubmitting, isLoading, submitError, hydratedSearch, load, saveAndContinue };
}
