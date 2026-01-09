"use client";

import { useEffect, useState } from "react";
import { Plan } from "@/app/data/data";

interface PlanSearchAutocompleteProps {
  query: string;
  plans?: Plan[];
  onResultClick?: (title: string) => void;
}

export default function PlanSearchAutocomplete({
  query,
  plans = [],
  onResultClick,
}: PlanSearchAutocompleteProps) {
  const [results, setResults] = useState<Plan[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!query.trim() || plans.length === 0) {
      setShowResults(false);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filteredResults = plans.filter(
      (plan) =>
        plan.title.toLowerCase().includes(searchTerm) ||
        plan.type.toLowerCase().includes(searchTerm)
    );

    setResults(filteredResults.slice(0, 10)); // Limita a 10 resultados
    setShowResults(filteredResults.length > 0);
  }, [query, plans]);

  const handleSelectItem = (title: string) => {
    onResultClick?.(title);
    setShowResults(false);
  };

  if (!showResults || results.length === 0) {
    return null;
  }

  const typeLabels: { [key: string]: string } = {
    nutricion: "🍎 Nutrición",
    entrenamiento: "💪 Entrenamiento",
  };

  return (
    <div className="absolute top-full mt-2 left-0 right-0 w-full bg-white border-2 border-slate-300 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto">
      <ul className="divide-y divide-gray-200">
        {results.map((plan) => (
          <li key={plan.id}>
            <button
              onClick={() => handleSelectItem(plan.title)}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-150 flex items-center justify-between group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate">
                  {plan.title}
                </p>
                <p className="text-xs text-gray-500">
                  {typeLabels[plan.type] || plan.type}
                </p>
              </div>
              {plan.price && (
                <span className="text-xs font-semibold text-blue-600 ml-2 flex-shrink-0">
                  ${plan.price.toLocaleString()}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
