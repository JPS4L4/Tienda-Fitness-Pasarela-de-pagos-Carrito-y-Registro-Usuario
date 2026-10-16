"use client";

import { formatPrice } from '@/lib/money'

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ItemProps } from "@/app/data/data";

interface LocalSearchResultsProps {
  query: string;
  items?: ItemProps[];
  onResultClick?: (id: number) => void;
}

export default function LocalSearchResults({
  query,
  items = [],
  onResultClick,
}: LocalSearchResultsProps) {
  const [results, setResults] = useState<ItemProps[]>([]);
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

    setResults(filteredResults);
    setShowResults(filteredResults.length > 0);
  }, [query, items]);

  if (!showResults || results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full mt-2 right-0 w-80 bg-surface border-2 border-accent   z-50 max-h-96 overflow-y-auto">
      <div className="sticky top-0 bg-surface border-b border-accent px-4 py-3 flex items-center justify-between">
        <h3 className="font-bold text-fg">
          {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado
          {results.length !== 1 ? "s" : ""}
        </h3>
        <X className="w-4 h-4 text-muted" />
      </div>

      <div className="divide-y divide-accent">
        {results.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (onResultClick) {
                onResultClick(item.id);
              }
            }}
            className="w-full text-left px-4 py-3 hover:bg-accent/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-fg text-sm line-clamp-2">
                  {item.title}
                </p>
                <p className="text-xs text-muted mt-1">
                  {item.category}
                  {(item.discount ?? 0) > 0 && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="text-accent font-semibold">
                        -{item.discount}%
                      </span>
                    </>
                  )}
                </p>
              </div>
              <span className="text-sm font-bold text-accent whitespace-nowrap">
                {formatPrice(item.price)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
