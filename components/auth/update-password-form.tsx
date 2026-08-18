"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UPDATE_PASSWORD_COPY } from "@/src/constants/copy";
import { APP_ROUTES } from "@/src/constants/routes";

type SessionState = "loading" | "valid" | "invalid";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setSessionState(data.session ? "valid" : "invalid");
    });
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!password || !confirmPassword) {
      setErrorMessage(UPDATE_PASSWORD_COPY.requiredFields);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(UPDATE_PASSWORD_COPY.passwordMismatch);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message || UPDATE_PASSWORD_COPY.error);
      setIsLoading(false);
      return;
    }

    setSuccessMessage(UPDATE_PASSWORD_COPY.success);
    setIsLoading(false);
    setPassword("");
    setConfirmPassword("");

    setTimeout(() => router.push(APP_ROUTES.login), 3000);
  };

  if (sessionState === "loading") {
    return (
      <div className="space-y-6">
        <p className="text-center text-slate-500">Verificando enlace...</p>
      </div>
    );
  }

  if (sessionState === "invalid") {
    return (
      <div className="space-y-6">
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {UPDATE_PASSWORD_COPY.invalidToken}
        </p>
        <Link
          href={APP_ROUTES.forgotPassword}
          className="block text-center font-bold text-[var(--primary)] hover:underline"
        >
          Solicitar un nuevo enlace
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="password" className="ml-1 block text-sm font-medium text-slate-700">
          {UPDATE_PASSWORD_COPY.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={UPDATE_PASSWORD_COPY.passwordPlaceholder}
          className="h-14 w-full rounded-2xl border border-transparent bg-[var(--surface-subtle)] px-4 text-base placeholder:text-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-cyan-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirm-password"
          className="ml-1 block text-sm font-medium text-slate-700"
        >
          {UPDATE_PASSWORD_COPY.confirmPassword}
        </label>
        <input
          id="confirm-password"
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder={UPDATE_PASSWORD_COPY.confirmPasswordPlaceholder}
          className="h-14 w-full rounded-2xl border border-transparent bg-[var(--surface-subtle)] px-4 text-base placeholder:text-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-cyan-100"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="h-14 w-full rounded-2xl bg-[var(--primary)] px-4 text-base font-bold text-white shadow-lg shadow-cyan-900/20 transition hover:bg-[#0077c2] disabled:cursor-not-allowed disabled:opacity-80"
      >
        {isLoading ? UPDATE_PASSWORD_COPY.submitLoading : UPDATE_PASSWORD_COPY.submit}
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
          {UPDATE_PASSWORD_COPY.backToLogin}
        </Link>
      </p>
    </form>
  );
}
