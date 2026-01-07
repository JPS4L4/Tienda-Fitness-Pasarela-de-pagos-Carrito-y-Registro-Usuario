export type PlanType = "nutricion" | "entrenamiento";

interface Plan {
  id: number;
  type: PlanType;
  title: string;
  coverage: string[];
  price?: string;
}

export const featuredPlans: Plan[] = [
  {
    id: 1,
    type: "nutricion",
    title: "Plan Nutricional Básico",
    price: "Desde $49",
    coverage: [
      "Evaluación nutricional inicial",
      "Plan alimenticio personalizado (4 semanas)",
      "Lista de compras y recetas",
    ],
  },
  {
    id: 2,
    type: "nutricion",
    title: "Plan Nutricional Avanzado",
    price: "Desde $89",
    coverage: [
      "Evaluación nutricional avanzada",
      "Plan alimenticio personalizado (8 semanas)",
      "Seguimiento quincenal con ajustes",
      "Educación nutricional",
    ],
  },
  {
    id: 3,
    type: "entrenamiento",
    title: "Plan de Entrenamiento Home Gym",
    price: "Desde $59",
    coverage: [
      "Rutina personalizada según objetivos",
      "Variantes para nivel principiante/intermedio",
      "Instrucciones en video y progresiones",
    ],
  },
  {
    id: 4,
    type: "entrenamiento",
    title: "Plan de Fuerza y Rendimiento",
    price: "Desde $99",
    coverage: [
      "Evaluación de fuerza inicial",
      "Programa de 12 semanas",
      "Control de cargas y progresión semanal",
      "Consejos de recuperación y movilidad",
    ],
  },
  {
    id: 5,
    type: "nutricion",
    title: "Plan de Pérdida de Grasa",
    price: "Desde $79",
    coverage: [
      "Déficit calórico personalizado",
      "Plan alimenticio y recetas",
      "Seguimiento y ajustes semanales",
    ],
  },
];

export const PlanCard = ({ plan }: { plan: Plan }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.title}</h3>
        {plan.price && <div className="text-indigo-600 font-bold mb-3">{plan.price}</div>}
        <ul className="text-sm text-gray-600 space-y-2 mb-4">
          {plan.coverage.map((c, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">•</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <a href="/contact" className="inline-block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-semibold">Contratar / Consultar</a>
      </div>
    </div>
  );
}