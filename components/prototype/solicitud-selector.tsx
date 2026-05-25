"use client";

import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type SolicitudOption = {
  id: string;
  numero_solicitud: string;
  nombre_empresa: string | null;
  paso_actual: number | null;
};

type SolicitudSelectorProps = {
  paso?: number;
};

export function SolicitudSelector({ paso }: SolicitudSelectorProps) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [options, setOptions] = useState<SolicitudOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const empresa = searchParams.get("empresa") ?? "";
  const sol = searchParams.get("sol") ?? "";
  const selectedValue = empresa && sol ? `${empresa}::${sol}` : "";

  useEffect(() => {
    let mounted = true;

    async function loadPendingOptions() {
      setIsLoading(true);
      setError(null);

      const { data: baseRows, error: queryError } = await supabase
        .from("companies")
        .select("id, numero_solicitud, nombre_empresa, paso_actual")
        .in("estado_flujo", ["pendiente", "en_proceso"])
        .order("created_at", { ascending: true });

      if (!mounted) return;

      if (queryError) {
        setError(queryError.message || "No se pudieron cargar solicitudes pendientes.");
        setOptions([]);
      } else {
        const baseOptions = (baseRows ?? []) as SolicitudOption[];
        if (!paso || !baseOptions.length) {
          setOptions(baseOptions);
          setIsLoading(false);
          return;
        }

        const companyIds = baseOptions.map((row) => row.id);
        const requestNumbers = baseOptions.map((row) => row.numero_solicitud);

        const diagResult = await supabase
          .from("diagnosticos")
          .select("id_empresa, numero_solicitud")
          .in("id_empresa", companyIds)
          .in("numero_solicitud", requestNumbers);

        if (diagResult.error) {
          setError(diagResult.error.message || "No se pudo validar el estado del paso.");
          setOptions(baseOptions);
          setIsLoading(false);
          return;
        }

        const diagKeys = new Set((diagResult.data ?? []).map((row) => `${row.id_empresa}::${row.numero_solicitud}`));

        let caracKeys = new Set<string>();
        if (paso === 3 || paso === 4 || paso === 5) {
          const caracResult = await supabase
            .from("caracterizacion_residuos")
            .select("id_empresa, numero_solicitud")
            .in("id_empresa", companyIds)
            .in("numero_solicitud", requestNumbers);

          if (caracResult.error) {
            setError(caracResult.error.message || "No se pudo validar el estado del paso.");
            setOptions(baseOptions);
            setIsLoading(false);
            return;
          }

          caracKeys = new Set((caracResult.data ?? []).map((row) => `${row.id_empresa}::${row.numero_solicitud}`));
        }

        let planKeys = new Set<string>();
        if (paso === 4 || paso === 5) {
          const planResult = await supabase
            .from("plan_accion_kpis")
            .select("id_empresa, numero_solicitud")
            .in("id_empresa", companyIds)
            .in("numero_solicitud", requestNumbers);

          if (planResult.error) {
            setError(planResult.error.message || "No se pudo validar el estado del paso.");
            setOptions(baseOptions);
            setIsLoading(false);
            return;
          }

          planKeys = new Set((planResult.data ?? []).map((row) => `${row.id_empresa}::${row.numero_solicitud}`));
        }

        let matrizKeys = new Set<string>();
        if (paso === 5) {
          const matrizResult = await supabase
            .from("seguimiento_resultado")
            .select("id_empresa, numero_solicitud")
            .in("id_empresa", companyIds)
            .in("numero_solicitud", requestNumbers);

          if (matrizResult.error) {
            setError(matrizResult.error.message || "No se pudo validar el estado del paso.");
            setOptions(baseOptions);
            setIsLoading(false);
            return;
          }

          matrizKeys = new Set((matrizResult.data ?? []).map((row) => `${row.id_empresa}::${row.numero_solicitud}`));
        }

        const filtered = baseOptions.filter((row) => {
          const key = `${row.id}::${row.numero_solicitud}`;
          if (paso === 2) return !diagKeys.has(key);
          if (paso === 3) return diagKeys.has(key) && !caracKeys.has(key);
          if (paso === 4) return caracKeys.has(key) && !planKeys.has(key);
          if (paso === 5) return planKeys.has(key) && !matrizKeys.has(key);
          return true;
        });

        setOptions(filtered);
      }

      setIsLoading(false);
    }

    loadPendingOptions().catch(() => {
      if (!mounted) return;
      setError("No se pudieron cargar solicitudes pendientes.");
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [paso, supabase]);

  const helperText = useMemo(() => {
    if (isLoading) return "Cargando solicitudes pendientes...";
    if (error) return error;
    if (!options.length) return paso ? `No hay solicitudes pendientes para el paso ${paso}.` : "No hay solicitudes en proceso.";
    if (!selectedValue) return "Seleccioná una solicitud para continuar con este formulario.";
    return null;
  }, [error, isLoading, options.length, paso, selectedValue]);

  function handleSelectChange(value: string) {
    if (!value) return;
    const [nextEmpresa, nextSol] = value.split("::");
    if (!nextEmpresa || !nextSol) return;
    router.push(`${pathname}?empresa=${encodeURIComponent(nextEmpresa)}&sol=${encodeURIComponent(nextSol)}`);
  }

  return (
    <article className="rounded-2xl border border-[var(--outline)]/30 bg-white p-4 shadow-sm">
      <label className="block text-sm font-semibold text-slate-700">
        Solicitud en proceso (paso {paso})
        <select
          value={selectedValue}
          onChange={(event) => handleSelectChange(event.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-[var(--outline)] bg-white px-3"
          disabled={isLoading || !options.length}
        >
          <option value="">Seleccionar solicitud...</option>
          {options.map((option) => (
            <option key={`${option.id}-${option.numero_solicitud}`} value={`${option.id}::${option.numero_solicitud}`}>
              {option.numero_solicitud} - {option.nombre_empresa ?? "Empresa sin nombre"}
            </option>
          ))}
        </select>
      </label>
      {helperText ? <p className="mt-2 text-xs text-slate-500">{helperText}</p> : null}
    </article>
  );
}
