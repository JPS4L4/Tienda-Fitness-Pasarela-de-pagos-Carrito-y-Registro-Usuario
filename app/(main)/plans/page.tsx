
"use client";

import { featuredPlans, PlanCard, PlanType } from "@/components/cards/plans";
import { useState } from "react";


export default function PlansPage() {
  const [selectedSection, setSelectedSection] = useState<PlanType>("nutricion");

  const filtered = featuredPlans.filter((p) => p.type === selectedSection);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Planes</h1>
        <p className="text-gray-500 mt-4">Selecciona la categoría de planes para ver la cobertura incluida, Cada plan tiene su propio precio fijo.</p>
      </div>

      {/* Selector de secciones (reemplaza el toggle anterior) */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-center gap-3">
        <button
          onClick={() => setSelectedSection("nutricion")}
          className={`px-4 py-2 rounded-md font-semibold ${selectedSection === "nutricion" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
        >
          Planes Nutricionales
        </button>
        <button
          onClick={() => setSelectedSection("entrenamiento")}
          className={`px-4 py-2 rounded-md font-semibold ${selectedSection === "entrenamiento" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
        >
          Planes de Entrenamiento
        </button>
      </div>

      {/* Grilla de planes: 1 columna móviles, 2 en sm, 3 en lg */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {filtered.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Nota de garantía / confianza */}
      <div className="mt-20 text-center">
        <p className="text-gray-500 text-sm">
          Todos los planes incluyen nuestra garantía de devolución de 30 días. <br />
          ¿Tienes dudas? <a href="/contact" className="text-indigo-600 font-medium underline">Contáctanos</a>.
        </p>
      </div>
    </div>
  );
}

