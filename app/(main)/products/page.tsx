"use client";

// Datos de prueba para simular productos
const PRODUCTS = [
  { id: 1, title: "Kit de Pesas Ajustables 20kg", price: 129.99, oldPrice: 159.99, freeShipping: true, installments: 12 },
  { id: 2, title: "Mat de Yoga Antideslizante Pro", price: 45.00, oldPrice: null, freeShipping: false, installments: 6 },
  { id: 3, title: "Proteína Whey Isolate 5lbs", price: 89.50, oldPrice: 110.00, freeShipping: true, installments: 12 },
  { id: 4, title: "Bandas de Resistencia Set x5", price: 15.99, oldPrice: null, freeShipping: false, installments: null },
  { id: 5, title: "Botella Térmica Deportiva 1L", price: 22.00, oldPrice: 28.00, freeShipping: true, installments: null },
  { id: 6, title: "Reloj Inteligente Fitness Tracker", price: 199.99, oldPrice: 250.00, freeShipping: true, installments: 12 },
];

export default function StorePage() {
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
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Deportes</h2>
            
            {/* Categorías */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Categorías</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="cursor-pointer hover:text-indigo-600">Pesas y Mancuernas (120)</li>
                <li className="cursor-pointer hover:text-indigo-600">Ropa Deportiva (340)</li>
                <li className="cursor-pointer hover:text-indigo-600">Suplementos (85)</li>
                <li className="cursor-pointer hover:text-indigo-600">Accesorios (50)</li>
              </ul>
            </div>

            {/* Filtro de Precio */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Precio</h3>
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="number" 
                  placeholder="Mín" 
                  className="w-20 p-2 text-sm border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  placeholder="Máx" 
                  className="w-20 p-2 text-sm border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
                />
                <button className="bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center text-gray-600">
                  {/* Flechita svg */}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>

            {/* Switch de Envío */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Envío</h3>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-4 h-4 border border-gray-300 rounded bg-white group-hover:border-indigo-500"></div>
                <span className="text-sm text-green-600 font-bold">Llega gratis mañana</span>
              </label>
            </div>
          </aside>


          {/* --- GRILLA DE PRODUCTOS (Derecha) --- */}
          <main className="flex-1">
            
            {/* Cabecera de Resultados */}
            <div className="bg-white p-4 rounded shadow-sm mb-4 flex justify-between items-center">
              <span className="text-gray-700 text-sm">{PRODUCTS.length} resultados</span>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Ordenar por:</span>
                <select className="font-semibold text-gray-800 bg-transparent focus:outline-none cursor-pointer">
                  <option>Más relevantes</option>
                  <option>Menor precio</option>
                  <option>Mayor precio</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRODUCTS.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE TARJETA (Estilo ML) ---
function ProductCard({ product }: { product: any }) {
  // Calculamos porcentaje de descuento si existe
  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-md border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer group overflow-hidden">
      
      {/* Imagen */}
      <div className="h-56 bg-gray-50 relative flex items-center justify-center p-4 border-b border-gray-100">
         {/* Placeholder de imagen */}
         <div className="text-gray-300 group-hover:scale-105 transition-transform duration-300">
           <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
         </div>
         {/* Badge de Oferta (Opcional) */}
         {discount > 0 && (
           <span className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
             OFERTA DEL DÍA
           </span>
         )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Precio y Descuento */}
        <div className="mb-2">
           {product.oldPrice && (
             <span className="text-xs text-gray-400 line-through block">${product.oldPrice}</span>
           )}
           <div className="flex items-center gap-2">
             <span className="text-2xl font-light text-gray-900">${product.price}</span>
             {discount > 0 && (
               <span className="text-sm text-green-600 font-medium">{discount}% OFF</span>
             )}
           </div>
        </div>

        {/* Cuotas */}
        {product.installments && (
          <p className="text-sm text-gray-900 mb-2">
            en <span className="font-medium text-green-600">{product.installments}x cuotas</span> sin interés
          </p>
        )}

        {/* Envío */}
        {product.freeShipping && (
           <p className="text-xs font-bold text-green-600 mb-2">Envío gratis ⚡</p>
        )}

        {/* Título */}
        <h3 className="text-sm text-gray-600 font-light leading-snug group-hover:text-indigo-600 transition-colors">
          {product.title}
        </h3>
      </div>
    </div>
  );
}