"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import ItemCard from "@/components/cards/ItemCard";
import { PlanCard } from "@/components/cards/PlanCard";
import { CommentsCard } from "@/components/cards/CommentsCard";
import AddReviewForm from "@/components/others/AddReviewForm";
import HeroCarousel from "@/components/others/HeroCarousel";
import OffersCarousel from "@/components/others/OffersCarousel";
import { SafeImage } from "@/components/others/SafeImage";
import { db } from "@/app/data/data";
import { ItemUI } from "../src/types/item";
import { PlanUI } from "../src/types/plan";
import { CommentsUI } from "../src/types/comments";
import { ItemCardSkeleton } from "@/components/skeletons/ItemCardSkeleton";
import { PlanCardSkeleton } from "@/components/skeletons/PlanCardSkeleton";
import StateMessage from "@/components/others/StateMessage";

const CERTIFICATIONS = [
  "Certificado en Entrenamiento Personal (ISSA)",
  "Especialista en Nutrición Deportiva",
  "Entrenamiento Funcional & HIIT",
  "Rehabilitación y Prevención de Lesiones",
];

const SectionHeading = ({ title, href, cta }: { title: string; href?: string; cta?: string }) => (
  <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
    <div className="section-heading">
      <h2 className="text-4xl md:text-6xl">{title}</h2>
    </div>
    {href && (
      <Link
        href={href}
        className="hidden items-center gap-2 pb-1 font-extrabold uppercase tracking-[0.12em] text-fg transition-colors hover:text-accent sm:inline-flex"
      >
        {cta ?? "Ver todo"}
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Link>
    )}
  </div>
);

export default function HomeClient() {
  const [featuredItems, setFeaturedItems] = useState<ItemUI[]>([]);
  const [featuredPlans, setFeaturedPlans] = useState<PlanUI[]>([]);
  const [comments, setComments] = useState<CommentsUI[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [errorItems, setErrorItems] = useState(false);
  const [errorPlans, setErrorPlans] = useState(false);

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
        db.comments.map((comment) => ({
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

  const fetchList = <T,>(
    url: string,
    set: (data: T[]) => void,
    setLoading: (v: boolean) => void,
    setError: (v: boolean) => void
  ) => {
    setLoading(true);
    setError(false);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(url);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error(url);
        set(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  const loadItems = () => fetchList<ItemUI>("/api/items", setFeaturedItems, setLoadingItems, setErrorItems);
  const loadPlans = () => fetchList<PlanUI>("/api/plans", setFeaturedPlans, setLoadingPlans, setErrorPlans);

  useEffect(() => {
    loadItems();
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadComments();
  }, []);

  return (
    <main className="min-h-screen bg-bg text-fg">
      {/* 1. HERO */}
      <HeroCarousel />

      {/* 2. TIENDA */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <SectionHeading title="Tienda" href="/items" />

        {errorItems ? (
          <StateMessage
            tone="error"
            icon="!"
            title="No pudimos cargar los productos"
            description="Inténtalo de nuevo en unos segundos."
            action={{ label: "Reintentar", onClick: loadItems }}
          />
        ) : !loadingItems && featuredItems.length === 0 ? (
          <StateMessage icon="∅" title="Aún no hay productos" description="Estamos preparando el catálogo de la tienda." />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {loadingItems
              ? Array.from({ length: 4 }).map((_, i) => <ItemCardSkeleton key={i} />)
              : featuredItems.slice(0, 4).map((item) => <ItemCard key={item.id} {...item} />)}
          </div>
        )}

        <div className="mt-8 sm:hidden">
          <Link href="/items" className="btn btn-secondary btn-block">
            Ver toda la tienda
          </Link>
        </div>
      </section>

      {/* 3. OFERTAS */}
      <OffersCarousel />

      {/* 4. PLANES */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <SectionHeading title="Nuestros planes" href="/plans" />
        {errorPlans ? (
          <StateMessage
            tone="error"
            icon="!"
            title="No pudimos cargar los planes"
            description="Inténtalo de nuevo en unos segundos."
            action={{ label: "Reintentar", onClick: loadPlans }}
          />
        ) : !loadingPlans && featuredPlans.length === 0 ? (
          <StateMessage
            icon="∅"
            title="Pronto habrá nuevos planes"
            description="Estamos preparando planes de nutrición y entrenamiento."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {loadingPlans
              ? Array.from({ length: 3 }).map((_, i) => <PlanCardSkeleton key={i} />)
              : featuredPlans.slice(0, 3).map((plan) => <PlanCard key={plan.id} plan={plan} />)}
          </div>
        )}
        <div className="mt-8 sm:hidden">
          <Link href="/plans" className="btn btn-secondary btn-block">
            Ver todos los planes
          </Link>
        </div>
      </section>

      {/* 5. EQUIPO */}
      <section className="border-y border-line bg-surface py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-[5fr_6fr] lg:gap-16">
            <div>
              <div className="media cut-both aspect-[4/5] max-h-[620px] w-full">
                <SafeImage
                  src="/images/team/entrenador.webp"
                  alt="Entrenador guiando un ejercicio de plancha a una alumna"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-accent px-5 py-3 text-on-accent">
                  <p className="font-display text-xl uppercase leading-none sm:text-2xl">Planificación personalizada</p>
                </div>
              </div>
            </div>

            <div>
              <div className="section-heading">
                <h2 className="text-4xl md:text-6xl">Equipo fitness</h2>
              </div>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-fg-soft">
                Con más de una década de experiencia en entrenamiento personalizado y nutrición deportiva, he dedicado mi
                carrera a ayudar a personas de todos los niveles a alcanzar sus objetivos de fitness y bienestar.
              </p>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted">
                Mi enfoque combina ciencia del ejercicio, planificación nutricional personalizada y motivación constante
                para crear transformaciones reales y duraderas.
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-px border border-line bg-line">
                <div className="bg-bg p-6">
                  <dd className="price text-6xl text-accent">30+</dd>
                  <dt className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-muted">Clientes</dt>
                </div>
                <div className="bg-bg p-6">
                  <dd className="price text-6xl text-accent">98%</dd>
                  <dt className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-muted">Éxito</dt>
                </div>
              </dl>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {CERTIFICATIONS.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-fg-soft">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={3} aria-hidden="true" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link href="/contact" className="btn btn-primary btn-lg">
                  Contactar ahora
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OPINIONES */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <div className="section-heading">
              <h2 className="text-4xl md:text-6xl">Lo que dicen nuestros usuarios</h2>
            </div>
            <p className="mt-4 max-w-xl text-muted">Historias reales de transformación y disciplina.</p>
          </div>

          <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:gap-6">
            {loadingComments ? (
              <div className="w-full py-8 text-center text-subtle">Cargando comentarios...</div>
            ) : comments.length > 0 ? (
              comments.slice(0, 5).map((review) => <CommentsCard key={review.id} {...review} />)
            ) : (
              <div className="w-full py-8 text-center text-subtle">No hay comentarios disponibles</div>
            )}
          </div>
        </div>
      </section>

      {/* 7. AGREGAR RESEÑA */}
      <section className="border-t border-line bg-surface py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl">Tu opinión importa</h2>
              <p className="mt-3 text-lg text-muted">Comparte tu experiencia y ayuda a otros a elegir mejor.</p>
            </div>
            <AddReviewForm onReviewAdded={loadComments} />
          </div>
        </div>
      </section>
    </main>
  );
}
