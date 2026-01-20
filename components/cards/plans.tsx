"use client"
import { Check, Apple, Dumbbell, ArrowRight } from "lucide-react";
import Link from "next/link";

const typeStyles = {
  nutricion: {
    icon: <Apple className="text-emerald-500" size={20} />,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    button: "bg-emerald-600 hover:bg-emerald-700",
    accent: "text-emerald-600"
  },
  entrenamiento: {
    icon: <Dumbbell className="text-blue-500" size={20} />,
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    button: "bg-blue-600 hover:bg-blue-700",
    accent: "text-blue-600"
  }
};

export const PlanCard = ({ plan }: { plan: any }) => {
  const style = typeStyles[plan.type as keyof typeof typeStyles];

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between h-full hover:shadow-2xl hover:border-slate-300 transition-all duration-300 relative overflow-hidden">
      
      {/* Decoración sutil de fondo */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />

      <div className="relative">
        {/* Header: Icono + Badge */}
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-slate-50 rounded-xl">
            {style.icon}
          </div>
          <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${style.badge}`}>
            {plan.type}
          </span>
        </div>

        {/* Título y Precio */}
        <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">
          {plan.title}
        </h3>
        
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-3xl font-extrabold text-slate-900">
            {plan.price?.replace("Desde ", "")}
          </span>
          <span className="text-slate-500 text-sm">/ total</span>
        </div>

        {/* Lista de beneficios */}
        <ul className="space-y-4 mb-8">
          {plan.coverage.map((c: string, i: number) => (
            <li key={i} className="flex items-start gap-3 group/item">
              <div className={`mt-1 rounded-full p-0.5 ${style.accent} bg-opacity-10`}>
                <Check size={16} strokeWidth={3} />
              </div>
              <span className="text-slate-600 text-sm leading-relaxed group-hover/item:text-slate-900 transition-colors">
                {c}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Acción */}
      <Link 
        href={`/plans/${plan.slug}`} 
        className={`flex items-center justify-center gap-2 w-full ${style.button} text-white py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-transparent hover:shadow-current/20`}
        prefetch>
        Saber más
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};