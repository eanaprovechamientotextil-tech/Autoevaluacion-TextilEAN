"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SIGNUP_COPY } from "@/src/constants/copy";
import { APP_ROUTES } from "@/src/constants/routes";

type FormState = {
  email: string;
  password: string;
  confirmPassword: string;
};

export function SignupForm() {
  const [formData, setFormData] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage(SIGNUP_COPY.requiredFields);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(SIGNUP_COPY.passwordMismatch);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setErrorMessage(error.message || SIGNUP_COPY.authErrorFallback);
      setIsLoading(false);
      return;
    }

    const needsEmailConfirmation = !data.session;
    setSuccessMessage(
      needsEmailConfirmation
        ? SIGNUP_COPY.successEmailConfirmation
        : SIGNUP_COPY.successDirect
    );
    setIsLoading(false);
    setFormData({ email: "", password: "", confirmPassword: "" });
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="ml-1 block text-sm font-medium text-slate-700">
          {SIGNUP_COPY.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
          placeholder={SIGNUP_COPY.emailPlaceholder}
          className="h-14 w-full rounded-2xl border border-transparent bg-[var(--surface-subtle)] px-4 text-base placeholder:text-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-cyan-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="ml-1 block text-sm font-medium text-slate-700">
          {SIGNUP_COPY.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={formData.password}
          onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
          placeholder={SIGNUP_COPY.passwordPlaceholder}
          className="h-14 w-full rounded-2xl border border-transparent bg-[var(--surface-subtle)] px-4 text-base placeholder:text-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-cyan-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirm-password"
          className="ml-1 block text-sm font-medium text-slate-700"
        >
          {SIGNUP_COPY.confirmPassword}
        </label>
        <input
          id="confirm-password"
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={formData.confirmPassword}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }))
          }
          placeholder={SIGNUP_COPY.confirmPasswordPlaceholder}
          className="h-14 w-full rounded-2xl border border-transparent bg-[var(--surface-subtle)] px-4 text-base placeholder:text-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-cyan-100"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="h-14 w-full rounded-2xl bg-[var(--primary)] px-4 text-base font-bold text-white shadow-lg shadow-cyan-900/20 transition hover:bg-[#0077c2] disabled:cursor-not-allowed disabled:opacity-80"
      >
        {isLoading ? SIGNUP_COPY.submitLoading : SIGNUP_COPY.submit}
      </button>

      {errorMessage ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
      ) : null}

      <p className="text-center text-slate-600">
        {SIGNUP_COPY.alreadyHaveAccount}{" "}
        <Link href={APP_ROUTES.login} className="font-bold text-[var(--primary)] hover:underline">
          {SIGNUP_COPY.loginLink}
        </Link>
      </p>
    </form>
  );
}
