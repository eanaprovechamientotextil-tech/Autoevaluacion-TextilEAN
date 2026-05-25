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

function getCompanySize(employeeCount: number) {
  if (employeeCount < 50) return REGISTRO_EMPRESA_COPY.sizeValues.small;
  if (employeeCount < 250) return REGISTRO_EMPRESA_COPY.sizeValues.medium;
  return REGISTRO_EMPRESA_COPY.sizeValues.large;
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

  const companySize = useMemo(() => {
    const parsedValue = Number(formData.employeeCount);
    if (!Number.isFinite(parsedValue) || parsedValue < 0) return "";
    return getCompanySize(parsedValue);
  }, [formData.employeeCount]);

  const updateField = (field: keyof CompanyFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

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
          nombre_empresa: formData.companyName.trim(),
          ciudad_municipio: formData.city.trim(),
          direccion: formData.address.trim(),
          employee_count: employeeCount,
          tamano_empresa: companySize,
          responsable_aprovechamiento: formData.wasteManager.trim(),
          telefono_contacto: formData.phone.trim(),
          cargo_responsable: formData.role.trim() || null,
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
      setSuccessMessage(`${REGISTRO_EMPRESA_COPY.submitSuccess} ${REGISTRO_EMPRESA_COPY.requestNumberLabel}: ${assignedRequestNumber}`);
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
                className={baseInputClasses}
              />
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
