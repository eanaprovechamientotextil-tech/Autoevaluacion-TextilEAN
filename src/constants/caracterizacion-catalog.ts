export type CaracterizacionCatalogRow = {
  etapa: string;
  tipo: string;
  material: string;
  nombre_rango_etapa: string;
  nombre_rango_tipo: string;
};

export const ETAPAS_GENERACION_OPTIONS = [
  "1. Diseño / Patronaje",
  "2. Corte de tela",
  "3. Confección",
  "4. Acabados (lavado, estampado, planchado)",
  "5. Control de calidad",
  "6. Empaque",
  "7. Almacenamiento / Inventario",
  "8. Distribución / Comercialización",
  "9. Postventa / Devoluciones",
] as const;

const BASE_MATERIALES = [
  "Algodón",
  "Cuero natural",
  "Cuero sintético",
  "Jean",
  "Lana",
  "Lycra / Elastano",
  "Material mixto",
  "Mezcla algodón-poliéster",
  "Nylon",
  "Poliéster",
  "Seda",
] as const;

const HILOS_MATERIALES = ["Algodón", "Lana", "Elástico", "Nylon"] as const;
const BOLSAS_FUNDAS_MATERIALES = ["Algodón", "Jean", "Seda", "Poliéster", "Material mixto"] as const;

function pushRows(
  rows: CaracterizacionCatalogRow[],
  etapa: string,
  nombre_rango_etapa: string,
  tipo: string,
  nombre_rango_tipo: string,
  materiales: readonly string[],
) {
  materiales.forEach((material) => {
    rows.push({ etapa, nombre_rango_etapa, tipo, nombre_rango_tipo, material });
  });
}

const rows: CaracterizacionCatalogRow[] = [];

pushRows(rows, "1. Diseño / Patronaje", "Diseño_Patronaje", "Hilos sobrantes", "Hilos_sobrantes", HILOS_MATERIALES);
pushRows(rows, "1. Diseño / Patronaje", "Diseño_Patronaje", "Retazos", "Retazos", BASE_MATERIALES);

pushRows(rows, "2. Corte de tela", "Corte_de_Tela", "Hilos sobrantes", "Hilos_sobrantes", HILOS_MATERIALES);
pushRows(rows, "2. Corte de tela", "Corte_de_Tela", "Retazos", "Retazos", BASE_MATERIALES);

pushRows(rows, "3. Confección", "Confección", "Hilos sobrantes", "Hilos_sobrantes", HILOS_MATERIALES);
pushRows(rows, "3. Confección", "Confección", "Prendas defectuosas", "Prendas_defectuosas", BASE_MATERIALES);
pushRows(rows, "3. Confección", "Confección", "Retazos", "Retazos", BASE_MATERIALES);

rows.push({
  etapa: "4. Acabados (lavado, estampado, planchado)",
  nombre_rango_etapa: "Acabados",
  tipo: "Contaminado",
  nombre_rango_tipo: "Contaminado",
  material: "Contaminado",
});
pushRows(rows, "4. Acabados (lavado, estampado, planchado)", "Acabados", "Prendas defectuosas", "Prendas_defectuosas", BASE_MATERIALES);

pushRows(rows, "5. Control de calidad", "Control_de_calidad", "Prendas defectuosas", "Prendas_defectuosas", BASE_MATERIALES);

pushRows(rows, "6. Empaque", "Empaque", "Bolsas de tela", "Bolsas_de_tela", BOLSAS_FUNDAS_MATERIALES);
pushRows(rows, "6. Empaque", "Empaque", "Fundas protectoras", "Fundas_protectoras", BOLSAS_FUNDAS_MATERIALES);
pushRows(rows, "6. Empaque", "Empaque", "Prendas defectuosas", "Prendas_defectuosas", BASE_MATERIALES);

pushRows(rows, "7. Almacenamiento / Inventario", "Almacenamiento_Inventario", "Bolsas de tela", "Bolsas_de_tela", BOLSAS_FUNDAS_MATERIALES);
pushRows(rows, "7. Almacenamiento / Inventario", "Almacenamiento_Inventario", "Fundas protectoras", "Fundas_protectoras", BOLSAS_FUNDAS_MATERIALES);
pushRows(rows, "7. Almacenamiento / Inventario", "Almacenamiento_Inventario", "Hilos sobrantes", "Hilos_sobrantes", HILOS_MATERIALES);
pushRows(rows, "7. Almacenamiento / Inventario", "Almacenamiento_Inventario", "Prendas defectuosas", "Prendas_defectuosas", BASE_MATERIALES);

pushRows(rows, "8. Distribución / Comercialización", "Distribución_Comercialización", "Bolsas de tela", "Bolsas_de_tela", BOLSAS_FUNDAS_MATERIALES);
rows.push({
  etapa: "8. Distribución / Comercialización",
  nombre_rango_etapa: "Distribución_Comercialización",
  tipo: "Contaminado",
  nombre_rango_tipo: "Contaminado",
  material: "Contaminado",
});

pushRows(rows, "9. Postventa / Devoluciones", "Posventa_Devoluciones", "Devoluciones", "Devoluciones", BASE_MATERIALES);
pushRows(rows, "9. Postventa / Devoluciones", "Posventa_Devoluciones", "Ropa usada", "Ropa_usada", BASE_MATERIALES);

export const CARACTERIZACION_CATALOG_ROWS: CaracterizacionCatalogRow[] = rows;

export function getTiposByEtapa(etapa: string) {
  if (!etapa) return [];
  const tipos = new Set(
    CARACTERIZACION_CATALOG_ROWS
      .filter((row) => row.etapa === etapa)
      .map((row) => row.tipo),
  );
  return Array.from(tipos);
}

export function getMaterialesByEtapaTipo(etapa: string, tipo: string) {
  if (!etapa || !tipo) return [];
  const materiales = new Set(
    CARACTERIZACION_CATALOG_ROWS
      .filter((row) => row.etapa === etapa && row.tipo === tipo)
      .map((row) => row.material),
  );
  return Array.from(materiales);
}

export function getRangeNames(etapa: string, tipo: string) {
  const match = CARACTERIZACION_CATALOG_ROWS.find(
    (row) => row.etapa === etapa && row.tipo === tipo,
  );

  return {
    nombre_rango_etapa: match?.nombre_rango_etapa ?? null,
    nombre_rango_tipo: match?.nombre_rango_tipo ?? null,
  };
}
