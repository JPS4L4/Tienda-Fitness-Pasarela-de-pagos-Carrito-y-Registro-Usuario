"use client";

import { PlanCard } from "@/components/cards/PlanCard";
import { PlanUI } from "@/app/src/types/plan";
import { useState, useMemo } from "react";
import { Apple, Dumbbell } from "lucide-react";
import Link from "next/link";
import FitnessProfileGate from "@/components/others/FitnessProfileGate";
import { cn } from "@/lib/utils";

type PlansPageClientProps = {
  plans: PlanUI[];
};

const SECTIONS = [
  { id: "nutricion", label: "Planes nutricionales", Icon: Apple },
  { id: "entrenamiento", label: "Planes de entrenamiento", Icon: Dumbbell },
] as const;

export default function PlansPageClient({ plans }: PlansPageClientProps) {
  const [selectedSection, setSelectedSection] = useState<"nutricion" | "entrenamiento">("nutricion");

  const filtered = useMemo(() => plans.filter((p) => p.type === selectedSection), [plans, selectedSection]);

  return (
    <div className="min-h-screen bg-bg px-4 py-12 md:py-16">
      <FitnessProfileGate />
      <div className="container mx-auto">
        <div className="mb-10 max-w-3xl">
          <div className="section-heading">
            <h1 className="text-5xl md:text-7xl">Nuestros planes</h1>
          </div>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Selecciona la categoría de planes para ver la cobertura incluida. Cada opción está diseñada para adaptarse a
            tus objetivos específicos.
          </p>
        </div>

        {/* Selector de secciones */}
        <div className="mb-10 flex flex-wrap gap-3" role="tablist" aria-label="Tipo de plan">
          {SECTIONS.map(({ id, label, Icon }) => {
            const active = selectedSection === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedSection(id)}
                className={cn("btn", active ? "btn-primary" : "btn-ghost")}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Grilla de planes */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {filtered.length > 0 ? (
            filtered.map((plan) => <PlanCard key={plan.id} plan={plan} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-lg text-muted">No se encontraron planes en esta categoría.</p>
            </div>
          )}
        </div>

        {/* Nota de garantía */}
        <div className="panel mt-16 max-w-2xl border-l-4 border-l-accent">
          <p className="leading-relaxed text-fg-soft">
            Todos los planes incluyen nuestra <b className="text-fg">garantía de satisfacción de 30 días</b>. ¿Necesitas un
            plan a medida?{" "}
            <Link href="/contact" className="font-bold text-accent hover:underline">
              Habla con nosotros
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
