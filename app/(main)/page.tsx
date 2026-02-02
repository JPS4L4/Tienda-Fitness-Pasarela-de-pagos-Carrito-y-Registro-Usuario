"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import ItemCard from "@/components/cards/ItemCard";
import {PlanCard} from "@/components/cards/PlanCard";
import { CommentsCard } from "@/components/cards/CommentsCard";
import AddReviewForm from "@/components/others/AddReviewForm";
import HeroCarousel from "@/components/others/HeroCarousel";
import OffersCarousel from "@/components/others/OffersCarousel";
import {db} from "@/app/data/data";
import { ItemUI } from "../src/types/item";
import { PlanUI } from "../src/types/plan";
import { CommentsUI } from "../src/types/comments";
import { ItemCardSkeleton } from "@/components/skeletons/ItemCardSkeleton";
import { PlanCardSkeleton } from "@/components/skeletons/PlanCardSkeleton";

export default function Home() {

  const [featuredItems, setFeaturedItems] = useState<ItemUI[]>([]);
  const [featuredPlans, setFeaturedPlans] = useState<PlanUI[]>([]);
  const [comments, setComments] = useState<CommentsUI[]>([]);
  const [loadingItems, setLoadingItems] = useState(true)
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [loadingComments, setLoadingComments] = useState(true)

  // Función para recargar comentarios
  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch("/api/comments");
      if (!res.ok) {
        throw new Error("Error al cargar comentarios");
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Formato de comentarios inválido");
      }
      setComments(data);
    } catch (error) {
      console.error(error);
      setComments(
        db.comments.map(comment => ({
          ...comment,
          rating: comment.rating ?? 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        })) as CommentsUI[]
      );
    } finally {
      setLoadingComments(false);
    }
  };


   useEffect(() => {
  fetch("/api/items")
    .then(res => res.json())
    .then(setFeaturedItems)
    .finally(() => setLoadingItems(false))
}, [])

useEffect(() => {
  fetch("/api/plans")
    .then(res => res.json())
    .then(setFeaturedPlans)
    .finally(() => setLoadingPlans(false))
}, [])

useEffect(() => {
  loadComments();
}, [])


  return (
    <main className="min-h-screen bg-white text-black">
      
      {/* 1. HERO CAROUSEL - Rotador automático de banners */}
      <HeroCarousel />


      {/* 2. PLANES (Algunos planes) */}
      <section className="py-20 px-4 container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 uppercase tracking-widest">Nuestros Planes</h2>
        {/* Mostrar algunos planes destacados */}
       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 justify-items-center">
              {loadingPlans
          ? Array.from({ length: 3 }).map((_, i) => (
              <PlanCardSkeleton key={i} />
            ))
          : featuredPlans.slice(1, 4).map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))
        }
      </div>
        
        <a href="/plans">
         <div className="text-center text-white font-semibold text-lg py-6 mt-4 mx-auto rounded-3xl bg-indigo-800 hover:bg-indigo-700 md:max-w-2xl">¿Deseas ver más?</div>
        </a>
      </section>


      {/* 3. OFERTAS (Carousel de Ofertas) */}
      <section className="container mx-auto px-4 my-12">
        <OffersCarousel />
      </section>

      {/* 5. PRODUCTOS (Grid de Productos) */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-bold uppercase tracking-widest">Tienda</h2>
          <a href="/items" className="text-indigo-600 hover:underline text-sm font-medium">Ver todo →</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loadingItems
            ? Array.from({ length: 4 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))
            : featuredItems.slice(0, 4).map(item => (
                <ItemCard key={item.id} {...item} />
              ))
          }
        </div>
        
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
      {loadingComments ? (
        <div className="text-slate-400 text-center w-full py-8">
          Cargando comentarios...
        </div>
      ) : comments.length > 0 ? (
        comments.slice(0,5).map((review) => (
          <CommentsCard key={review.id} {...review} />
        ))
      ) : (
        <div className="text-slate-400 text-center w-full py-8">
          No hay comentarios disponibles
        </div>
      )}
    </div>
  </div>
</section>


      {/* 6. AGREGAR RESEÑA */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-3">
                Tu Opinión Importa
              </h2>
              <p className="text-slate-600 text-lg">
                Comparte tu experiencia y ayuda a otros a tomar la mejor decisión
              </p>
            </div>
            
            <AddReviewForm onReviewAdded={loadComments} />
          </div>
        </div>
      </section>
      </section>

      {/* 7. Info del Entrenador - Hernán Salazar */}
      <section className="py-24 bg-linear-to-br from-indigo-50 via-white to-slate-50 relative overflow-hidden">
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Título de sección */}
          <div className="text-center mb-16">
            <span className="inline-block text-indigo-600 font-bold text-sm uppercase tracking-widest mb-3">
              Conoce a tu entrenador
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Hernán Salazar
            </h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
          </div>

          {/* Contenido principal */}
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-16">
              
              {/* Columna de imagen */}
              <div className="lg:w-2/5 shrink-0">
                <div className="relative">
                  {/* Decoración circular detrás de la imagen */}
                  <div className="absolute -inset-4 bg-linear-to-r from-indigo-600 to-purple-600 rounded-full blur-2xl opacity-20"></div>
                  
                  {/* Imagen del entrenador */}
                  <div className="relative">
                    <img 
                      src="/hernan-salazar.jpg" 
                      alt="Hernán Salazar - Entrenador Personal Certificado" 
                      className="w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full object-cover mx-auto shadow-2xl ring-8 ring-white"
                    />
                    
                    {/* Badge de certificación */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-xl px-6 py-3 border-4 border-indigo-100">
                      <p className="text-indigo-600 p-2 text-center font-black text-sm">+10 Años Experiencia</p>
                    </div>
                  </div>
                </div>

                {/* Stats cards */}
                <div className="flex justify-around items-center gap-4 mt-12">
                  <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                    <p className="text-3xl font-black text-indigo-600">30+</p>
                    <p className="text-xs text-slate-600 font-semibold mt-1">Clientes</p>
                  </div>
                 
                  <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                    <p className="text-3xl font-black text-indigo-600">98%</p>
                    <p className="text-xs text-slate-600 font-semibold mt-1">Éxito</p>
                  </div>
                </div>
              </div>

              {/* Columna de texto */}
              <div className="lg:w-3/5 space-y-6">
                {/* Bio principal */}
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Transformando Vidas a Través del Fitness
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Con más de una década de experiencia en entrenamiento personalizado y nutrición deportiva, 
                    he dedicado mi carrera a ayudar a personas de todos los niveles a alcanzar sus objetivos de fitness 
                    y bienestar.
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    Mi enfoque combina ciencia del ejercicio, planificación nutricional personalizada y motivación 
                    constante para crear transformaciones reales y duraderas. No se trata solo de cambiar tu cuerpo, 
                    sino de transformar tu mentalidad y estilo de vida.
                  </p>
                </div>

                {/* Certificaciones y especialidades */}
                <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Certificaciones & Especialidades
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Certificado en Entrenamiento Personal (ISSA)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Especialista en Nutrición Deportiva</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Entrenamiento Funcional & HIIT</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Rehabilitación y Prevención de Lesiones</span>
                    </li>
                  </ul>
                </div>

                {/* CTA */}
                <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl">
                  <h3 className="text-xl font-bold mb-3">¿Listo para comenzar tu transformación?</h3>
                  <p className="text-slate-300 mb-6 text-sm">
                    Agenda una consulta gratuita y descubre cómo puedo ayudarte a alcanzar tus metas.
                  </p>
                  <Link 
                    href="/contact" 
                    className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    Contactar Ahora
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
