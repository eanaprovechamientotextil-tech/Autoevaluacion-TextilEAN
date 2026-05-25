"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DashboardShell } from "@/components/prototype/dashboard-shell";
import { CompanyRegistrationForm } from "@/components/prototype/company-registration-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { APP_ROUTES } from "@/src/constants/routes";

const CIRCULAR_STEPS: Array<{ image: string; href: string; label: string }> = [
  { image: "/1.png", href: APP_ROUTES.autodiagnostico, label: "Paso 1" },
  { image: "/2.png", href: APP_ROUTES.caracterizacion, label: "Paso 2" },
  { image: "/3.png", href: APP_ROUTES.evaluacionClasificacion, label: "Paso 3" },
  { image: "/4.png", href: APP_ROUTES.vinculacionAliados, label: "Paso 4" },
  { image: "/5.png", href: APP_ROUTES.matrizSeguimiento, label: "Paso 5" },
] as const;

export function AppHome() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  return (
    <DashboardShell>
      <section className="relative overflow-hidden rounded-3xl border border-[var(--outline)]/40 bg-white p-6 shadow-sm md:p-10">
        <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-cyan-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-violet-100/60 blur-3xl" />

        <div className="relative grid items-start gap-8 lg:grid-cols-12 lg:items-center">
          <div className="space-y-5 lg:col-span-7">
            <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-800">
              Plataforma de economía circular
            </span>

            <h1 className="text-3xl font-extrabold leading-tight text-[var(--primary)] md:text-5xl">
              Autoevaluación de aprovechamiento textil para MiPymes del Sector textil de Cundinamarca
            </h1>

            <p className="max-w-3xl text-base leading-relaxed text-slate-700 md:text-lg">
              La presente herramienta de autoevaluación tiene como propósito orientar a las MiPymes del sector textil de Cundinamarca en la identificación de oportunidades para el aprovechamiento de residuos textiles, promoviendo prácticas alineadas con los principios de la economía circular.
            </p>

            <p className="max-w-3xl text-base leading-relaxed text-slate-700 md:text-lg">
              A través de este autodiagnóstico, las empresas podrán reconocer su nivel actual de gestión frente a estrategias como el <strong>upcycling</strong>, el <strong>reciclaje mecánico</strong>, la <strong>reventa o donación</strong> y las alternativas de <strong>aprovechamiento comercial</strong>, y le permitirá aplicar la hoja de ruta propuesta o una versión de la misma, que apoye la implementación de acciones sostenibles, contribuya a la optimización de recursos y fortalezca la competitividad empresarial desde una perspectiva ambiental, económica y social.
            </p>

            <div className="pt-2">
              <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110"
                  >
                    Iniciar diagnóstico
                  </button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto border border-[var(--outline)]/50 bg-white sm:max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Datos de la compañia</DialogTitle>
                    <DialogDescription>
                      Completá la información para crear el cliente e iniciar el diagnóstico.
                    </DialogDescription>
                  </DialogHeader>
                  <CompanyRegistrationForm inDialog />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <aside className="lg:col-span-5 lg:flex lg:justify-center">
            <div className="flex w-full max-w-[560px] items-center justify-center p-2">
              <div className="relative h-[520px] w-[520px]">
                {CIRCULAR_STEPS.map((step, index) => {
                  const angle = ((index * 360) / CIRCULAR_STEPS.length - 90) * (Math.PI / 180);
                  const radius = 170;
                  const center = 260;
                  const itemSize = 180;
                  const x = center + radius * Math.cos(angle) - itemSize / 2;
                  const y = center + radius * Math.sin(angle) - itemSize / 2;

                  const href = step.href;

                  return (
                    <div
                      key={step.image}
                      className="absolute flex items-center justify-center"
                      style={{ left: `${x}px`, top: `${y}px`, width: `${itemSize}px`, height: `${itemSize}px` }}
                    >
                      <Link href={href} aria-label={step.label} className="transition hover:scale-105">
                        <Image
                          src={step.image}
                          alt={step.label}
                          width={itemSize}
                          height={itemSize}
                          className="h-full w-full object-contain"
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </DashboardShell>
  );
}
