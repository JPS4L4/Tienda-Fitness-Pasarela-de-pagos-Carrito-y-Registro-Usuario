"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileData {
  name: string | null;
  email: string | null;
  phone: string | null;
}

export default function ProfileEditClient() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileData>({ name: "", email: "", phone: "" });
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
        });
      } catch (err: any) {
        setError(err.message || "Error cargando el perfil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

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
          name: form.name || undefined,
          phone: form.phone || null,
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
