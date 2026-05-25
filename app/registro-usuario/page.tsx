import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { SIGNUP_COPY } from "@/src/constants/copy";
import { APP_ROUTES } from "@/src/constants/routes";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(0,94,154,0.08),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(111,72,178,0.08),_transparent_40%),#f8f9ff] px-4 pt-24 pb-10">
      <div className="pointer-events-none absolute -top-20 -right-24 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

      <header className="fixed top-0 left-0 z-20 flex h-16 w-full items-center justify-center border-b border-white/20 bg-white/70 backdrop-blur-md">
        <Link href={APP_ROUTES.home} className="text-2xl font-extrabold tracking-tight text-[var(--primary)]">
          {SIGNUP_COPY.brand}
        </Link>
      </header>

      <section className="relative mx-auto w-full max-w-[440px]">
        <div className="overflow-hidden rounded-3xl border border-[var(--outline)] bg-white p-8 shadow-xl shadow-cyan-900/10 md:p-10">
          <div className="mb-6 h-1.5 w-full rounded-full bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--tertiary)]" />
          <h1 className="mb-2 text-3xl font-extrabold text-slate-900">{SIGNUP_COPY.title}</h1>
          <p className="mb-6 text-slate-600">{SIGNUP_COPY.subtitle}</p>

          <SignupForm />
        </div>
      </section>
    </main>
  );
}
