"use client";

import { useEffect, useMemo, useState } from "react";

interface FitnessProfileForm {
  weightKg: string;
  heightCm: string;
  age: string;
  trainingTime: string;
  goal: string;
  equipmentAvailability: string;
  healthCondition: string;
}

const defaultForm: FitnessProfileForm = {
  weightKg: "",
  heightCm: "",
  age: "",
  trainingTime: "",
  goal: "",
  equipmentAvailability: "",
  healthCondition: "",
};

export default function FitnessProfileGate({ forceComplete = false }: { forceComplete?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FitnessProfileForm>(defaultForm);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.status === 401) {
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          return;
        }

        const user = data.user;
        if (!active) return;

        setForm({
          weightKg: user?.weightKg?.toString() ?? "",
          heightCm: user?.heightCm?.toString() ?? "",
          age: user?.age?.toString() ?? "",
          trainingTime: user?.trainingTime ?? "",
          goal: user?.goal ?? "",
          equipmentAvailability: user?.equipmentAvailability ?? "",
          healthCondition: user?.healthCondition ?? "",
        });

        if (!user?.fitnessProfileCompleted) {
          setOpen(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const parsedValues = useMemo(() => {
    const weightKg = form.weightKg ? Number(form.weightKg) : null;
    const heightCm = form.heightCm ? Number(form.heightCm) : null;
    const age = form.age ? Number(form.age) : null;

    return { weightKg, heightCm, age };
  }, [form.age, form.heightCm, form.weightKg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightKg: parsedValues.weightKg,
          heightCm: parsedValues.heightCm,
          age: parsedValues.age,
          trainingTime: form.trainingTime || null,
          goal: form.goal || null,
          equipmentAvailability: form.equipmentAvailability || null,
          healthCondition: form.healthCondition || null,
          fitnessProfileCompleted: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "No se pudo guardar el formulario");
      }

      setSuccess("Formulario guardado correctamente");
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Error al guardar el formulario");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-linear-to-r from-emerald-600 to-teal-600 px-8 py-10 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">Completa tu perfil fitness</h2>
          <p className="mt-2 text-emerald-100">
            Esta información nos ayuda a recomendarte el plan ideal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Peso (kg)</label>
              <input
                name="weightKg"
                type="number"
                min="20"
                max="400"
                step="0.1"
                value={form.weightKg}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 text-slate-600 px-4 py-2.5 bg-slate-50/60 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Altura (cm)</label>
              <input
                name="heightCm"
                type="number"
                min="120"
                max="250"
                step="0.1"
                value={form.heightCm}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 text-slate-600 px-4 py-2.5 bg-slate-50/60 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Edad</label>
              <input
                name="age"
                type="number"
                min="10"
                max="100"
                value={form.age}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 text-slate-600 px-4 py-2.5 bg-slate-50/60 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tiempo entrenando</label>
              <select
                name="trainingTime"
                value={form.trainingTime}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 text-slate-600 px-4 py-2.5 bg-slate-50/60 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                required
              >
                <option value="">Selecciona una opción</option>
                <option value="0-6 meses">0-6 meses</option>
                <option value="6-12 meses">6-12 meses</option>
                <option value="1-3 años">1-3 años</option>
                <option value="3+ años">3+ años</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo principal</label>
              <select
                name="goal"
                value={form.goal}
                onChange={handleChange}
                className="w-full rounded-xl border text-slate-600 border-slate-200 px-4 py-2.5 bg-slate-50/60 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                required
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Disponibilidad de equipos</label>
            <select
              name="equipmentAvailability"
              value={form.equipmentAvailability}
              onChange={handleChange}
              className="w-full rounded-xl text-slate-600 border border-slate-200 px-4 py-2.5 bg-slate-50/60 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="Sin equipo">Sin equipo</option>
              <option value="Básico (mancuernas/bandas)">Básico (mancuernas/bandas)</option>
              <option value="Gimnasio completo">Gimnasio completo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Condición médica (opcional)</label>
            <textarea
              name="healthCondition"
              value={form.healthCondition}
              onChange={handleChange}
              rows={3}
              placeholder="Indícanos si tienes alguna lesión, enfermedad o condición relevante"
              className="w-full rounded-xl border border-slate-200 text-slate-600 px-4 py-2.5 bg-slate-50/60 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
            />
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
            {!forceComplete && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold transition-colors"
              >
                Ahora no
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className={`w-full px-6 py-3 rounded-xl font-semibold text-white transition-colors ${
                saving
                  ? "bg-emerald-300 cursor-not-allowed"
                  : "bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              }`}
            >
              {saving ? "Guardando..." : "Guardar y continuar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
