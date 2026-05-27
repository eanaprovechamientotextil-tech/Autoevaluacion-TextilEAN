import Image from "next/image";
import Link from "next/link";
import { HOME_DASHBOARD_COPY, PLATFORM_COPY } from "@/src/constants/copy";
import { APP_ROUTES } from "@/src/constants/routes";

export function DashboardHome() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#ecfde4_0%,#d8f6d1_34%,#e9f3ff_68%,#fff0dd_100%)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(122,201,67,0.60)_0%,_rgba(122,201,67,0)_72%)] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-8 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,_rgba(0,94,154,0.35)_0%,_rgba(0,94,154,0)_72%)] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,_rgba(247,176,96,0.42)_0%,_rgba(247,176,96,0)_74%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(125deg,rgba(24,28,33,0.14)_1px,transparent_1px),linear-gradient(55deg,rgba(24,28,33,0.10)_1px,transparent_1px)] [background-size:32px_32px]" />
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--outline)]/30 bg-white/80 px-4 backdrop-blur-md md:px-12">
        <p className="text-3xl font-extrabold text-[var(--brand)]">{PLATFORM_COPY.brand}</p>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 md:px-12">
        <section className="grid items-center gap-10 rounded-3xl border border-white/70 bg-white/78 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm lg:grid-cols-12 lg:p-10">
          <div className="space-y-5 lg:col-span-7">
            <h1 className="text-4xl font-extrabold leading-tight text-[var(--primary)] md:text-5xl">{HOME_DASHBOARD_COPY.title}</h1>
            <p className="max-w-3xl text-lg text-slate-600">{HOME_DASHBOARD_COPY.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={APP_ROUTES.login} className="rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg">
                {HOME_DASHBOARD_COPY.ctaPrimary}
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[560px] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg lg:col-span-5">
            <Image
              src="/general-v2.png"
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
