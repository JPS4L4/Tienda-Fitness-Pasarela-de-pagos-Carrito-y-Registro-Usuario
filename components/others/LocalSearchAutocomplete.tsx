"use client";

import { useEffect, useState } from "react";
import { ItemUI } from "@/app/src/types/item";

interface LocalSearchAutocompleteProps {
  query: string;
  items?: ItemUI[];
  onResultClick?: (title: string) => void;
}

export default function LocalSearchAutocomplete({
  query,
  items = [],
  onResultClick,
}: LocalSearchAutocompleteProps) {
  const [results, setResults] = useState<ItemUI[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!query.trim() || items.length === 0) {
      setShowResults(false);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filteredResults = items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );

    setResults(filteredResults.slice(0, 10)); // Limita a 10 resultados
    setShowResults(filteredResults.length > 0);
  }, [query, items]);

  const handleSelectItem = (title: string) => {
    onResultClick?.(title);
    setShowResults(false);
  };

  if (!showResults || results.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-full left-0 right-0 mt-2 flex justify-start pointer-events-none z-50">
      <div className="absolute left-0 w-64 bg-white border-2 border-orange-500 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto pointer-events-auto">
        <ul className="divide-y divide-gray-200">
          {results.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleSelectItem(item.title)}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors duration-150 flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-orange-600 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <span className="text-xs font-semibold text-orange-600 ml-2 flex-shrink-0">
                  ${item.price.toLocaleString()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
