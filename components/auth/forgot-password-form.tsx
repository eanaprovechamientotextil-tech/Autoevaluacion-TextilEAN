"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FORGOT_COPY } from "@/src/constants/copy";
import { APP_ROUTES } from "@/src/constants/routes";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage(FORGOT_COPY.requiredFields);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${APP_ROUTES.updatePassword}`,
    });

    if (error) {
      setErrorMessage(error.message || FORGOT_COPY.error);
      setIsLoading(false);
      return;
    }

    setSuccessMessage(FORGOT_COPY.success);
    setIsLoading(false);
    setEmail("");
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="ml-1 block text-sm font-medium text-slate-700">
          {FORGOT_COPY.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={FORGOT_COPY.emailPlaceholder}
          className="h-14 w-full rounded-2xl border border-transparent bg-[var(--surface-subtle)] px-4 text-base placeholder:text-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-cyan-100"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="h-14 w-full rounded-2xl bg-[var(--primary)] px-4 text-base font-bold text-white shadow-lg shadow-cyan-900/20 transition hover:bg-[#0077c2] disabled:cursor-not-allowed disabled:opacity-80"
      >
        {isLoading ? FORGOT_COPY.submitLoading : FORGOT_COPY.submit}
      </button>

      {errorMessage ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <p className="text-center text-slate-600">
        <Link href={APP_ROUTES.login} className="font-bold text-[var(--primary)] hover:underline">
          {FORGOT_COPY.backToLogin}
        </Link>
      </p>
    </form>
  );
}
