"use client";

import { db, Plan, PlanType } from "@/app/data/data";
import { PlanCard } from "@/components/cards/plans";
import { useState, useMemo } from "react";
/* import PlanSearchAutocomplete from "@/components/PlanSearchAutocomplete";
import { Search as SearchIcon } from "lucide-react"; */

export default function PlansPage() {
  const [selectedSection, setSelectedSection] = useState<PlanType>("nutricion");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredPlans: Plan[] = db.plans;

  const filtered = useMemo(() => {
    let result = featuredPlans.filter((p) => p.type === selectedSection);

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm) ||
          p.type.toLowerCase().includes(searchTerm)
      );
    }

    return result;
  }, [selectedSection, searchQuery]);

  // Definimos los colores del selector dinámicamente según la sección activa
  const activeStyles = {
    nutricion: "bg-emerald-600 text-white shadow-emerald-200",
    entrenamiento: "bg-blue-600 text-white shadow-blue-200",
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Nuestros Planes
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Selecciona la categoría de planes para ver la cobertura incluida. Cada
          opción está diseñada para adaptarse a tus objetivos específicos.
        </p>
      </div>

      {/* Barra de Búsqueda Local */}
     {/*  <div className="max-w-3xl mx-auto mb-12 flex justify-center relative">
        <div className="w-full max-w-sm relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar planes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 text-sm text-gray-700 border-2 border-slate-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
            />
            <SearchIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
            {searchQuery && (
              <PlanSearchAutocomplete
                query={searchQuery}
                plans={featuredPlans}
                onResultClick={(title) => setSearchQuery(title)}
              />
            )}
          </div>
        </div>
      </div> */}

      {/* Selector de secciones dinámico */}
      <div className="max-w-3xl mx-auto mb-12 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => setSelectedSection("nutricion")}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg ${
            selectedSection === "nutricion" 
              ? activeStyles.nutricion 
              : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300"
          }`}
        >
          🍎 Planes Nutricionales
        </button>
        
        <button
          onClick={() => setSelectedSection("entrenamiento")}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg ${
            selectedSection === "entrenamiento" 
              ? activeStyles.entrenamiento 
              : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
          }`}
        >
          💪 Planes de Entrenamiento
        </button>
      </div>

      {/* Grilla de planes */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 justify-items-center">
        {filtered.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Nota de garantía rediseñada */}
      <div className="mt-20 max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
        <p className="text-slate-600 text-sm leading-relaxed">
          Todos los planes incluyen nuestra **garantía de satisfacción de 30 días**. <br />
          ¿Necesitas un plan a medida?{" "}
          <a href="/contact" className="text-blue-600 font-bold hover:underline">
            Habla con nosotros
          </a>.
        </p>
      </div>
    </div>
  );
}