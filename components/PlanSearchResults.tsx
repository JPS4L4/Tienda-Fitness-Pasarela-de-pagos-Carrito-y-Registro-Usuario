"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Plan } from "@/app/data/data";

interface PlanSearchResultsProps {
  query: string;
  plans?: Plan[];
  onResultClick?: (id: number) => void;
}

export default function PlanSearchResults({
  query,
  plans = [],
  onResultClick,
}: PlanSearchResultsProps) {
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

    setResults(filteredResults);
    setShowResults(filteredResults.length > 0);
  }, [query, plans]);

  if (!showResults || results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full mt-2 right-0 w-80 bg-white border-2 border-orange-500 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-orange-200 px-4 py-3 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">
          {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado
          {results.length !== 1 ? "s" : ""}
        </h3>
        <X className="w-4 h-4 text-gray-500" />
      </div>

      <div className="divide-y divide-orange-100">
        {results.map((plan) => (
          <button
            key={plan.id}
            onClick={() => {
              if (onResultClick) {
                onResultClick(plan.id);
              }
            }}
            className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm line-clamp-2">
                  {plan.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {plan.type === "nutricion" ? "🍎 Nutrición" : "💪 Entrenamiento"}
                </p>
              </div>
              {plan.price && (
                <span className="text-sm font-bold text-orange-600 whitespace-nowrap">
                  {plan.price}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
