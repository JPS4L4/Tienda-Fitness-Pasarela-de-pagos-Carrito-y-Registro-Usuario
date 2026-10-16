"use client";

import { useEffect, useMemo, useState } from "react";
import { errorMessage } from "@/lib/utils";

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
    } catch (err) {
      setError(errorMessage(err, "Error al guardar el formulario"));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-2xl border-2 border-accent bg-surface">
        <div className="border-b border-line bg-surface-2 px-8 py-8">
          <h2 className="text-4xl text-fg">Completa tu perfil fitness</h2>
          <p className="mt-2 text-muted">
            Esta información nos ayuda a recomendarte el plan ideal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Peso (kg)</label>
              <input
                name="weightKg"
                type="number"
                min="20"
                max="400"
                step="0.1"
                value={form.weightKg}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Altura (cm)</label>
              <input
                name="heightCm"
                type="number"
                min="120"
                max="250"
                step="0.1"
                value={form.heightCm}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Edad</label>
              <input
                name="age"
                type="number"
                min="10"
                max="100"
                value={form.age}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Tiempo entrenando</label>
              <select
                name="trainingTime"
                value={form.trainingTime}
                onChange={handleChange}
                className="input"
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
              <label className="label">Objetivo principal</label>
              <select
                name="goal"
                value={form.goal}
                onChange={handleChange}
                className="input"
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
            <label className="label">Disponibilidad de equipos</label>
            <select
              name="equipmentAvailability"
              value={form.equipmentAvailability}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="Sin equipo">Sin equipo</option>
              <option value="Básico (mancuernas/bandas)">Básico (mancuernas/bandas)</option>
              <option value="Gimnasio completo">Gimnasio completo</option>
            </select>
          </div>

          <div>
            <label className="label">Condición médica (opcional)</label>
            <textarea
              name="healthCondition"
              value={form.healthCondition}
              onChange={handleChange}
              rows={3}
              placeholder="Indícanos si tienes alguna lesión, enfermedad o condición relevante"
              className="input"
            />
          </div>

          {error && (
            <div className="bg-danger/10 border-l-4 border-danger p-4 ">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-ok/10 border-l-4 border-ok p-4 ">
              <p className="text-ok text-sm">{success}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {!forceComplete && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-ghost btn-block"
              >
                Ahora no
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-block"
            >
              {saving ? "Guardando..." : "Guardar y continuar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
