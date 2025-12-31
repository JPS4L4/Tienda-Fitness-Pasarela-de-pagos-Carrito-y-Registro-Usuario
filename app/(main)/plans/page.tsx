"use client";

import { useState } from "react";

// Datos de los planes (Configuración fácil)
const PLANS = [
  {
    id: "basic",
    name: "Inicial",
    description: "Para quienes recién comienzan a moverse.",
    priceMonthly: 29,
    priceYearly: 290, // Ahorro de 2 meses
    features: [
      "Acceso al gimnasio (Horario valle)",
      "Uso de casilleros estándar",
      "1 Clase grupal por semana",
      "Acceso a la app básica"
    ],
    notIncluded: ["Entrenador personal", "Zona de spa"],
    popular: false,
    color: "bg-gray-100 text-gray-900" // Botón discreto
  },
  {
    id: "pro",
    name: "Pro Athlete",
    description: "El favorito para ver resultados reales.",
    priceMonthly: 59,
    priceYearly: 590,
    features: [
      "Acceso ilimitado 24/7",
      "Todas las clases grupales incluidas",
      "Acceso a zona de Spa y Sauna",
      "Plan nutricional trimestral",
      "App Pro con rutinas en video"
    ],
    notIncluded: ["Entrenador personal 1 a 1"],
    popular: true, // Este activará el diseño destacado
    color: "bg-indigo-600 text-white hover:bg-indigo-700" // Botón llamativo
  },
  {
    id: "elite",
    name: "Elite Personal",
    description: "Máxima atención y personalización.",
    priceMonthly: 99,
    priceYearly: 990,
    features: [
      "Todo lo incluido en Pro",
      "Entrenador Personal (4 sesiones/mes)",
      "Ropa y toallas limpias cada visita",
      "Bebidas isotónicas ilimitadas",
      "Parqueadero reservado"
    ],
    notIncluded: [],
    popular: false,
    color: "bg-gray-900 text-white hover:bg-gray-800" // Botón elegante
  }
];

export default function PlansPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      
      {/* CABECERA Y TOGGLE */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Elige tu nivel de compromiso</h1>
        <p className="text-gray-500 mb-8">Sin matrículas ocultas. Cancela o cambia de plan cuando quieras.</p>

        {/* Toggle Mensual / Anual */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${billing === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
            Pago Mensual
          </span>
          
          <button 
            onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-8 bg-indigo-600 rounded-full p-1 transition-colors duration-300 focus:outline-none"
          >
            <div 
              className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${billing === "yearly" ? "translate-x-6" : "translate-x-0"}`} 
            />
          </button>

          <span className={`text-sm font-medium ${billing === "yearly" ? "text-gray-900" : "text-gray-500"}`}>
            Pago Anual <span className="text-indigo-600 text-xs font-bold bg-indigo-50 px-2 py-0.5 rounded-full ml-1">-15%</span>
          </span>
        </div>
      </div>

      {/* GRILLA DE PLANES */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative flex flex-col p-8 rounded-2xl transition-all duration-300 ${
              plan.popular 
                ? "bg-white border-2 border-indigo-500 shadow-2xl scale-105 z-10" 
                : "bg-white border border-gray-200 shadow-sm hover:shadow-lg"
            }`}
          >
            {/* Badge de Popular */}
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full tracking-wide uppercase">
                Más Elegido
              </div>
            )}

            {/* Título y Precio */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1 h-10">{plan.description}</p>
            </div>

            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900">
                ${billing === "monthly" ? plan.priceMonthly : plan.priceYearly}
              </span>
              <span className="text-gray-500 font-medium">
                /{billing === "monthly" ? "mes" : "año"}
              </span>
            </div>

            {/* Botón CTA */}
            <button className={`w-full py-3 rounded-xl font-bold transition-colors mb-8 ${plan.color}`}>
              Elegir {plan.name}
            </button>

            {/* Lista de Features */}
            <ul className="space-y-4 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
              {/* Features No Incluidos (Opcional, para comparar) */}
              {plan.notIncluded.map((item, i) => (
                <li key={`not-${i}`} className="flex items-start gap-3 text-sm text-gray-400">
                  <XIcon className="w-5 h-5 text-gray-300 shrink-0" />
                  <span className="line-through decoration-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* SECCIÓN DE GARANTÍA (Confianza) */}
      <div className="mt-20 text-center">
        <p className="text-gray-500 text-sm">
          Todos los planes incluyen nuestra garantía de devolución de 30 días. <br />
          ¿Tienes dudas? <a href="/contact" className="text-indigo-600 font-medium underline">Contáctanos</a>.
        </p>
      </div>

    </div>
  );
}

// --- ICONOS SVG ---

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}