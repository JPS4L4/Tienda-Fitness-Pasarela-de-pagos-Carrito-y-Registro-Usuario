"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export interface SearchResult {
  id: number;
  title: string;
  category?: string;
  price?: number;
  type?: string;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  isLocalSearch?: boolean;
}

export default function SearchBar({
  onSearch,
  placeholder = "Buscar...",
  isLocalSearch = false,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const pathname = usePathname();

  // Determinar si estamos en una página de búsqueda local
  const isLocalSearchPage = pathname === "/items" || pathname === "/plans";

  useEffect(() => {
    if (onSearch && !isLocalSearch) {
      onSearch(searchQuery);
    }
  }, [searchQuery, onSearch, isLocalSearch]);

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className="relative hidden md:block">
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        className="bg-white text-sm text-gray-800 rounded-full pl-3 pr-8 py-1.5 border border-black focus:outline-none hover:border-orange-500 ease-in duration-100 focus:border-orange-500 w-40 transition-all focus:w-52"
      />
      {searchQuery ? (
        <button
          onClick={handleClear}
          className="w-4 h-4 text-gray-800 absolute right-3 top-2 pointer-events-auto cursor-pointer hover:text-orange-500"
        >
          <X className="w-4 h-4" />
        </button>
      ) : (
        <SearchIcon className="w-4 h-4 text-gray-800 absolute right-3 top-2 pointer-events-none" />
      )}
    </div>
  );
}
