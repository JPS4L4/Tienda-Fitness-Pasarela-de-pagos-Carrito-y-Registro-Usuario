"use client"

import Link from "next/link";
import itemCard from "@/components/cards/items";
import { PlanCard } from "@/components/cards/plans";
import { CommentsCard } from "@/components/cards/comments";
import {db} from "@/app/data/data";

const featuredItems = db.items;
const featuredPlans = db.plans;
const reviews = db.comments;

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
        {/* Mostrar algunos planes destacados */}
       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 justify-items-center">
        {featuredPlans.slice(1,4).map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
        
        <a href="/plans">
         <div className="text-center text-white font-semibold text-lg py-6 mt-4 mx-auto rounded-3xl bg-indigo-800 hover:bg-indigo-700 md:max-w-2xl">¿Deseas ver más?</div>
        </a>
      </section>


      {/* 3. OFERTAS (Ofertas que tiene la página) */}
      <section className="bg-red-700 text-white py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-4">Oferta de Verano: 50% OFF</h2>
            <p className="text-white mb-6">Únete antes del fin de mes y obtén la mitad de precio en tu primer trimestre. Sin compromisos a largo plazo.</p>
            <button className="bg-white text-red-700 px-6 py-2 rounded font-bold hover:bg-indigo-50 transition-colors">
              Reclamar Oferta
            </button>
          </div>
          {/* Decoración visual simple */}
          <div className="text-9xl font-extrabold opacity-20 select-none">
            ¡SALE!
          </div>
        </div>
      </section>


      {/* 4. CARRUSEL DE INFO */}
<section className="py-24 bg-slate-50 overflow-hidden">
  <div className="container mx-auto px-4">
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
      <div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          Lo que dicen nuestros usuarios
        </h2>
        <p className="text-slate-500 mt-2">Historias reales de transformación y disciplina.</p>
      </div>
      
      {/* Indicador visual de scroll para móvil */}
      <div className="text-slate-400 text-xs font-bold tracking-widest uppercase md:hidden">
        Desliza para leer →
      </div>
    </div>
    
    <div className="flex overflow-x-auto gap-8 pb-10 snap-x snap-mandatory scrollbar-hide">
      {reviews.map((review, index) => (
        <CommentsCard key={index} {...review} />
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
            {featuredItems.slice(0,4).map((item) => (
              <div key={item.id}>
                {itemCard(item)}
              </div>
          ))}
        </div>
      </section>

    </main>
  );
}