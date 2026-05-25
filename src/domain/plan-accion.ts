import { PLAN_ACCION_KPIS_COPY } from "@/src/constants/copy";
import { ActionRow } from "@/src/types/plan-accion";

export function clamp1to5(value: number) {
  return Math.max(1, Math.min(5, Math.round(value)));
}

export function toScore(value: number | "") {
  return typeof value === "number" ? value : 0;
}

export function priorityIndex(impacto: number | "", esfuerzo: number | "") {
  if (impacto === "" || esfuerzo === "") return "";
  const esfuerzoValue = toScore(esfuerzo);
  if (!esfuerzoValue) return "";
  return toScore(impacto) / esfuerzoValue;
}

export function priorityLabel(indice: number | "") {
  if (indice === "") return "";
  if (indice >= 1.5) return PLAN_ACCION_KPIS_COPY.priorities.alta;
  if (indice >= 1) return PLAN_ACCION_KPIS_COPY.priorities.media;
  return PLAN_ACCION_KPIS_COPY.priorities.baja;
}

export function cumplimiento(actual: number, meta: number) {
  if (meta <= 0) return null;
  return Math.min((actual / meta) * 100, 100);
}

export function emptyActionRow(): ActionRow {
  return { fase: "", accion: "", responsable: "", fecha_inicio: "", fecha_fin: "", impacto: "", esfuerzo: "", estado: "No iniciado" };
}
