"use client";

import { formatPrice } from '@/lib/money'

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
    nutricion: "Nutrición",
    entrenamiento: "Entrenamiento",
  };

  return (
    <div className="absolute top-full mt-2 left-0 right-0 w-full bg-surface border-2 border-line-strong   z-50 max-h-64 overflow-y-auto">
      <ul className="divide-y divide-line">
        {results.map((plan) => (
          <li key={plan.id}>
            <button
              onClick={() => handleSelectItem(plan.title)}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-surface-2 transition-colors duration-150 flex items-center justify-between group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fg group-hover:text-accent truncate">
                  {plan.title}
                </p>
                <p className="text-xs text-muted">
                  {typeLabels[plan.type] || plan.type}
                </p>
              </div>
              {plan.price && (
                <span className="text-xs font-semibold text-accent ml-2 flex-shrink-0">
                  Desde {formatPrice(plan.price)}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
