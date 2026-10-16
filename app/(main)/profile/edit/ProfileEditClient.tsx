"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { errorMessage } from "@/lib/utils";

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
      } catch (err) {
        setError(errorMessage(err, "Error cargando el perfil"));
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
    } catch (err) {
      setError(errorMessage(err, "Error al guardar"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="border border-line border-t-4 border-t-accent bg-surface">
          <div className="border-b border-line bg-surface-2 px-8 py-8">
            <h1 className="text-5xl text-fg">Editar Perfil</h1>
            <p className="mt-2 text-muted">Actualiza tu información de contacto</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-10 space-y-6">
            <div>
              <label htmlFor="name" className="label">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name || ""}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email || ""}
                disabled
                className="input cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="phone" className="label">
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone || ""}
                onChange={handleChange}
                placeholder="+57 300 123 4567"
                className="input"
              />
            </div>

            <div className="pt-6 border-t border-line">
              <h2 className="text-3xl text-fg mb-4">Perfil fitness</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="weightKg" className="label">
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
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="heightCm" className="label">
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
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="age" className="label">
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
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="trainingTime" className="label">
                    Tiempo entrenando
                  </label>
                  <select
                    id="trainingTime"
                    name="trainingTime"
                    value={form.trainingTime || ""}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="0-6 meses">0-6 meses</option>
                    <option value="6-12 meses">6-12 meses</option>
                    <option value="1-3 años">1-3 años</option>
                    <option value="3+ años">3+ años</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="goal" className="label">
                    Objetivo principal
                  </label>
                  <select
                    id="goal"
                    name="goal"
                    value={form.goal || ""}
                    onChange={handleChange}
                    className="input"
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
                <label htmlFor="equipmentAvailability" className="label">
                  Disponibilidad de equipos
                </label>
                <select
                  id="equipmentAvailability"
                  name="equipmentAvailability"
                  value={form.equipmentAvailability || ""}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Sin equipo">Sin equipo</option>
                  <option value="Básico (mancuernas/bandas)">Básico (mancuernas/bandas)</option>
                  <option value="Gimnasio completo">Gimnasio completo</option>
                  <option value="Mixto">Mixto</option>
                </select>
              </div>

              <div className="mt-4">
                <label htmlFor="healthCondition" className="label">
                  Condición médica (opcional)
                </label>
                <textarea
                  id="healthCondition"
                  name="healthCondition"
                  rows={3}
                  value={form.healthCondition || ""}
                  onChange={handleChange}
                  placeholder="Indícanos si tienes alguna lesión, enfermedad o condición relevante"
                  className="input"
                />
              </div>
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
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="btn btn-ghost btn-block"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary btn-block"
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
