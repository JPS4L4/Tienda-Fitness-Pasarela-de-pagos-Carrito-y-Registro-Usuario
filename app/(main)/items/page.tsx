"use client";

import { formatPrice, applyDiscount } from "@/lib/money";
import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ItemCard from "@/components/cards/ItemCard";
import LocalSearchAutocomplete from "@/components/others/LocalSearchAutocomplete";
import { Search as SearchIcon } from "lucide-react";
import { ItemUI } from "../../src/types/item";
import StateMessage from "@/components/others/StateMessage";
import { ItemCardSkeleton } from "@/components/skeletons/ItemCardSkeleton";

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

  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");

  // Traer productos desde la API
  const loadItems = useCallback(() => {
    setStatus("loading");
    fetch("/api/items")
      .then(res => {
        if (!res.ok) throw new Error("items");
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error("items");
        setFeaturedItems(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Aplicar filtro de descuento desde URL
  useEffect(() => {
    const discountParam = searchParams.get('discount');
    if (discountParam === 'true') {
      setDiscountOnly(true);
    }
  }, [searchParams]);

  // Categorías dinámicas
  const allCategories = useMemo(
    () => [...new Set(featuredItems.map(p => p.category))],
    [featuredItems]
  );

  // Filtros
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

    if (minPrice !== null) result = result.filter(p => applyDiscount(p.price, p.discount) >= minPrice);
    if (maxPrice !== null) result = result.filter(p => applyDiscount(p.price, p.discount) <= maxPrice);

    if (freeShippingOnly) {
      result = result.filter(p => p.freeShipping);
    }

    // Filtro de descuentos
    if (discountOnly) {
      result = result.filter(p => p.discount && p.discount > 0);
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => applyDiscount(a.price, a.discount) - applyDiscount(b.price, b.discount));
        break;
      case "price-desc":
        result.sort((a, b) => applyDiscount(b.price, b.discount) - applyDiscount(a.price, a.discount));
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
    <div className="bg-bg min-h-screen pb-12">
      {/* Container Principal */}
      <div className="container mx-auto px-4 pt-6">
        
        {/* Breadcrumbs (Migas de pan) */}
        <div className="text-sm text-muted mb-4">
          <span className="cursor-pointer hover:underline">Inicio</span>
          <span className="mx-2">/</span>
          <span className="font-semibold text-fg">Deportes y Fitness</span>
        </div>

        <div className="flex gap-8">
          
          {/* --- SIDEBAR DE FILTROS (Izquierda) --- */}
          {/* 'hidden lg:block' lo oculta en celular y lo muestra en pantallas grandes */}
          <aside className="w-64 hidden lg:block shrink-0 overflow-visible">
            <h2 className="text-3xl mb-5 text-fg">Filtros</h2>
            {/*Barra de Búsqueda Local */}
            <div className="mb-6 relative z-40">
              <h3 className="eyebrow mb-3">Buscar</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input !min-h-10 !py-1 text-sm"
                />
                <SearchIcon className="w-4 h-4 text-subtle absolute right-3 top-3 pointer-events-none" />
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
                className="btn btn-primary btn-sm btn-block mb-4"
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
            <h1 className="sr-only">Tienda</h1>
            {/* Barra de búsqueda y filtros en móvil */}
            <div className="lg:hidden mb-4 space-y-3">
              <div className="bg-surface border border-line p-4">
                <h3 className="eyebrow mb-3">Buscar</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input !min-h-10 !py-1 text-sm"
                  />
                  <SearchIcon className="w-4 h-4 text-subtle absolute right-3 top-3 pointer-events-none" />
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
                  className="btn btn-ghost btn-sm flex-1"
                >
                  Ver filtros
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
            
            {/* Cabecera de Resultados */}
            <div className="bg-surface border border-line p-4 mb-4 flex justify-between items-center flex-wrap gap-4">
              <span className="text-fg-soft text-sm font-semibold">
                {status === "ready" ? `${filteredItems.length} resultado${filteredItems.length !== 1 ? "s" : ""}` : "00a0"}
              </span>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">Ordenar por:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input !min-h-10 !w-auto !py-1 font-semibold cursor-pointer"
                >
                  <option value="relevance">Más relevantes</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {status === "loading" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4" aria-busy="true">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ItemCardSkeleton key={i} />
                ))}
              </div>
            ) : status === "error" ? (
              <StateMessage
                tone="error"
                icon="!"
                title="No pudimos cargar los productos"
                description="Revisa tu conexión e inténtalo de nuevo."
                action={{ label: "Reintentar", onClick: loadItems }}
              />
            ) : featuredItems.length === 0 ? (
              <StateMessage
                icon="∅"
                title="Aún no hay productos"
                description="Estamos preparando el catálogo. Mientras tanto, mira nuestros planes."
                action={{ label: "Ver planes", href: "/plans" }}
              />
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} {...item} />
                ))}
              </div>
            ) : (
              <StateMessage
                icon="?"
                title="Sin resultados"
                description="No encontramos productos que coincidan con tus filtros."
                action={{ label: "Limpiar filtros", onClick: clearFilters }}
              />
            )}
          </main> 
        </div>

        {/* Drawer de filtros en móvil */}
        {isFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setIsFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-surface border-l-2 border-accent p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl text-fg">Filtros</h2>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="text-sm text-muted hover:text-fg"
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
                  className="btn btn-primary btn-sm btn-block mb-4"
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
      <div className="bg-bg min-h-screen pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-muted">Cargando tienda...</p>
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
        <h3 className="eyebrow mb-3">Categorías</h3>
        <ul className="text-sm space-y-2">
          {allCategories.map(cat => {
            const count = featuredItems.filter(p => p.category === cat).length;
            return (
              <li 
                key={cat}
                onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
                className={`cursor-pointer border-l-4 px-3 py-2 font-semibold transition ${
                  selectedCategory === cat 
                    ? "border-accent bg-surface-2 text-accent" 
                    : "border-transparent text-fg-soft hover:text-accent"
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
        <h3 className="eyebrow mb-3">Precio</h3>
        <div className="flex items-center gap-2 mb-2">
          <input 
            type="number" 
            placeholder="Mín" 
            value={minPrice || ""}
            onChange={(e) => onMinPriceChange(e.target.value ? parseFloat(e.target.value) : null)}
            className="input !min-h-10 !py-1 w-24 text-sm"
          />
          <span className="text-subtle">-</span>
          <input 
            type="number" 
            placeholder="Máx" 
            value={maxPrice || ""}
            onChange={(e) => onMaxPriceChange(e.target.value ? parseFloat(e.target.value) : null)}
            className="input !min-h-10 !py-1 w-24 text-sm"
          />
        </div>
        <div className="text-xs text-muted mt-2">
          {formatPrice(minPrice || 0)} - {maxPrice ? formatPrice(maxPrice) : "∞"}
        </div>
      </div>

      {/* Switch de Envío */}
      <div className="mb-6">
        <h3 className="eyebrow mb-3">Envío</h3>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={freeShippingOnly}
            onChange={(e) => onFreeShippingChange(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-sm text-ok font-semibold">Solo envío gratis</span>
        </label>
      </div>

      {/* Filtro de Descuentos */}
      <div className="mb-6">
        <h3 className="eyebrow mb-3">Ofertas</h3>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={discountOnly}
            onChange={(e) => onDiscountChange(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-sm text-danger font-semibold">Solo con descuento</span>
        </label>
      </div>
    </>
  );
}
