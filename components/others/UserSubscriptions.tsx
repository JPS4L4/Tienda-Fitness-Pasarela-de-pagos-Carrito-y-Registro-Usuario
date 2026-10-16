"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Calendar, CheckCircle, XCircle, Key, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface Subscription {
  id: number;
  planId: number;
  status: string;
  startDate: string;
  endDate: string | null;
  accessToken: string;
  isValid: boolean;
  plan: {
    id: number;
    title: string;
    type: string;
    image: string | null;
    slug: string;
  };
}

export default function UserSubscriptions() {
  const { status } = useSession();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSubscriptions();
    }
  }, [status]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al cargar suscripciones");
      }

      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar tus suscripciones");
    } finally {
      setLoading(false);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Token copiado al portapapeles", { duration: 2000 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center py-12">
        <p className="text-muted mb-4">Debes iniciar sesión para ver tus suscripciones</p>
        <Link
          href="/login"
          className="inline-block bg-accent text-on-accent px-6 py-2  hover:bg-accent-hover transition"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-surface-2  w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-10 h-10 text-subtle" />
        </div>
        <h3 className="text-xl font-semibold text-fg mb-2">
          No tienes suscripciones activas
        </h3>
        <p className="text-muted mb-6">
          Explora nuestros planes y encuentra el perfecto para ti
        </p>
        <Link
          href="/plans"
          className="inline-block bg-accent text-on-accent px-6 py-3  hover:bg-accent-hover transition"
        >
          Ver Planes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-fg mb-6">Mis Suscripciones</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subscriptions.map((subscription) => {
          const daysRemaining = getDaysRemaining(subscription.endDate);
          const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;

          return (
            <div
              key={subscription.id}
              className={`bg-surface  border-2 p-6 transition-all  ${
                subscription.isValid && subscription.status === "active"
                  ? "border-ok"
                  : "border-line opacity-75"
              }`}
            >
              {/* Header con tipo de plan */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-1  text-xs font-bold uppercase ${
                        subscription.plan.type === "nutricion"
                          ? "bg-ok/10 text-ok"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      {subscription.plan.type}
                    </span>
                    {subscription.isValid && subscription.status === "active" ? (
                      <CheckCircle className="w-5 h-5 text-ok" />
                    ) : (
                      <XCircle className="w-5 h-5 text-danger" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-fg">
                    {subscription.plan.title}
                  </h3>
                </div>
              </div>

              {/* Fechas */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Inicio: {formatDate(subscription.startDate)}</span>
                </div>
                {subscription.endDate && (
                  <div className="flex items-center text-sm text-muted">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Vence: {formatDate(subscription.endDate)}</span>
                  </div>
                )}
              </div>

              {/* Días restantes */}
              {daysRemaining !== null && subscription.isValid && (
                <div
                  className={`mb-4 px-3 py-2  text-sm font-medium ${
                    isExpiringSoon
                      ? "bg-accent/10 text-accent"
                      : "bg-ok/10 text-ok"
                  }`}
                >
                  {daysRemaining > 0
                    ? `${daysRemaining} días restantes`
                    : "Expira hoy"}
                </div>
              )}

              {/* Estado */}
              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1  text-xs font-bold ${
                    subscription.status === "active" && subscription.isValid
                      ? "bg-ok/10 text-ok"
                      : subscription.status === "expired"
                      ? "bg-danger/10 text-danger"
                      : "bg-surface-2 text-fg-soft"
                  }`}
                >
                  {subscription.status === "active" && subscription.isValid
                    ? "Activa"
                    : subscription.status === "expired"
                    ? "Expirada"
                    : "Cancelada"}
                </span>
              </div>

              {/* Token de acceso */}
              {subscription.isValid && subscription.status === "active" && (
                <div className="mb-4 p-3 bg-surface-2 ">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-muted" />
                      <span className="text-xs font-medium text-muted">
                        Token de Acceso
                      </span>
                    </div>
                    <button
                      onClick={() => copyToken(subscription.accessToken)}
                      className="text-xs text-accent hover:text-accent font-medium"
                    >
                      Copiar
                    </button>
                  </div>
                  <code className="text-xs text-fg font-mono block mt-2 break-all">
                    {subscription.accessToken.substring(0, 32)}...
                  </code>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-2">
                <Link
                  href={`/plans/${subscription.plan.slug}`}
                  className="flex-1 bg-accent text-on-accent px-4 py-2  hover:bg-accent-hover transition text-center text-sm font-medium flex items-center justify-center gap-2"
                >
                  Ver Plan
                  <ExternalLink className="w-4 h-4" />
                </Link>
                {!subscription.isValid && (
                  <Link
                    href={`/checkout?type=plan&planId=${subscription.planId}`}
                    className="flex-1 bg-ok text-on-accent px-4 py-2  hover:bg-ok transition text-center text-sm font-medium"
                  >
                    Renovar
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
