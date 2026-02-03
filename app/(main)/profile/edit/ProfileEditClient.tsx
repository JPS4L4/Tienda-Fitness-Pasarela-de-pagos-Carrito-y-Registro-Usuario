"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileData {
  name: string | null;
  email: string | null;
  phone: string | null;
  weightKg: string | null;
  heightCm: string | null;
  age: string | null;
  trainingTime: string | null;
  goal: string | null;
  equipmentAvailability: string | null;
  healthCondition: string | null;
}

export default function ProfileEditClient() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    weightKg: "",
    heightCm: "",
    age: "",
    trainingTime: "",
    goal: "",
    equipmentAvailability: "",
    healthCondition: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "No se pudo cargar el perfil");
        }
        setForm({
          name: data.user?.name ?? "",
          email: data.user?.email ?? "",
          phone: data.user?.phone ?? "",
          weightKg: data.user?.weightKg?.toString() ?? "",
          heightCm: data.user?.heightCm?.toString() ?? "",
          age: data.user?.age?.toString() ?? "",
          trainingTime: data.user?.trainingTime ?? "",
          goal: data.user?.goal ?? "",
          equipmentAvailability: data.user?.equipmentAvailability ?? "",
          healthCondition: data.user?.healthCondition ?? "",
        });
      } catch (err: any) {
        setError(err.message || "Error cargando el perfil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const hasFitnessProfile =
      Boolean(form.weightKg) &&
      Boolean(form.heightCm) &&
      Boolean(form.age) &&
      Boolean(form.trainingTime) &&
      Boolean(form.goal) &&
      Boolean(form.equipmentAvailability);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name || undefined,
          phone: form.phone || null,
          weightKg: form.weightKg ? Number(form.weightKg) : null,
          heightCm: form.heightCm ? Number(form.heightCm) : null,
          age: form.age ? Number(form.age) : null,
          trainingTime: form.trainingTime || null,
          goal: form.goal || null,
          equipmentAvailability: form.equipmentAvailability || null,
          healthCondition: form.healthCondition || null,
          ...(hasFitnessProfile ? { fitnessProfileCompleted: true } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "No se pudo guardar");
      }
      setSuccess("Perfil actualizado correctamente");
      setTimeout(() => router.push("/profile"), 1000);
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-linear-to-r from-teal-500 to-emerald-600 px-8 pt-10 pb-12 text-center">
            <h1 className="text-3xl font-extrabold text-white">Editar Perfil</h1>
            <p className="text-teal-100 mt-2">Actualiza tu información de contacto</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-10 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name || ""}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="w-full px-5 py-3.5 rounded-xl text-gray-800 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email || ""}
                disabled
                className="w-full px-5 py-3.5 rounded-xl text-gray-500 border border-slate-200 bg-slate-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone || ""}
                onChange={handleChange}
                placeholder="+57 300 123 4567"
                className="w-full px-5 py-3.5 rounded-xl text-gray-800 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
              />
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Perfil fitness</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="weightKg" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Peso (kg)
                  </label>
                  <input
                    id="weightKg"
                    name="weightKg"
                    type="number"
                    min="20"
                    max="400"
                    step="0.1"
                    value={form.weightKg || ""}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 rounded-xl text-gray-800 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label htmlFor="heightCm" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Altura (cm)
                  </label>
                  <input
                    id="heightCm"
                    name="heightCm"
                    type="number"
                    min="120"
                    max="250"
                    step="0.1"
                    value={form.heightCm || ""}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 rounded-xl text-gray-800 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Edad
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="10"
                    max="100"
                    value={form.age || ""}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 rounded-xl text-gray-800 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="trainingTime" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tiempo entrenando
                  </label>
                  <select
                    id="trainingTime"
                    name="trainingTime"
                    value={form.trainingTime || ""}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 rounded-xl text-gray-800 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all bg-slate-50/50"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="0-6 meses">0-6 meses</option>
                    <option value="6-12 meses">6-12 meses</option>
                    <option value="1-3 años">1-3 años</option>
                    <option value="3+ años">3+ años</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Objetivo principal
                  </label>
                  <select
                    id="goal"
                    name="goal"
                    value={form.goal || ""}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 rounded-xl text-gray-800 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all bg-slate-50/50"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Bajar de peso">Bajar de peso</option>
                    <option value="Ganar masa muscular">Ganar masa muscular</option>
                    <option value="Recomposición corporal">Recomposición corporal</option>
                    <option value="Mejorar rendimiento">Mejorar rendimiento</option>
                    <option value="Mantener">Mantener</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="equipmentAvailability" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Disponibilidad de equipos
                </label>
                <select
                  id="equipmentAvailability"
                  name="equipmentAvailability"
                  value={form.equipmentAvailability || ""}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 rounded-xl text-gray-800 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all bg-slate-50/50"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Sin equipo">Sin equipo</option>
                  <option value="Básico (mancuernas/bandas)">Básico (mancuernas/bandas)</option>
                  <option value="Gimnasio completo">Gimnasio completo</option>
                  <option value="Mixto">Mixto</option>
                </select>
              </div>

              <div className="mt-4">
                <label htmlFor="healthCondition" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Condición médica (opcional)
                </label>
                <textarea
                  id="healthCondition"
                  name="healthCondition"
                  rows={3}
                  value={form.healthCondition || ""}
                  onChange={handleChange}
                  placeholder="Indícanos si tienes alguna lesión, enfermedad o condición relevante"
                  className="w-full px-5 py-3.5 rounded-xl text-gray-800 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="w-full px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`w-full px-6 py-3 rounded-xl font-semibold text-white transition-colors ${
                  saving
                    ? "bg-teal-300 cursor-not-allowed"
                    : "bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
                }`}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
