"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/app/data/data";
import { X } from "lucide-react";

export interface GlobalSearchResult {
  id: number;
  title: string;
  type: "product" | "plan";
  price?: string | number;
  category?: string;
}

interface GlobalSearchResultsProps {
  query: string;
}

export default function GlobalSearchResults({ query }: GlobalSearchResultsProps) {
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const pathname = usePathname();

  // No mostrar resultados en páginas de búsqueda local
  const isLocalSearchPage = pathname === "/products" || pathname === "/plans";

  useEffect(() => {
    if (isLocalSearchPage || !query.trim()) {
      setShowResults(false);
      return;
    }

    const searchTerm = query.toLowerCase();
    const productResults: GlobalSearchResult[] = db.items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)
      )
      .map((item) => ({
        id: item.id,
        title: item.title,
        type: "product" as const,
        price: item.price,
        category: item.category,
      }))
      .slice(0, 3);

    const planResults: GlobalSearchResult[] = db.plans
      .filter(
        (plan) =>
          plan.title.toLowerCase().includes(searchTerm) ||
          plan.type.toLowerCase().includes(searchTerm)
      )
      .map((plan) => ({
        id: plan.id,
        title: plan.title,
        type: "plan" as const,
        price: plan.price,
        category: plan.type,
      }))
      .slice(0, 3);

    setResults([...productResults, ...planResults]);
    setShowResults(query.trim().length > 0);
  }, [query, isLocalSearchPage]);

  if (!showResults || results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full mt-2 right-0 w-72 bg-white border-2 border-orange-500 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-orange-200 px-4 py-3 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Resultados de búsqueda</h3>
        <X className="w-4 h-4 text-gray-500 cursor-pointer" />
      </div>

      <div className="divide-y divide-orange-100">
        {results.map((result) => (
          <a
            key={`${result.type}-${result.id}`}
            href={result.type === "product" ? "/products" : "/plans"}
            className="block px-4 py-3 hover:bg-orange-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm line-clamp-2">
                  {result.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {result.type === "product" ? "Producto" : "Plan"} •{" "}
                  {result.category}
                </p>
              </div>
              {result.price && (
                <span className="text-sm font-bold text-orange-600 ml-2 whitespace-nowrap">
                  {typeof result.price === "number"
                    ? `$${result.price}`
                    : result.price}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>

      <div className="px-4 py-3 bg-orange-50 border-t border-orange-200 text-center">
        <a
          href={results.some((r) => r.type === "product") ? "/products" : "/plans"}
          className="text-sm font-semibold text-orange-600 hover:text-orange-700"
        >
          Ver todos los resultados →
        </a>
      </div>
    </div>
  );
}
