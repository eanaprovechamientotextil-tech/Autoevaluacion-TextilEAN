"use client";

import { createClient } from "@/lib/supabase/client";
import { REGISTRO_EMPRESA_COPY } from "@/src/constants/copy";
import { APP_ROUTES } from "@/src/constants/routes";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type CompanyFormState = {
  companyName: string;
  employeeCount: string;
  address: string;
  city: string;
  wasteManager: string;
  phone: string;
  role: string;
};

type CompanyLookupStatus = "idle" | "searching" | "found" | "not_found" | "error";

type ExistingCompanySeed = {
  id: string;
  numero_solicitud: string;
  normalizedName: string;
  candidates: CompanySeedCandidate[];
};

type CompanySeedCandidate = {
  id: string;
  numero_solicitud: string;
};

type CompaniesRow = {
  id: string;
  numero_solicitud: string;
  nombre_empresa: string | null;
  employee_count: number | null;
  direccion: string | null;
  ciudad_municipio: string | null;
  responsable_aprovechamiento: string | null;
  telefono_contacto: string | null;
  cargo_responsable: string | null;
};

function getCompanySize(employeeCount: number) {
  if (employeeCount < 50) return REGISTRO_EMPRESA_COPY.sizeValues.small;
  if (employeeCount < 250) return REGISTRO_EMPRESA_COPY.sizeValues.medium;
  return REGISTRO_EMPRESA_COPY.sizeValues.large;
}

function normalizeCompanyNameKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleUpperCase("es-CO");
}

function normalizeUpperInput(value: string) {
  return value.toLocaleUpperCase("es-CO");
}

function sanitizeForSave(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleUpperCase("es-CO");
}

function recomputeDiagnosticoFromDetails(
  rows: Array<{
    calificacion: number | null;
    resultado_ponderado: number | null;
  }>,
) {
  const normalized = rows.map((row) => ({
    calificacion: Number(row.calificacion ?? 1),
    resultado_ponderado: Number(row.resultado_ponderado ?? 0),
  }));

  const totalWeighted = normalized.reduce((acc, row) => acc + row.resultado_ponderado, 0);
  const maturity = (totalWeighted / 5) * 100;
  const largestGap = normalized.reduce((acc, row) => Math.max(acc, 5 - row.calificacion), 0);

  return {
    totalWeighted,
    maturity,
    largestGap,
  };
}

async function cloneEvaluationDataFromSource(params: {
  supabase: ReturnType<typeof createClient>;
  sourceCandidates: CompanySeedCandidate[];
  targetEmpresaId: string;
  targetNumeroSolicitud: string;
  userId: string | null;
}) {
  const {
    supabase,
    sourceCandidates,
    targetEmpresaId,
    targetNumeroSolicitud,
    userId,
  } = params;

  const warnings: string[] = [];

  async function findBestSourceResult<T extends Record<string, unknown>>(args: {
    table: string;
    select: string;
    orderBy: string;
  }) {
    for (const candidate of sourceCandidates) {
      const { data, error } = await supabase
        .from(args.table)
        .select(args.select)
        .eq("id_empresa", candidate.id)
        .eq("numero_solicitud", candidate.numero_solicitud)
        .order(args.orderBy, { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) continue;
      if (data) {
        return {
          source: candidate,
          row: data as unknown as T,
        };
      }
    }

    return null;
  }

  // 1) Autodiagnóstico
  try {
    const sourceDiagnosticoResult = await findBestSourceResult<{
      id: string;
      resultado_total_ponderado: number | null;
      porcentaje_madurez: number | null;
      nivel_madurez: string | null;
      dimension_mas_debil: string | null;
      mayor_brecha: number | null;
      conclusion: string | null;
      estado: string | null;
    }>({
      table: "diagnosticos",
      select:
        "id, resultado_total_ponderado, porcentaje_madurez, nivel_madurez, dimension_mas_debil, mayor_brecha, conclusion, estado",
      orderBy: "fecha_creacion",
    });

    if (sourceDiagnosticoResult?.row?.id) {
      const sourceDiagnostico = sourceDiagnosticoResult.row;
      const { data: sourceDiagnosticoDetails, error: sourceDiagnosticoDetailsError } = await supabase
        .from("diagnostico_detalle")
        .select(
          "dimension_clave, dimension, criterio, peso_porcentaje, calificacion, resultado_ponderado, brecha, nivel, recomendacion_automatica",
        )
        .eq("id_diagnostico", sourceDiagnostico.id);

      if (sourceDiagnosticoDetailsError) {
        warnings.push("No se pudo leer el detalle de autodiagnóstico previo.");
      }

      const diagStats = recomputeDiagnosticoFromDetails(
        (sourceDiagnosticoDetails ?? []).map((row) => ({
          calificacion: row.calificacion,
          resultado_ponderado: row.resultado_ponderado,
        })),
      );

      const { data: targetDiagnostico, error: targetDiagnosticoError } = await supabase
        .from("diagnosticos")
        .insert({
          id_empresa: targetEmpresaId,
          numero_solicitud: targetNumeroSolicitud,
          resultado_total_ponderado: diagStats.totalWeighted,
          porcentaje_madurez: diagStats.maturity,
          nivel_madurez: sourceDiagnostico.nivel_madurez ?? "Inicial",
          dimension_mas_debil: sourceDiagnostico.dimension_mas_debil ?? "",
          mayor_brecha: diagStats.largestGap,
          conclusion: sourceDiagnostico.conclusion ?? "",
          estado: sourceDiagnostico.estado ?? "borrador",
          creado_por: userId,
        })
        .select("id")
        .single();

      if (targetDiagnosticoError || !targetDiagnostico?.id) {
        warnings.push("No se pudo clonar el autodiagnóstico.");
      } else if ((sourceDiagnosticoDetails ?? []).length) {
          const { error: insertDiagnosticoDetailsError } = await supabase
            .from("diagnostico_detalle")
            .insert(
              (sourceDiagnosticoDetails ?? []).map((row) => ({
                id_diagnostico: targetDiagnostico.id,
                dimension_clave: row.dimension_clave,
                dimension: row.dimension,
                criterio: row.criterio,
                peso_porcentaje: row.peso_porcentaje,
                calificacion: row.calificacion,
                resultado_ponderado: row.resultado_ponderado,
                brecha: row.brecha,
                nivel: row.nivel,
                recomendacion_automatica: row.recomendacion_automatica,
              })),
            );

          if (insertDiagnosticoDetailsError) {
            warnings.push("No se pudo clonar el detalle de autodiagnóstico.");
          }
      }
    }
  } catch {
    warnings.push("Error inesperado clonando autodiagnóstico.");
  }

  // 2) Caracterización
  try {
    const sourceCaracterizacionResult = await findBestSourceResult<{
      id: string;
      total_residuos_kg_mes: number | null;
      total_aprovechable_kg_mes: number | null;
      porcentaje_total_aprovechable: number | null;
      conclusion_automatica: string | null;
    }>({
      table: "caracterizacion_residuos",
      select:
        "id, total_residuos_kg_mes, total_aprovechable_kg_mes, porcentaje_total_aprovechable, conclusion_automatica",
      orderBy: "created_at",
    });

    if (sourceCaracterizacionResult?.row?.id) {
      const sourceCaracterizacion = sourceCaracterizacionResult.row;
      const { data: targetCaracterizacion, error: targetCaracterizacionError } = await supabase
        .from("caracterizacion_residuos")
        .insert({
          id_empresa: targetEmpresaId,
          numero_solicitud: targetNumeroSolicitud,
          total_residuos_kg_mes: sourceCaracterizacion.total_residuos_kg_mes ?? 0,
          total_aprovechable_kg_mes: sourceCaracterizacion.total_aprovechable_kg_mes ?? 0,
          porcentaje_total_aprovechable: sourceCaracterizacion.porcentaje_total_aprovechable ?? 0,
          conclusion_automatica: sourceCaracterizacion.conclusion_automatica ?? "",
          creado_por: userId,
        })
        .select("id")
        .single();

      if (targetCaracterizacionError || !targetCaracterizacion?.id) {
        warnings.push("No se pudo clonar la caracterización.");
      } else {
        const { data: sourceCaracterizacionDetails, error: sourceCaracterizacionDetailsError } = await supabase
          .from("caracterizacion_residuos_detalle")
          .select(
            "etapa_generacion, tipo_residuo, material, nombre_rango_etapa, nombre_rango_tipo, cantidad_residuos_kg_mes, cantidad_aprovechable_kg_mes, porcentaje_aprovechable, estrategia, potencial, observaciones",
          )
          .eq("id_caracterizacion", sourceCaracterizacion.id);

        if (sourceCaracterizacionDetailsError) {
          warnings.push("No se pudo leer el detalle de caracterización previo.");
        } else if ((sourceCaracterizacionDetails ?? []).length) {
          const { error: insertCaracterizacionDetailsError } = await supabase
            .from("caracterizacion_residuos_detalle")
            .insert(
              (sourceCaracterizacionDetails ?? []).map((row) => ({
                id_caracterizacion: targetCaracterizacion.id,
                etapa_generacion: row.etapa_generacion,
                tipo_residuo: row.tipo_residuo,
                material: row.material,
                nombre_rango_etapa: row.nombre_rango_etapa,
                nombre_rango_tipo: row.nombre_rango_tipo,
                cantidad_residuos_kg_mes: row.cantidad_residuos_kg_mes,
                cantidad_aprovechable_kg_mes: row.cantidad_aprovechable_kg_mes,
                porcentaje_aprovechable: row.porcentaje_aprovechable,
                estrategia: row.estrategia,
                potencial: row.potencial,
                observaciones: row.observaciones,
              })),
            );

          if (insertCaracterizacionDetailsError) {
            warnings.push("No se pudo clonar el detalle de caracterización.");
          }
        }
      }
    }
  } catch {
    warnings.push("Error inesperado clonando caracterización.");
  }

  // 3) Plan de acción y KPIs
  try {
    const sourcePlanResult = await findBestSourceResult<{
      id: string;
      objetivo: string | null;
      acciones_alta_prioridad: number | null;
      acciones_cerradas: number | null;
      acciones_en_riesgo: number | null;
      cumplimiento_promedio_kpi: number | null;
      estado_general: string | null;
    }>({
      table: "plan_accion_kpis",
      select:
        "id, objetivo, acciones_alta_prioridad, acciones_cerradas, acciones_en_riesgo, cumplimiento_promedio_kpi, estado_general",
      orderBy: "fecha_creacion",
    });

    if (sourcePlanResult?.row?.id) {
      const sourcePlan = sourcePlanResult.row;
      const { data: targetPlan, error: targetPlanError } = await supabase
        .from("plan_accion_kpis")
        .insert({
          id_empresa: targetEmpresaId,
          numero_solicitud: targetNumeroSolicitud,
          objetivo: sourcePlan.objetivo ?? "",
          acciones_alta_prioridad: sourcePlan.acciones_alta_prioridad ?? 0,
          acciones_cerradas: sourcePlan.acciones_cerradas ?? 0,
          acciones_en_riesgo: sourcePlan.acciones_en_riesgo ?? 0,
          cumplimiento_promedio_kpi: sourcePlan.cumplimiento_promedio_kpi ?? 0,
          estado_general: sourcePlan.estado_general ?? "En seguimiento",
          creado_por: userId,
        })
        .select("id")
        .single();

      if (targetPlanError || !targetPlan?.id) {
        warnings.push("No se pudo clonar el plan de acción.");
      } else {
        const [{ data: sourcePlanActions, error: sourcePlanActionsError }, { data: sourcePlanKpis, error: sourcePlanKpisError }] =
          await Promise.all([
            supabase
              .from("plan_accion_detalle")
              .select("fase, accion, responsable, fecha_inicio, fecha_fin, impacto, esfuerzo, indice_prioridad, prioridad, estado")
              .eq("id_plan", sourcePlan.id),
            supabase
              .from("plan_kpi_detalle")
              .select("indicador, valor_actual, valor_meta, porcentaje_cumplimiento")
              .eq("id_plan", sourcePlan.id),
          ]);

        if (sourcePlanActionsError) {
          warnings.push("No se pudo leer el detalle de acciones del plan previo.");
        } else if ((sourcePlanActions ?? []).length) {
          const { error: insertPlanActionsError } = await supabase
            .from("plan_accion_detalle")
            .insert(
              (sourcePlanActions ?? []).map((row) => ({
                id_plan: targetPlan.id,
                fase: row.fase,
                accion: row.accion,
                responsable: row.responsable,
                fecha_inicio: row.fecha_inicio,
                fecha_fin: row.fecha_fin,
                impacto: row.impacto,
                esfuerzo: row.esfuerzo,
                indice_prioridad: row.indice_prioridad,
                prioridad: row.prioridad,
                estado: row.estado,
              })),
            );

          if (insertPlanActionsError) {
            warnings.push("No se pudo clonar el detalle de acciones del plan.");
          }
        }

        if (sourcePlanKpisError) {
          warnings.push("No se pudo leer el detalle de KPIs del plan previo.");
        } else if ((sourcePlanKpis ?? []).length) {
          const { error: insertPlanKpisError } = await supabase
            .from("plan_kpi_detalle")
            .insert(
              (sourcePlanKpis ?? []).map((row) => ({
                id_plan: targetPlan.id,
                indicador: row.indicador,
                valor_actual: row.valor_actual,
                valor_meta: row.valor_meta,
                porcentaje_cumplimiento: row.porcentaje_cumplimiento,
              })),
            );

          if (insertPlanKpisError) {
            warnings.push("No se pudo clonar el detalle de KPIs del plan.");
          }
        }
      }
    }
  } catch {
    warnings.push("Error inesperado clonando plan de acción y KPIs.");
  }

  // 4) Aliados
  try {
    let sourceAliados: Array<{
      nombre_aliado: string | null;
      tipo_aliado: string | null;
      objetivo_alianza: string | null;
      nombre_contacto: string | null;
      celular_contacto: string | null;
      correo_contacto: string | null;
      estado_alianza: string | null;
      observaciones: string | null;
    }> = [];

    for (const candidate of sourceCandidates) {
      const { data, error } = await supabase
        .from("aliados")
        .select(
          "nombre_aliado, tipo_aliado, objetivo_alianza, nombre_contacto, celular_contacto, correo_contacto, estado_alianza, observaciones",
        )
        .eq("id_empresa", candidate.id)
        .eq("numero_solicitud", candidate.numero_solicitud)
        .order("created_at", { ascending: false });

      if (!error && (data ?? []).length) {
        sourceAliados = data ?? [];
        break;
      }
    }

    if (sourceAliados.length) {
      const { error: insertAliadosError } = await supabase.from("aliados").insert(
        sourceAliados.map((row) => ({
          id_empresa: targetEmpresaId,
          numero_solicitud: targetNumeroSolicitud,
          nombre_aliado: row.nombre_aliado,
          tipo_aliado: row.tipo_aliado,
          objetivo_alianza: row.objetivo_alianza,
          nombre_contacto: row.nombre_contacto,
          celular_contacto: row.celular_contacto,
          correo_contacto: row.correo_contacto,
          estado_alianza: row.estado_alianza,
          observaciones: row.observaciones,
          creado_por: userId,
        })),
      );

      if (insertAliadosError) {
        warnings.push("No se pudieron clonar los aliados.");
      }
    }
  } catch {
    warnings.push("Error inesperado clonando aliados.");
  }

  // 5) Matriz de seguimiento
  try {
    const sourceMatrizResult = await findBestSourceResult<{
      id: string;
      promedio_cumplimiento: number | null;
      nivel_cumplimiento: string | null;
      interpretacion: string | null;
    }>({
      table: "seguimiento_resultado",
      select: "id, promedio_cumplimiento, nivel_cumplimiento, interpretacion",
      orderBy: "created_at",
    });

    if (sourceMatrizResult?.row?.id) {
      const sourceMatriz = sourceMatrizResult.row;
      const { data: targetMatriz, error: targetMatrizError } = await supabase
        .from("seguimiento_resultado")
        .insert({
          id_empresa: targetEmpresaId,
          numero_solicitud: targetNumeroSolicitud,
          promedio_cumplimiento: sourceMatriz.promedio_cumplimiento,
          nivel_cumplimiento: sourceMatriz.nivel_cumplimiento,
          interpretacion: sourceMatriz.interpretacion,
          creado_por: userId,
        })
        .select("id")
        .single();

      if (targetMatrizError || !targetMatriz?.id) {
        warnings.push("No se pudo clonar la matriz de seguimiento.");
      } else {
        const { data: sourceMatrizDetails, error: sourceMatrizDetailsError } = await supabase
          .from("seguimiento_etapa")
          .select("etapa, accion, kpi, resultado, cumplimiento")
          .eq("id_resultado", sourceMatriz.id);

        if (sourceMatrizDetailsError) {
          warnings.push("No se pudo leer el detalle de la matriz previa.");
        } else if ((sourceMatrizDetails ?? []).length) {
          const { error: insertMatrizDetailsError } = await supabase
            .from("seguimiento_etapa")
            .insert(
              (sourceMatrizDetails ?? []).map((row) => ({
                id_resultado: targetMatriz.id,
                etapa: row.etapa,
                accion: row.accion,
                kpi: row.kpi,
                resultado: row.resultado,
                cumplimiento: row.cumplimiento,
              })),
            );

          if (insertMatrizDetailsError) {
            warnings.push("No se pudo clonar el detalle de la matriz.");
          }
        }
      }
    }
  } catch {
    warnings.push("Error inesperado clonando matriz de seguimiento.");
  }

  return warnings;
}

type CompanyRegistrationFormProps = {
  inDialog?: boolean;
};

export function CompanyRegistrationForm({ inDialog = false }: CompanyRegistrationFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<CompanyFormState>({
    companyName: "",
    employeeCount: "",
    address: "",
    city: "",
    wasteManager: "",
    phone: "",
    role: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lookupStatus, setLookupStatus] = useState<CompanyLookupStatus>("idle");
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [existingCompanySeed, setExistingCompanySeed] = useState<ExistingCompanySeed | null>(null);

  const companySize = useMemo(() => {
    const parsedValue = Number(formData.employeeCount);
    if (!Number.isFinite(parsedValue) || parsedValue < 0) return "";
    return getCompanySize(parsedValue);
  }, [formData.employeeCount]);

  function resetLookupState() {
    setLookupStatus("idle");
    setLookupMessage(null);
    setExistingCompanySeed(null);
  }

  const updateField = (field: keyof CompanyFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const incomingValue = event.target.value;
    const normalizedLiveValue = field === "employeeCount" ? incomingValue : normalizeUpperInput(incomingValue);

    setFormData((previous) => ({
      ...previous,
      [field]: normalizedLiveValue,
    }));

    if (field === "companyName") {
      resetLookupState();
    }
  };

  async function tryHydrateCompanyByName() {
    const normalizedName = normalizeCompanyNameKey(formData.companyName);

    if (!normalizedName) {
      resetLookupState();
      return;
    }

    setLookupStatus("searching");
    setLookupMessage("Buscando cliente existente...");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      setLookupStatus("error");
      setLookupMessage("No se pudo validar sesión para buscar cliente.");
      return;
    }

    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select(
        "id, numero_solicitud, nombre_empresa, employee_count, direccion, ciudad_municipio, responsable_aprovechamiento, telefono_contacto, cargo_responsable",
      )
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (companiesError) {
      setLookupStatus("error");
      setLookupMessage(companiesError.message || "No se pudo buscar cliente por nombre.");
      return;
    }

    const rows = ((companies ?? []) as CompaniesRow[]).filter((row) =>
      normalizeCompanyNameKey(row.nombre_empresa ?? "") === normalizedName,
    );

    const latest = rows[0] ?? null;

    if (!latest) {
      setLookupStatus("not_found");
      setLookupMessage("CLIENTE NO CREADO. Completá los datos para registrar una nueva evaluación.");
      setExistingCompanySeed(null);
      return;
    }

    setFormData((previous) => ({
      ...previous,
      companyName: normalizeUpperInput(latest.nombre_empresa ?? previous.companyName),
      employeeCount: String(latest.employee_count ?? ""),
      address: normalizeUpperInput(latest.direccion ?? ""),
      city: normalizeUpperInput(latest.ciudad_municipio ?? ""),
      wasteManager: normalizeUpperInput(latest.responsable_aprovechamiento ?? ""),
      phone: normalizeUpperInput(latest.telefono_contacto ?? ""),
      role: normalizeUpperInput(latest.cargo_responsable ?? ""),
    }));

    setExistingCompanySeed({
      id: latest.id,
      numero_solicitud: latest.numero_solicitud,
      normalizedName,
      candidates: rows.map((row) => ({ id: row.id, numero_solicitud: row.numero_solicitud })),
    });
    setLookupStatus("found");
    setLookupMessage(
      `Cliente encontrado. Se cargaron datos de la solicitud ${latest.numero_solicitud} para iniciar una nueva evaluación.`,
    );
  }

  const baseInputClasses = "mt-2 h-12 w-full rounded-xl border border-[var(--outline)] !bg-white px-4";

  const formFields: Array<{ key: keyof CompanyFormState; label: string; type?: "text" | "tel" | "number" }> = [
    { key: "companyName", label: REGISTRO_EMPRESA_COPY.fields.companyName },
    { key: "employeeCount", label: REGISTRO_EMPRESA_COPY.fields.employeeCount, type: "number" },
    { key: "address", label: REGISTRO_EMPRESA_COPY.fields.address },
    { key: "city", label: REGISTRO_EMPRESA_COPY.fields.city },
    { key: "wasteManager", label: REGISTRO_EMPRESA_COPY.fields.wasteManager },
    { key: "phone", label: REGISTRO_EMPRESA_COPY.fields.phone, type: "tel" },
    { key: "role", label: REGISTRO_EMPRESA_COPY.fields.role },
  ];

  const isRequiredFieldFilled = [
    formData.companyName,
    formData.employeeCount,
    formData.address,
    formData.city,
    formData.wasteManager,
    formData.phone,
  ].every((value) => value.trim().length > 0);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isRequiredFieldFilled) {
      setErrorMessage(REGISTRO_EMPRESA_COPY.requiredFieldsError);
      return;
    }

    const employeeCount = Number(formData.employeeCount);
    if (!Number.isInteger(employeeCount) || employeeCount < 0 || !companySize) {
      setErrorMessage(REGISTRO_EMPRESA_COPY.invalidEmployeeCountError);
      return;
    }

    const normalizedCompanyName = sanitizeForSave(formData.companyName);
    const sanitizedCity = sanitizeForSave(formData.city);
    const sanitizedAddress = sanitizeForSave(formData.address);
    const sanitizedWasteManager = sanitizeForSave(formData.wasteManager);
    const sanitizedPhone = sanitizeForSave(formData.phone);
    const sanitizedRole = sanitizeForSave(formData.role);

    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: requestNumber, error: requestNumberError } = await supabase.rpc("next_numero_solicitud");

      if (requestNumberError || !requestNumber) {
        setErrorMessage(requestNumberError?.message || REGISTRO_EMPRESA_COPY.submitErrorFallback);
        return;
      }

      const { data: insertedCompany, error } = await supabase
        .from("companies")
        .insert({
          numero_solicitud: requestNumber,
          nombre_empresa: normalizedCompanyName,
          ciudad_municipio: sanitizedCity,
          direccion: sanitizedAddress,
          employee_count: employeeCount,
          tamano_empresa: companySize,
          responsable_aprovechamiento: sanitizedWasteManager,
          telefono_contacto: sanitizedPhone,
          cargo_responsable: sanitizedRole || null,
          created_by: user?.id ?? null,
          paso_actual: 2,
          estado_flujo: "en_proceso",
        })
        .select("id, numero_solicitud")
        .single();

      if (error) {
        setErrorMessage(error.message || REGISTRO_EMPRESA_COPY.submitErrorFallback);
        return;
      }

      const assignedRequestNumber = insertedCompany?.numero_solicitud ?? requestNumber;
      const shouldCloneFromExisting =
        Boolean(existingCompanySeed?.id) &&
        existingCompanySeed?.normalizedName === normalizeCompanyNameKey(normalizedCompanyName) &&
        Boolean(insertedCompany?.id);

      if (shouldCloneFromExisting && insertedCompany?.id) {
        const cloneWarnings = await cloneEvaluationDataFromSource({
          supabase,
          sourceCandidates: existingCompanySeed!.candidates,
          targetEmpresaId: insertedCompany.id,
          targetNumeroSolicitud: assignedRequestNumber,
          userId: user?.id ?? null,
        });

        if (cloneWarnings.length) {
          setSuccessMessage(
            `${REGISTRO_EMPRESA_COPY.submitSuccess} ${REGISTRO_EMPRESA_COPY.requestNumberLabel}: ${assignedRequestNumber}. Se clonó la base anterior con advertencias.`,
          );
        } else {
          setSuccessMessage(
            `${REGISTRO_EMPRESA_COPY.submitSuccess} ${REGISTRO_EMPRESA_COPY.requestNumberLabel}: ${assignedRequestNumber}. Se clonaron todos los datos de la evaluación anterior.`,
          );
        }
      } else {
        setSuccessMessage(
          `${REGISTRO_EMPRESA_COPY.submitSuccess} ${REGISTRO_EMPRESA_COPY.requestNumberLabel}: ${assignedRequestNumber}`,
        );
      }

      const nextUrl = `${APP_ROUTES.autodiagnostico}?empresa=${insertedCompany?.id ?? ""}&sol=${assignedRequestNumber}`;
      router.push(nextUrl);
    } catch {
      setErrorMessage(REGISTRO_EMPRESA_COPY.submitErrorFallback);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={inDialog ? "" : "mx-auto max-w-4xl rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm md:p-8"}>
      <p className="mb-6 text-slate-600">{REGISTRO_EMPRESA_COPY.intro}</p>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          {formFields.map((field) => (
            <label key={field.key} className="text-sm font-medium text-slate-700">
              {field.label}
              <input
                type={field.type ?? "text"}
                min={field.type === "number" ? 0 : undefined}
                required={field.key !== "role"}
                value={formData[field.key]}
                onChange={updateField(field.key)}
                onBlur={field.key === "companyName" ? () => { void tryHydrateCompanyByName(); } : undefined}
                className={baseInputClasses}
              />
              {field.key === "companyName" && lookupMessage ? (
                <span
                  className={`mt-2 block text-xs font-semibold ${
                    lookupStatus === "found"
                      ? "text-emerald-700"
                      : lookupStatus === "searching"
                        ? "text-slate-500"
                        : "text-red-600"
                  }`}
                >
                  {lookupMessage}
                </span>
              ) : null}
            </label>
          ))}
          <label className="text-sm font-medium text-slate-700">
            {REGISTRO_EMPRESA_COPY.fields.size}
            <input
              value={companySize}
              readOnly
              disabled
              className={`${baseInputClasses} cursor-not-allowed !border-slate-300 !bg-slate-200 !text-slate-600 opacity-100 disabled:opacity-100`}
            />
          </label>
        </div>

        {errorMessage ? <p className="mt-4 text-sm font-medium text-red-600">{errorMessage}</p> : null}
        {successMessage ? <p className="mt-4 text-sm font-medium text-emerald-700">{successMessage}</p> : null}

        <div className="mt-6 flex justify-end gap-3">
          <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[var(--primary)] px-5 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? REGISTRO_EMPRESA_COPY.submitLoading : REGISTRO_EMPRESA_COPY.next}
          </button>
        </div>
      </form>
    </section>
  );
}
