"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LOGIN_COPY } from "@/src/constants/copy";
import { APP_ROUTES } from "@/src/constants/routes";

type FormState = {
  email: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!formData.email || !formData.password) {
      setErrorMessage(LOGIN_COPY.requiredFields);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setErrorMessage(error.message || LOGIN_COPY.authErrorFallback);
      setIsLoading(false);
      return;
    }

    router.push(APP_ROUTES.homeApp);
    router.refresh();
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="ml-1 block text-sm font-medium text-slate-700">
          {LOGIN_COPY.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, email: event.target.value }))
          }
          placeholder={LOGIN_COPY.emailPlaceholder}
          className="h-14 w-full rounded-2xl border border-transparent bg-[var(--surface-subtle)] px-4 text-base placeholder:text-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-cyan-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="ml-1 block text-sm font-medium text-slate-700">
          {LOGIN_COPY.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, password: event.target.value }))
          }
          placeholder={LOGIN_COPY.passwordPlaceholder}
          className="h-14 w-full rounded-2xl border border-transparent bg-[var(--surface-subtle)] px-4 text-base placeholder:text-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-cyan-100"
        />
      </div>

      <div className="flex items-center justify-between py-1 text-sm">
        <label className="flex items-center gap-2 text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-[var(--outline)]" />
          <span>{LOGIN_COPY.remember}</span>
        </label>
        <Link className="font-semibold text-[var(--primary)] hover:underline" href="#">
          {LOGIN_COPY.forgot}
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="h-14 w-full rounded-2xl bg-[var(--primary)] px-4 text-base font-bold text-white shadow-lg shadow-cyan-900/20 transition hover:bg-[#0077c2] disabled:cursor-not-allowed disabled:opacity-80"
      >
        {isLoading ? LOGIN_COPY.submitLoading : LOGIN_COPY.submit}
      </button>

      {errorMessage ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
