"use client"

import Link from "next/link";
import itemCard from "@/components/cards/items";
import { featuredProducts } from "@/components/cards/items";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      
      {/* 1. HERO SECTION (Imagen con algo de fondo) */}
      {/* Usamos h-[80vh] para que ocupe el 80% de la altura de la pantalla */}
      <section className="relative h-[85vh] w-full flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Simulación de Imagen de Fondo (Overlay oscuro para que el texto se lea) */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
        
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase">
            Define tu Fuerza
          </h1>
          <p className="text-xl text-gray-200 mb-8 font-light">
            Entrenamiento personalizado y nutrición consciente para tu mejor versión.
          </p>
          <Link href="/plans" className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest text-sm">
            Comenzar Ahora
          </Link>
        </div>
      </section>


      {/* 2. PLANES (Algunos planes) */}
      <section className="py-20 px-4 container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 uppercase tracking-widest">Nuestros Planes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan Básico */}
          <div className="border border-gray-200 p-8 rounded-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-4">Básico</h3>
            <p className="text-4xl font-bold mb-6">$29<span className="text-sm font-normal text-gray-500">/mes</span></p>
            <ul className="space-y-3 text-gray-600 mb-8 text-sm">
              <li>• Acceso a gimnasio</li>
              <li>• 1 Clase grupal</li>
            </ul>
            <button className="w-full border border-black py-2 font-medium hover:bg-black hover:text-white transition-colors">Elegir</button>
          </div>

          {/* Plan Pro (Destacado) */}
          <div className="bg-black text-white p-8 rounded-lg shadow-2xl transform md:-translate-y-4">
            <div className="text-xs font-bold bg-indigo-500 inline-block px-2 py-1 rounded mb-4">MÁS POPULAR</div>
            <h3 className="text-xl font-bold mb-4">Pro Total</h3>
            <p className="text-4xl font-bold mb-6">$59<span className="text-sm font-normal text-gray-400">/mes</span></p>
            <ul className="space-y-3 text-gray-300 mb-8 text-sm">
              <li>• Acceso ilimitado</li>
              <li>• Clases grupales ilimitadas</li>
              <li>• Plan nutricional</li>
            </ul>
            <button className="w-full bg-white text-black py-2 font-medium hover:bg-gray-200 transition-colors">Elegir</button>
          </div>

          {/* Plan Premium */}
          <div className="border border-gray-200 p-8 rounded-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-4">Personal</h3>
            <p className="text-4xl font-bold mb-6">$99<span className="text-sm font-normal text-gray-500">/mes</span></p>
            <ul className="space-y-3 text-gray-600 mb-8 text-sm">
              <li>• Todo lo del plan Pro</li>
              <li>• Entrenador personal 1 a 1</li>
            </ul>
            <button className="w-full border border-black py-2 font-medium hover:bg-black hover:text-white transition-colors">Elegir</button>
          </div>
        </div>
        <a href="/plans">
         <div className="text-center text-white font-semibold text-lg py-6 mt-4 mx-auto rounded-3xl bg-indigo-900 hover:bg-indigo-700 md:max-w-2xl">¿Deseas ver más?</div>
        </a>
      </section>


      {/* 3. OFERTAS (Ofertas que tiene la página) */}
      <section className="bg-indigo-900 text-white py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-4">Oferta de Verano: 50% OFF</h2>
            <p className="text-indigo-200 mb-6">Únete antes del fin de mes y obtén la mitad de precio en tu primer trimestre. Sin compromisos a largo plazo.</p>
            <button className="bg-white text-indigo-900 px-6 py-2 rounded font-bold hover:bg-indigo-50 transition-colors">
              Reclamar Oferta
            </button>
          </div>
          {/* Decoración visual simple */}
          <div className="text-9xl font-black opacity-20 select-none">
            SALE
          </div>
        </div>
      </section>


      {/* 4. CARRUSEL DE INFO (Scroll Horizontal Nativo) */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Lo que dicen nuestros atletas</h2>
          
          {/* Contenedor con Scroll Horizontal (snap-x) */}
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="snap-center shrink-0 w-80 md:w-96 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-600 italic mb-4">"Increíble experiencia, logré mis objetivos en tiempo récord gracias a los entrenadores."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-bold text-sm">Usuario {item}</p>
                    <p className="text-xs text-gray-500">Atleta Amateur</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 5. PRODUCTOS (Grid de Productos) */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-bold uppercase tracking-widest">Tienda</h2>
          <a href="/products" className="text-indigo-600 hover:underline text-sm font-medium">Ver todo →</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.slice(0,4).map((product) => (
              <div key={product.id}>
                {itemCard(product)}
              </div>
          ))}
        </div>
      </section>

    </main>
  );
}