"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { XIcon } from "@/components/others/XIcon"
import { Mail, Phone, Send, Instagram, Facebook, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { BRAND_CONTACT_EMAIL } from "@/lib/brand";
import { errorMessage } from "@/lib/utils";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el mensaje");
      }

      setSuccess(true);
      setFormData({ name: "", lastName: "", email: "", message: "" });
      toast.success("¡Mensaje enviado! Te responderemos pronto.", { duration: 5000 });
    } catch (error) {
      console.error("Error:", error);
      toast.error(errorMessage(error, "Error al enviar el mensaje. Por favor intenta de nuevo."), { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Usamos 'flex-col md:flex-row' para que en celular sea columna y en PC sea fila
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-surface">
      
      {/* ---------------------------------------------------------
          COLUMNA IZQUIERDA: VISUAL E INFO (40% del ancho en PC)
         --------------------------------------------------------- */}
      <div className="relative w-full md:w-5/12 lg:w-2/5 bg-bg text-fg flex flex-col justify-between p-12 overflow-hidden">
        
        {/* Imagen de Fondo (Con overlay oscuro para que se lea el texto) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-bg/75 z-10"></div> {/* Capa oscura */}
          <Image src="/images/hero/equipo.webp" alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover grayscale" />
        </div>

        {/* Contenido sobre la imagen (z-20) */}
        <div className="relative z-20 mt-10">
          <h2 className="text-6xl md:text-7xl mb-6">
            Hablemos <br/> de tu meta
          </h2>
          <p className="text-fg-soft text-lg font-light max-w-sm">
            Ya sea que busques un plan personalizado o tengas dudas sobre la tienda, estamos listos para escucharte.
          </p>
        </div>

        {/* Datos de Contacto (Abajo) */}
        <div className="relative z-20 space-y-8 mb-10 md:mb-0">
          <ContactItem icon={<Phone className="w-6 h-6"/>} title="Llámanos" detail="+57 (300) 123-4567" />
          <ContactItem icon={<Mail className="w-6 h-6"/>} title="Escríbenos" detail={BRAND_CONTACT_EMAIL} />
          {/* <ContactItem icon={<MapPin className="w-6 h-6"/>} title="Visítanos" detail="Calle 100 # 15-20, Bogotá" /> */}
          
          {/* Redes Sociales */}
          <div className="flex gap-4 pt-6 border-t border-white/20">
             <SocialLink icon={<Instagram />} />
             <SocialLink icon={<Facebook />} />
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="w-10 h-10 flex items-center justify-center  border-2 border-line-strong text-fg hover:border-accent hover:bg-accent hover:text-on-accent transition-all">
                <XIcon />            
              </a>
              
          </div>
        </div>
      </div>


      {/* ---------------------------------------------------------
          COLUMNA DERECHA: FORMULARIO (60% del ancho en PC)
         --------------------------------------------------------- */}
      <div className="w-full md:w-7/12 lg:w-3/5 bg-surface flex items-center justify-center p-8 md:p-24">
        
        <div className="w-full max-w-lg">
          {success ? (
            // ESTADO DE ÉXITO
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 bg-ok/10 text-ok  flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold text-fg mb-2">¡Recibido!</h3>
              <p className="text-muted mb-8">Tu mensaje ya está con nuestro equipo.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="text-accent font-bold hover:text-accent flex items-center justify-center gap-2 mx-auto"
              >
                Enviar otro <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // FORMULARIO
            <>
              <div className="mb-10">
                <h3 className="text-4xl text-fg mb-2">Envíanos un mensaje</h3>
                <p className="text-muted">Te responderemos en menos de 24 horas.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputClean 
                    label="Nombre" 
                    placeholder="Tu nombre" 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <InputClean 
                    label="Apellido" 
                    placeholder="Tu apellido" 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <InputClean 
                  label="Correo Electrónico" 
                  placeholder="ejemplo@email.com" 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />

                <div>
                  <label className="label">¿Cómo podemos ayudarte?</label>
                  <textarea 
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Cuéntanos más..."
                    className="input resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary btn-lg btn-block mt-4"
                >
                  {loading ? "ENVIANDO..." : "ENVIAR MENSAJE"}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

// --- SUB-COMPONENTES PARA ESTILO ---

// 1. Item de contacto (Icono + Texto)
function ContactItem({ icon, title, detail }: { icon: ReactNode, title: string, detail: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-surface/10   shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-subtle uppercase tracking-wider mb-1">{title}</p>
        <p className="text-lg font-medium text-fg">{detail}</p>
      </div>
    </div>
  );
}

// 2. Input Minimalista (Solo borde inferior)
function InputClean({ 
  label, 
  placeholder, 
  type, 
  name, 
  value, 
  onChange 
}: { 
  label: string;
  placeholder: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input 
        required
        type={type} 
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input"
      />
    </div>
  );
}

// 3. Botón Redes
function SocialLink({ icon }: { icon: ReactNode }) {
  return (
    <a href="#" className="w-10 h-10 flex items-center justify-center  border-2 border-line-strong text-fg hover:border-accent hover:bg-accent hover:text-on-accent transition-all">
      <div className="w-5 h-5">{icon}</div>
    </a>
  );
}