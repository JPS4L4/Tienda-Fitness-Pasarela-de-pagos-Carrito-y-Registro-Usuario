"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { useState, useEffect } from "react";

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
        className="input pl-3 pr-8"
      />
      {searchQuery ? (
        <button
          onClick={handleClear}
          className="w-4 h-4 text-fg absolute right-3 top-2 pointer-events-auto cursor-pointer hover:text-accent"
        >
          <X className="w-4 h-4" />
        </button>
      ) : (
        <SearchIcon className="w-4 h-4 text-fg absolute right-3 top-2 pointer-events-none" />
      )}
    </div>
  );
}
