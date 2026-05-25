"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/prototype/dashboard-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VINCULACION_COPY } from "@/src/constants/copy";
import { SolicitudSelector } from "@/components/prototype/solicitud-selector";
import { APP_ROUTES } from "@/src/constants/routes";
import { createClient } from "@/lib/supabase/client";

type AliadoForm = {
  id?: string;
  name: string;
  type: string;
  goal: string;
  contactName: string;
  mobile: string;
  email: string;
  status: string;
  observations: string;
};

const INITIAL_FORM: AliadoForm = {
  name: "",
  type: "Formacion",
  goal: "",
  contactName: "",
  mobile: "",
  email: "",
  status: "Activa",
  observations: "",
};

function VinculacionAliadosContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const empresa = searchParams.get("empresa") ?? "";
  const sol = searchParams.get("sol") ?? "";
  const hasSelectedSolicitud = Boolean(empresa && sol);
  const [aliados, setAliados] = useState<AliadoForm[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AliadoForm>({ defaultValues: INITIAL_FORM });

  const tableHeadClasses = "border-b border-[var(--outline)]/40 px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600 whitespace-normal break-words";
  const tableCellClasses = "border-b border-[var(--outline)]/20 px-3 py-2 align-top text-xs text-slate-700 whitespace-normal break-words";
  const errorClasses = "mt-1 block text-xs text-red-600";

  function onSubmit(values: AliadoForm) {
    if (!hasSelectedSolicitud) return;
    setSubmitError(null);

    const next: AliadoForm = {
      id: crypto.randomUUID(),
      name: values.name.trim(),
      type: values.type.trim(),
      goal: values.goal.trim(),
      contactName: values.contactName.trim(),
      mobile: values.mobile.trim(),
      email: values.email.trim(),
      status: values.status.trim(),
      observations: values.observations.trim(),
    };

    setAliados((prev) => [...prev, next]);
    reset(INITIAL_FORM);
    setIsDialogOpen(false);
  }

  function handleRemove(idToRemove?: string) {
    if (!idToRemove) return;
    setSubmitError(null);

    setAliados((prev) => prev.filter((row) => row.id !== idToRemove));
  }

  async function handleSaveAndContinue() {
    if (!hasSelectedSolicitud) return;
    setSubmitError(null);
    setIsSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.id) {
        setSubmitError(userError?.message || "Debes iniciar sesión para guardar aliados.");
        return;
      }

      const { error: deleteError } = await supabase
        .from("aliados")
        .delete()
        .eq("id_empresa", empresa)
        .eq("numero_solicitud", sol);

      if (deleteError) {
        setSubmitError(deleteError.message || "No se pudo limpiar aliados anteriores.");
        return;
      }

      if (aliados.length) {
        const { error: insertError } = await supabase.from("aliados").insert(
          aliados.map((row) => ({
            id_empresa: empresa,
            numero_solicitud: sol,
            nombre_aliado: row.name,
            tipo_aliado: row.type,
            objetivo_alianza: row.goal,
            nombre_contacto: row.contactName,
            celular_contacto: row.mobile,
            correo_contacto: row.email,
            estado_alianza: row.status,
            observaciones: row.observations,
            creado_por: user.id,
          })),
        );

        if (insertError) {
          setSubmitError(insertError.message || "No se pudieron guardar los aliados.");
          return;
        }
      }

    router.push(`${APP_ROUTES.matrizSeguimiento}?empresa=${encodeURIComponent(empresa)}&sol=${encodeURIComponent(sol)}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DashboardShell title={VINCULACION_COPY.title} stepLabel={VINCULACION_COPY.stepLabel} progressLabel={VINCULACION_COPY.progress}>
      <section className="mx-auto w-full max-w-[96vw] rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <SolicitudSelector />
        </div>
        {!hasSelectedSolicitud ? (
          <p className="rounded-2xl border border-dashed border-[var(--outline)]/40 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Selecciona una solicitud para habilitar el formulario de vinculacion de aliados.
          </p>
        ) : null}
        {hasSelectedSolicitud ? (
          <>
        <p className="mb-5 text-slate-600">{VINCULACION_COPY.description}</p>
        <p className="mb-5 rounded-xl bg-[var(--surface-subtle)] p-4 text-sm text-slate-700">
          <span className="font-semibold">Objetivo:</span> Identificar, registrar y priorizar aliados estrategicos que contribuyan al fortalecimiento de procesos de economia circular, aprovechamiento textil, sostenibilidad y articulacion empresarial dentro de las empresas lideradas por mujeres del sector textil.
        </p>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-bold">{VINCULACION_COPY.listTitle}</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded-xl bg-[var(--secondary)] px-5 py-2.5 text-sm font-bold text-white"
              >
                Ingresar aliado
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto border border-sky-200/70 bg-gradient-to-b from-sky-50 to-white shadow-xl shadow-sky-100/60 sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-slate-900">Ingresar aliado estrategico</DialogTitle>
                <DialogDescription className="text-slate-600">Completa los campos para registrar un aliado en la tabla.</DialogDescription>
              </DialogHeader>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  {VINCULACION_COPY.fields.name}
                  <input
                    {...register("name", { required: "El aliado es obligatorio" })}
                    className="mt-2 h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    placeholder="Ej. EcoTextil S.A."
                  />
                  {errors.name && <span className={errorClasses}>{errors.name.message}</span>}
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  {VINCULACION_COPY.fields.type}
                  <select
                    {...register("type", { required: "El tipo es obligatorio" })}
                    className="mt-2 h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  >
                    <option>Formacion</option>
                    <option>Institucional</option>
                    <option>Social</option>
                    <option>Aprovechamiento</option>
                  </select>
                  {errors.type && <span className={errorClasses}>{errors.type.message}</span>}
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Estado
                  <select
                    {...register("status", { required: "El estado es obligatorio" })}
                    className="mt-2 h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  >
                    <option>Activa</option>
                    <option>En proceso</option>
                    <option>Inactiva</option>
                  </select>
                  {errors.status && <span className={errorClasses}>{errors.status.message}</span>}
                </label>
                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  {VINCULACION_COPY.fields.goal}
                  <textarea
                    {...register("goal", { required: "El objetivo es obligatorio" })}
                    className="mt-2 w-full rounded-xl border border-sky-200 bg-white p-4 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    rows={3}
                  />
                  {errors.goal && <span className={errorClasses}>{errors.goal.message}</span>}
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Nombre del contacto
                  <input
                    {...register("contactName", { required: "El contacto es obligatorio" })}
                    className="mt-2 h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    placeholder="Nombre de la persona enlace"
                  />
                  {errors.contactName && <span className={errorClasses}>{errors.contactName.message}</span>}
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Numero celular
                  <input
                    {...register("mobile", {
                      required: "El celular es obligatorio",
                      minLength: { value: 7, message: "Debe tener al menos 7 digitos" },
                    })}
                    className="mt-2 h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    placeholder="3001234567"
                  />
                  {errors.mobile && <span className={errorClasses}>{errors.mobile.message}</span>}
                </label>
                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  Correo electronico
                  <input
                    type="email"
                    {...register("email", {
                      required: "El correo es obligatorio",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Ingresa un correo valido",
                      },
                    })}
                    className="mt-2 h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    placeholder="contacto@aliado.com"
                  />
                  {errors.email && <span className={errorClasses}>{errors.email.message}</span>}
                </label>
                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  Observaciones
                  <textarea
                    {...register("observations", { required: "Las observaciones son obligatorias" })}
                    className="mt-2 w-full rounded-xl border border-sky-200 bg-white p-4 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    rows={2}
                  />
                  {errors.observations && <span className={errorClasses}>{errors.observations.message}</span>}
                </label>
                <button type="submit" disabled={isSaving} className="sm:col-span-2 rounded-xl bg-sky-700 px-5 py-3 font-bold text-white shadow-md shadow-sky-200 transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSaving ? "Guardando..." : "Guardar aliado"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {!aliados.length ? (
          <p className="rounded-xl border border-dashed border-[var(--outline)]/40 p-6 text-sm text-slate-500">
            No hay aliados registrados. Usa el boton Ingresar aliado para agregar el primero.
          </p>
        ) : (
          <div className="rounded-xl border border-[var(--outline)]/25 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] table-auto">
                <colgroup>
                  <col style={{ minWidth: "170px" }} />
                  <col style={{ minWidth: "130px" }} />
                  <col style={{ minWidth: "260px" }} />
                  <col style={{ minWidth: "180px" }} />
                  <col style={{ minWidth: "140px" }} />
                  <col style={{ minWidth: "220px" }} />
                  <col style={{ minWidth: "100px" }} />
                  <col style={{ minWidth: "170px" }} />
                  <col style={{ minWidth: "90px" }} />
                </colgroup>
                <thead className="bg-[var(--surface-subtle)]">
                  <tr>
                    <th className={tableHeadClasses}>Aliado estrategico</th>
                    <th className={tableHeadClasses}>Tipo de aliado</th>
                    <th className={tableHeadClasses}>Objetivo de la alianza</th>
                    <th className={tableHeadClasses}>Nombre del contacto</th>
                    <th className={tableHeadClasses}>Numero celular</th>
                    <th className={tableHeadClasses}>Correo electronico</th>
                    <th className={tableHeadClasses}>Estado</th>
                    <th className={tableHeadClasses}>Observaciones</th>
                    <th className={`${tableHeadClasses} text-center`}>Acciones</th>
                  </tr>
                </thead>
              <tbody>
                {aliados.map((aliado, index) => (
                  <tr key={aliado.id ?? `${aliado.name}-${index}`}>
                    <td className={`${tableCellClasses} font-semibold text-slate-900`}>{aliado.name}</td>
                    <td className={tableCellClasses}>{aliado.type}</td>
                    <td className={tableCellClasses}>{aliado.goal}</td>
                    <td className={tableCellClasses}>{aliado.contactName}</td>
                    <td className={tableCellClasses}>{aliado.mobile}</td>
                    <td className={tableCellClasses}>{aliado.email}</td>
                    <td className={tableCellClasses}>{aliado.status}</td>
                    <td className={tableCellClasses}>{aliado.observations}</td>
                    <td className={`${tableCellClasses} text-center`}>
                      <button
                        type="button"
                        onClick={() => handleRemove(aliado.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-base font-bold text-red-600 hover:bg-red-50"
                        aria-label="Borrar aliado"
                        title="Borrar aliado"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSaveAndContinue}
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 font-bold text-white transition hover:brightness-110"
          >
            Guardar y continuar
          </button>
        </div>
        {submitError ? <p className="mt-3 text-sm font-medium text-red-600">{submitError}</p> : null}
          </>
        ) : null}
      </section>
    </DashboardShell>
  );
}

export default function VinculacionAliadosPage() {
  return (
    <Suspense fallback={<section className="mx-auto w-full max-w-6xl p-6 text-sm text-slate-600">Cargando vinculación de aliados...</section>}>
      <VinculacionAliadosContent />
    </Suspense>
  );
}
