const sections = {
  terms: [
    {
      title: "Información general",
      content:
        "Estos términos regulan el acceso y uso del sitio y sus servicios. Al navegar o comprar aceptas los presentes términos. Podemos modificar estas condiciones en cualquier momento; la versión vigente será la publicada en esta página.",
    },
    {
      title: "Registro de usuarios y cuentas",
      content:
        "Para comprar o acceder a ciertos servicios debes crear una cuenta con información veraz y actualizada. Eres responsable de la confidencialidad de tu contraseña y de todas las actividades realizadas desde tu cuenta.",
    },
    {
      title: "Productos y precios",
      content:
        "Los precios se muestran en pesos colombianos (COP) e incluyen impuestos cuando aplique. Podemos actualizar precios, descripciones o disponibilidad sin previo aviso. Las imágenes son ilustrativas.",
    },
    {
      title: "Proceso de compra y pago",
      content:
        "Aceptamos pagos con tarjeta, PSE y otros medios habilitados en el checkout. La contraentrega puede estar disponible según ciudad y operador. Los pagos están sujetos a validación y confirmación por el proveedor.",
    },
    {
      title: "Envíos y entregas",
      content:
        "Realizamos envíos en Colombia mediante operadores como Servientrega o Coordinadora. Los tiempos y costos dependen de la ciudad, volumen y disponibilidad. Te informaremos el costo y la promesa de entrega antes de finalizar la compra.",
    },
    {
      title: "Derecho de retracto (Ley 1480)",
      content:
        "El consumidor podrá ejercer el derecho de retracto dentro de los cinco (5) días hábiles siguientes a la entrega del producto, siempre que la ley lo permita. El producto debe devolverse en las mismas condiciones de entrega. Los costos de transporte de la devolución serán asumidos por el consumidor, salvo disposición legal en contrario.",
    },
    {
      title: "Garantías y devoluciones",
      content:
        "Aplica la garantía legal conforme a la Ley 1480 de 2011. En caso de defecto, el consumidor podrá solicitar reparación, reposición o devolución según corresponda. Revisaremos el caso y te informaremos el proceso de devolución.",
    },
    {
      title: "Propiedad intelectual",
      content:
        "Todo el contenido del sitio (marcas, logos, textos, imágenes, software) es propiedad de la tienda o de sus titulares y está protegido por la normativa aplicable. No se permite su uso sin autorización previa.",
    },
    {
      title: "Protección de datos",
      content:
        "Tratamos los datos personales conforme a la Ley 1581 de 2012 y su reglamentación. La política de privacidad se encuentra en una sección separada dentro de esta página.",
    },
    {
      title: "Responsabilidad limitada",
      content:
        "No seremos responsables por daños indirectos o lucro cesante derivados del uso del sitio o de la imposibilidad de acceder a él, salvo que la ley disponga lo contrario.",
    },
    {
      title: "Ley aplicable y resolución de conflictos",
      content:
        "Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia será resuelta ante los jueces competentes de Bogotá o Medellín, según corresponda.",
    },
    {
      title: "Última actualización",
      content: "02 de febrero de 2026.",
    },
  ],
  privacy: [
    {
      title: "Responsable del tratamiento",
      content:
        "La tienda es responsable del tratamiento de los datos personales recolectados a través del sitio web.",
    },
    {
      title: "Datos recolectados",
      content:
        "Recolectamos datos de identificación, contacto, facturación, envíos y navegación, así como información necesaria para brindar el servicio.",
    },
    {
      title: "Finalidades del tratamiento",
      content:
        "Usamos los datos para gestionar pedidos, pagos, envíos, soporte al cliente, comunicaciones relacionadas con la compra y cumplimiento de obligaciones legales.",
    },
    {
      title: "Derechos del titular (Ley 1581)",
      content:
        "Puedes conocer, actualizar, rectificar y suprimir tus datos, así como revocar la autorización en los casos previstos por la ley. Para ejercer tus derechos, contáctanos por los canales de soporte.",
    },
    {
      title: "Autorización y seguridad",
      content:
        "Al registrarte o comprar, autorizas el tratamiento de tus datos según esta política. Implementamos medidas técnicas y organizativas para proteger la información.",
    },
    {
      title: "Transferencias y encargados",
      content:
        "Podemos compartir datos con proveedores tecnológicos o logísticos (por ejemplo, pasarelas de pago y operadores de envío) únicamente para cumplir con el servicio.",
    },
    {
      title: "Vigencia y cambios",
      content:
        "Esta política puede actualizarse en cualquier momento. La versión vigente será publicada en esta página.",
    },
    {
      title: "Última actualización",
      content: "02 de febrero de 2026.",
    },
  ],
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900">Términos y Condiciones</h1>
          <p className="text-slate-600 mt-3">
            Consulta los términos de uso y la política de privacidad aplicables en Colombia.
          </p>
        </div>

        <div className="space-y-4">
          {sections.terms.map((item, index) => (
            <details
              key={`terms-${index}`}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between text-lg font-semibold text-slate-800">
                {item.title}
                <span className="ml-4 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                {item.content}
              </div>
            </details>
          ))}
        </div>

        <div className="text-center mt-16 mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">Política de Privacidad</h2>
          <p className="text-slate-600 mt-3">
            Cumplimos la Ley 1581 de 2012 y normativa vigente de protección de datos.
          </p>
        </div>

        <div className="space-y-4">
          {sections.privacy.map((item, index) => (
            <details
              key={`privacy-${index}`}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between text-lg font-semibold text-slate-800">
                {item.title}
                <span className="ml-4 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                {item.content}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
