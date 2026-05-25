import { createClient } from "@/lib/supabase/client";
import { SolicitudContextResult } from "@/src/types/solicitud";

const supabase = createClient();

function buildSearch(empresa: string, sol: string) {
  return `?empresa=${encodeURIComponent(empresa)}&sol=${encodeURIComponent(sol)}`;
}

export async function resolveSolicitudContext(searchParams: URLSearchParams): Promise<SolicitudContextResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const idEmpresa = searchParams.get("empresa") ?? "";
  const numeroSolicitud = searchParams.get("sol") ?? "";

  if (!idEmpresa || !numeroSolicitud) return { context: null, hydratedSearch: "" };
  return { context: { idEmpresa, numeroSolicitud, userId: user?.id ?? null }, hydratedSearch: buildSearch(idEmpresa, numeroSolicitud) };
}

export async function getLatestDiagnosticoId(idEmpresa: string, numeroSolicitud: string) {
  const { data } = await supabase
    .from("diagnosticos")
    .select("id")
    .eq("id_empresa", idEmpresa)
    .eq("numero_solicitud", numeroSolicitud)
    .order("fecha_creacion", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function upsertDiagnostico(payload: {
  existingId: string | null;
  idEmpresa: string;
  numeroSolicitud: string;
  totalWeightedResult: number;
  maturityPercent: number;
  globalLevel: string;
  weakestDimension: string;
  largestGapDimension: number;
  conclusion: string;
  userId: string | null;
  details: Array<Record<string, unknown>>;
}) {
  const { existingId, details, ...parent } = payload;
  let planId = existingId;

  if (!planId) {
    const { data: latest } = await supabase
      .from("diagnosticos")
      .select("id")
      .eq("id_empresa", parent.idEmpresa)
      .eq("numero_solicitud", parent.numeroSolicitud)
      .order("fecha_creacion", { ascending: false })
      .limit(1)
      .maybeSingle();

    planId = latest?.id ?? null;
  }

  if (!planId) {
    const { data: created, error: createError } = await supabase
      .from("diagnosticos")
      .insert({
        id_empresa: parent.idEmpresa,
        numero_solicitud: parent.numeroSolicitud,
        resultado_total_ponderado: parent.totalWeightedResult,
        porcentaje_madurez: parent.maturityPercent,
        nivel_madurez: parent.globalLevel,
        dimension_mas_debil: parent.weakestDimension,
        mayor_brecha: parent.largestGapDimension,
        conclusion: parent.conclusion,
        estado: "borrador",
        creado_por: parent.userId,
      })
      .select("id")
      .single();

    if (createError || !created?.id) {
      return { error: createError ?? { message: "No se pudo crear diagnóstico." } };
    }

    planId = created.id;
  }

  const { error: updateError } = await supabase.from("diagnosticos").update({
    resultado_total_ponderado: parent.totalWeightedResult,
    porcentaje_madurez: parent.maturityPercent,
    nivel_madurez: parent.globalLevel,
    dimension_mas_debil: parent.weakestDimension,
    mayor_brecha: parent.largestGapDimension,
    conclusion: parent.conclusion,
    estado: "borrador",
  }).eq("id", planId);
  if (updateError) return { error: updateError };

  const { error: detailError } = await supabase
    .from("diagnostico_detalle")
    .upsert(details.map((d) => ({ ...d, id_diagnostico: planId })), {
      onConflict: "id_diagnostico,dimension_clave",
    });
  return { error: detailError, id: planId };
}

export async function getLatestCaracterizacionId(idEmpresa: string, numeroSolicitud: string) {
  const { data } = await supabase.from("caracterizacion_residuos").select("id").eq("id_empresa", idEmpresa).eq("numero_solicitud", numeroSolicitud).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data?.id ?? null;
}

export async function getLatestPlanId(idEmpresa: string, numeroSolicitud: string, userId: string | null) {
  let query = supabase.from("plan_accion_kpis").select("id").eq("id_empresa", idEmpresa).eq("numero_solicitud", numeroSolicitud).order("fecha_creacion", { ascending: false }).limit(1);
  if (userId) query = query.eq("creado_por", userId);
  const { data } = await query.maybeSingle();
  return data?.id ?? null;
}

export { supabase };
