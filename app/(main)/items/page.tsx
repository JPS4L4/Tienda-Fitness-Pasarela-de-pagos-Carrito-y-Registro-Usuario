"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ItemCard from "@/components/cards/ItemCard";
import LocalSearchAutocomplete from "@/components/others/LocalSearchAutocomplete";
import { Search as SearchIcon } from "lucide-react";
import { ItemUI } from "../../src/types/item";

function StorePageContent() {
  const searchParams = useSearchParams();
  const [featuredItems, setFeaturedItems] = useState<ItemUI[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // 🔹 Traer productos desde la API
  useEffect(() => {
    fetch("/api/items")
      .then(res => res.json())
      .then(data => setFeaturedItems(data))
      .catch(console.error);
  }, []);

  // 🔹 Aplicar filtro de descuento desde URL
  useEffect(() => {
    const discountParam = searchParams.get('discount');
    if (discountParam === 'true') {
      setDiscountOnly(true);
    }
  }, [searchParams]);

  // 🔹 Categorías dinámicas
  const allCategories = useMemo(
    () => [...new Set(featuredItems.map(p => p.category))],
    [featuredItems]
  );

  // 🔹 Filtros
  const filteredItems = useMemo(() => {
    let result = [...featuredItems];

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (minPrice !== null) result = result.filter(p => p.price >= minPrice);
    if (maxPrice !== null) result = result.filter(p => p.price <= maxPrice);

    if (freeShippingOnly) {
      result = result.filter(p => p.freeShipping);
    }

    // 🔹 Filtro de descuentos
    if (discountOnly) {
      result = result.filter(p => p.discount && p.discount > 0);
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        result.sort((a, b) => {
          if (a.isOfferOfTheDay && !b.isOfferOfTheDay) return -1;
          if (!a.isOfferOfTheDay && b.isOfferOfTheDay) return 1;
          return (b.discount ?? 0) - (a.discount ?? 0);
        });
    }

    return result;
  }, [
    featuredItems,
    selectedCategory,
    minPrice,
    maxPrice,
    freeShippingOnly,
    discountOnly,
    sortBy,
    searchQuery,
  ]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setMinPrice(null);
    setMaxPrice(null);
    setFreeShippingOnly(false);
    setDiscountOnly(false);
    setSearchQuery("");
  };

  const hasActiveFilters = Boolean(
    selectedCategory ||
    minPrice !== null ||
    maxPrice !== null ||
    freeShippingOnly ||
    discountOnly ||
    searchQuery
  );

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      {/* Container Principal */}
      <div className="container mx-auto px-4 pt-6">
        
        {/* Breadcrumbs (Migas de pan) */}
        <div className="text-sm text-gray-500 mb-4">
          <span className="cursor-pointer hover:underline">Inicio</span>
          <span className="mx-2">/</span>
          <span className="font-semibold text-gray-800">Deportes y Fitness</span>
        </div>

        <div className="flex gap-8">
          
          {/* --- SIDEBAR DE FILTROS (Izquierda) --- */}
          {/* 'hidden lg:block' lo oculta en celular y lo muestra en pantallas grandes */}
          <aside className="w-64 hidden lg:block shrink-0 overflow-visible">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Filtros</h2>
            {/*Barra de Búsqueda Local */}
            <div className="mb-6 relative z-40">
              <h3 className="font-semibold text-gray-900 mb-3">Buscar</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 text-sm text-gray-700 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                />
                <SearchIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                {searchQuery && (
                  <LocalSearchAutocomplete 
                    query={searchQuery} 
                    items={featuredItems}
                    onResultClick={(title) => setSearchQuery(title)}
                  />
                )}
              </div>
            </div>
            
            {/* Botón Limpiar Filtros */}
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="mb-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded text-sm font-semibold transition"
              >
                Limpiar filtros
              </button>
            )}
            
            <FiltersPanel
              allCategories={allCategories}
              featuredItems={featuredItems}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              freeShippingOnly={freeShippingOnly}
              onFreeShippingChange={setFreeShippingOnly}
              discountOnly={discountOnly}
              onDiscountChange={setDiscountOnly}
            />
          </aside>


          {/* --- GRILLA DE PRODUCTOS (Derecha) --- */}
          <main className="flex-1">
            {/* Barra de búsqueda y filtros en móvil */}
            <div className="lg:hidden mb-4 space-y-3">
              <div className="bg-white p-4 rounded shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Buscar</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 text-sm text-gray-700 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                  />
                  <SearchIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                  {searchQuery && (
                    <LocalSearchAutocomplete 
                      query={searchQuery} 
                      items={featuredItems}
                      onResultClick={(title) => setSearchQuery(title)}
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFiltersOpen(true)}
                  className="flex-1 bg-gray-900 hover:bg-black text-white py-2 px-3 rounded text-sm font-semibold transition"
                >
                  Ver filtros
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded text-sm font-semibold transition"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
            
            {/* Cabecera de Resultados */}
            <div className="bg-white p-4 rounded shadow-sm mb-4 flex justify-between items-center flex-wrap gap-4">
              <span className="text-gray-700 text-sm font-semibold">
                {filteredItems.length} resultado{filteredItems.length !== 1 ? "s" : ""}
              </span>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Ordenar por:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="font-semibold text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="relevance">Más relevantes</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} {...item} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded shadow-sm text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Sin resultados</h3>
                <p className="text-gray-500 mb-4">No encontramos productos que coincidan con tus filtros.</p>
                <button 
                  onClick={clearFilters}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded font-semibold transition"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </main> 
        </div>

        {/* Drawer de filtros en móvil */}
        {isFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="text-sm text-gray-500 hover:text-gray-800"
                >
                  Cerrar
                </button>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearFilters();
                    setIsFiltersOpen(false);
                  }}
                  className="mb-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded text-sm font-semibold transition"
                >
                  Limpiar filtros
                </button>
              )}
              <FiltersPanel
                allCategories={allCategories}
                featuredItems={featuredItems}
                selectedCategory={selectedCategory}
                onSelectCategory={(value) => setSelectedCategory(value)}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                freeShippingOnly={freeShippingOnly}
                onFreeShippingChange={setFreeShippingOnly}
                discountOnly={discountOnly}
                onDiscountChange={setDiscountOnly}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={
      <div className="bg-gray-100 min-h-screen pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tienda...</p>
        </div>
      </div>
    }>
      <StorePageContent />
    </Suspense>
  );
}

function FiltersPanel({
  allCategories,
  featuredItems,
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  freeShippingOnly,
  onFreeShippingChange,
  discountOnly,
  onDiscountChange,
}: {
  allCategories: string[];
  featuredItems: ItemUI[];
  selectedCategory: string | null;
  onSelectCategory: (value: string | null) => void;
  minPrice: number | null;
  maxPrice: number | null;
  onMinPriceChange: (value: number | null) => void;
  onMaxPriceChange: (value: number | null) => void;
  freeShippingOnly: boolean;
  onFreeShippingChange: (value: boolean) => void;
  discountOnly: boolean;
  onDiscountChange: (value: boolean) => void;
}) {
  return (
    <>
      {/* Categorías */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Categorías</h3>
        <ul className="text-sm space-y-2">
          {allCategories.map(cat => {
            const count = featuredItems.filter(p => p.category === cat).length;
            return (
              <li 
                key={cat}
                onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
                className={`cursor-pointer p-2 rounded transition ${
                  selectedCategory === cat 
                    ? "bg-indigo-100 text-indigo-700 font-semibold" 
                    : "text-gray-600 hover:text-indigo-600"
                }`}
              >
                {cat} ({count})
              </li>
            );
          })}
        </ul>
      </div>

      {/* Filtro de Precio */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Precio</h3>
        <div className="flex items-center gap-2 mb-2">
          <input 
            type="number" 
            placeholder="Mín" 
            value={minPrice || ""}
            onChange={(e) => onMinPriceChange(e.target.value ? parseFloat(e.target.value) : null)}
            className="w-20 p-2 text-sm text-gray-700 border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder="Máx" 
            value={maxPrice || ""}
            onChange={(e) => onMaxPriceChange(e.target.value ? parseFloat(e.target.value) : null)}
            className="w-20 p-2 text-sm text-gray-700 border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="text-xs text-gray-500 mt-2">
          ${minPrice || 0} - ${maxPrice || "∞"}
        </div>
      </div>

      {/* Switch de Envío */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Envío</h3>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={freeShippingOnly}
            onChange={(e) => onFreeShippingChange(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 cursor-pointer"
          />
          <span className="text-sm text-green-600 font-semibold">Solo envío gratis</span>
        </label>
      </div>

      {/* Filtro de Descuentos */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Ofertas</h3>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={discountOnly}
            onChange={(e) => onDiscountChange(e.target.checked)}
            className="w-4 h-4 accent-red-600 cursor-pointer"
          />
          <span className="text-sm text-red-600 font-semibold">Solo con descuento</span>
        </label>
      </div>
    </>
  );
}
