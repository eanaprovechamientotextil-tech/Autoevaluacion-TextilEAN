import Image from "next/image";
import Link from "next/link";
import { HOME_DASHBOARD_COPY, PLATFORM_COPY } from "@/src/constants/copy";
import { APP_ROUTES } from "@/src/constants/routes";

export function DashboardHome() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--outline)]/30 bg-white/80 px-4 backdrop-blur-md md:px-12">
        <p className="text-3xl font-extrabold text-[var(--primary)]">{PLATFORM_COPY.brand}</p>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-12">
        <section className="grid items-center gap-10 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <span className="inline-flex rounded-full bg-[#d0e4ff] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#00497b]">{HOME_DASHBOARD_COPY.heroBadge}</span>
            <h1 className="text-4xl font-extrabold leading-tight text-[var(--primary)] md:text-5xl">{HOME_DASHBOARD_COPY.title}</h1>
            <p className="max-w-3xl text-lg text-slate-600">{HOME_DASHBOARD_COPY.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={APP_ROUTES.login} className="rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg">
                {HOME_DASHBOARD_COPY.ctaPrimary}
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[560px] lg:col-span-5">
            <Image
              src="/general.png"
              alt="Hoja de ruta de aprovechamiento textil"
              width={900}
              height={900}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </section>
      </main>
    </div>
  );
}
