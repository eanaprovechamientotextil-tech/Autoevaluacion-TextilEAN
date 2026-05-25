import { AUTODIAGNOSTICO_COPY } from "@/src/constants/copy";

export type DiagnosticDimension = (typeof AUTODIAGNOSTICO_COPY.dimensions)[number];
export type ScoreByDimension = Record<string, number>;
export type WeightByDimension = Record<string, number>;

export type DiagnosticComputedRow = DiagnosticDimension & {
  weight: number;
  score: number;
  weightedResult: number;
  gap: number;
  level: string;
  recommendation: string;
};
