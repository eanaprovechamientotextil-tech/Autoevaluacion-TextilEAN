import { AUTODIAGNOSTICO_COPY } from "@/src/constants/copy";
import { DiagnosticComputedRow, ScoreByDimension, WeightByDimension } from "@/src/types/autodiagnostico";

export const SCORE_OPTIONS = [1, 2, 3, 4, 5] as const;

export function getLevelByScore(score: number) {
  if (score >= 4) return AUTODIAGNOSTICO_COPY.levels.advanced;
  if (score >= 2.5) return AUTODIAGNOSTICO_COPY.levels.intermediate;
  return AUTODIAGNOSTICO_COPY.levels.initial;
}

export function getRecommendationByLevel(level: string) {
  if (level === AUTODIAGNOSTICO_COPY.levels.initial) return AUTODIAGNOSTICO_COPY.recommendations.initial;
  if (level === AUTODIAGNOSTICO_COPY.levels.intermediate) return AUTODIAGNOSTICO_COPY.recommendations.intermediate;
  return AUTODIAGNOSTICO_COPY.recommendations.advanced;
}

export function getGlobalLevelByPercent(maturityPercent: number) {
  if (maturityPercent >= 80) return AUTODIAGNOSTICO_COPY.levels.advanced;
  if (maturityPercent >= 50) return AUTODIAGNOSTICO_COPY.levels.intermediate;
  return AUTODIAGNOSTICO_COPY.levels.initial;
}

export function buildComputedRows(scores: ScoreByDimension, weights: WeightByDimension): DiagnosticComputedRow[] {
  return AUTODIAGNOSTICO_COPY.dimensions.map((dimension) => {
    const score = scores[dimension.key] ?? 1;
    const weight = weights[dimension.key] ?? 0;
    const weightedResult = score * (weight / 100);
    const gap = 5 - score;
    const level = getLevelByScore(score);
    return {
      ...dimension,
      score,
      weight,
      weightedResult,
      gap,
      level,
      recommendation: getRecommendationByLevel(level),
    };
  });
}

export function getConclusion(totalWeightedResult: number) {
  if (!Number.isFinite(totalWeightedResult) || totalWeightedResult <= 0) return AUTODIAGNOSTICO_COPY.conclusionByLevel.pending;
  if (totalWeightedResult < 2.5) return AUTODIAGNOSTICO_COPY.conclusionByLevel.initial;
  if (totalWeightedResult < 4) return AUTODIAGNOSTICO_COPY.conclusionByLevel.intermediate;
  return AUTODIAGNOSTICO_COPY.conclusionByLevel.advanced;
}
