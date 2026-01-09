"use client";

import { useState, useMemo } from "react";
import itemCard from "@/components/cards/items";
import {db} from "@/app/data/data";

const featuredItems = db.items;

// Obtener categorías únicas
const allCategories = [...new Set(featuredItems.map(p => p.category))];

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  // Filtrar y ordenar productos
  const filteredItems = useMemo(() => {
    let result = featuredItems;

    // Filtro por categoría
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filtro por rango de precio
    if (minPrice !== null) {
      result = result.filter(p => p.price >= minPrice);
    }
    if (maxPrice !== null) {
      result = result.filter(p => p.price <= maxPrice);
    }

    // Filtro por envío gratis
    if (freeShippingOnly) {
      result = result.filter(p => p.freeShipping);
    }

    // Ordenamiento
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "relevance":
      default:
        result = [...result].sort((a, b) => {
          // Ofertas del día primero
          if (a.isOfferOfTheDay && !b.isOfferOfTheDay) return -1;
          if (!a.isOfferOfTheDay && b.isOfferOfTheDay) return 1;
          // Luego por descuento
          const discountA = a.discount || 0;
          const discountB = b.discount || 0;
          return discountB - discountA;
        });
        break;
    }

    return result;
  }, [selectedCategory, minPrice, maxPrice, freeShippingOnly, sortBy]);

  const handlePriceFilter = () => {
    // Este manejador se ejecuta cuando el usuario presiona enter o hace clic en el botón
    // Los valores ya están siendo capturados en el estado, por lo que el filtrado es automático
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setMinPrice(null);
    setMaxPrice(null);
    setFreeShippingOnly(false);
  };
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
          <aside className="w-64 hidden lg:block shrink-0">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Filtros</h2>
            
            {/* Botón Limpiar Filtros */}
            {(selectedCategory || minPrice !== null || maxPrice !== null || freeShippingOnly) && (
              <button 
                onClick={clearFilters}
                className="mb-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded text-sm font-semibold transition"
              >
                Limpiar filtros
              </button>
            )}
            
            {/* Categorías */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Categorías</h3>
              <ul className="text-sm space-y-2">
                {allCategories.map(cat => {
                  const count = featuredItems.filter(p => p.category === cat).length;
                  return (
                    <li 
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
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
                  onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-20 p-2 text-sm text-gray-700 border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  placeholder="Máx" 
                  value={maxPrice || ""}
                  onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : null)}
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
                  onChange={(e) => setFreeShippingOnly(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <span className="text-sm text-green-600 font-semibold">Solo envío gratis</span>
              </label>
            </div>
          </aside>


          {/* --- GRILLA DE PRODUCTOS (Derecha) --- */}
          <main className="flex-1">
            
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
                <div key={item.id}>
                    {itemCard(item)}
                </div>
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
      </div>
    </div>
  );
}

