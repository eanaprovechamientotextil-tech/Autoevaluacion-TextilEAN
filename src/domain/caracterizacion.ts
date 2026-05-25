import { CaracterizacionRow } from "@/src/types/caracterizacion";

export function computeEstrategia(tipoResiduo: string, material: string) {
  const tipo = tipoResiduo.trim();
  const mat = material.trim();
  if (!tipo) return "";
  if (tipo === "Contaminado") return "Disposición final controlada";
  if (["Algodón", "Lana", "Jean"].includes(mat)) return ["Retazos", "Piezas mal cortadas", "Hilos sobrantes"].includes(tipo) ? "Upcycling: Se transforma en algo nuevo" : "Reutilización: Se usa la prenda tal cual";
  if (["Mezcla algodón-poliéster", "Material mixto"].includes(mat) || tipo === "Mezclas textiles") return "Reciclaje mecánico: Se descompone o trituran físicamente";
  if (tipo === "Ropa usada") return "Donación / Reventa";
  if (["Bolsas de tela", "Fundas protectoras"].includes(tipo)) return "Reutilización interna";
  if (tipo === "Prendas defectuosas") return "Estrategia comercial";
  return "Evaluar estrategia";
}

export function computePotencial(estrategia: string) {
  const value = estrategia.trim();
  if (!value) return "";
  if (value.startsWith("Upcycling") || value.startsWith("Reutilización:") || value === "Reutilización interna" || value === "Donación / Reventa") return "Alto impacto";
  if (value.startsWith("Reciclaje mecánico")) return "Impacto medio";
  if (value === "Disposición final controlada") return "Impacto bajo/nulo";
  return "Impacto medio";
}

export function emptyCaracterizacionRow(): CaracterizacionRow {
  return { etapa_generacion: "", tipo_residuo: "", material: "", cantidad_residuos_kg_mes: 0, cantidad_aprovechable_kg_mes: 0, estrategia: "", potencial: "", observaciones: "" };
}

export function withComputedFields(row: CaracterizacionRow): CaracterizacionRow {
  const estrategia = computeEstrategia(row.tipo_residuo, row.material);
  return { ...row, estrategia, potencial: computePotencial(estrategia) };
}

export function rowPercentage(row: CaracterizacionRow) {
  if (row.cantidad_residuos_kg_mes <= 0) return 0;
  return (row.cantidad_aprovechable_kg_mes / row.cantidad_residuos_kg_mes) * 100;
}

export function toNonNegativeNumber(value: string) {
  const parsed = Number(value);
  return !Number.isFinite(parsed) || parsed < 0 ? 0 : parsed;
}
