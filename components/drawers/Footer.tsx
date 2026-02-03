"use client"

import { Facebook, Instagram } from "lucide-react";
import { usePathname } from "next/navigation";

const Footer = () => {


    // Ocultar el footer en las páginas de soporte y contacto
    const pathname = usePathname();
    if (pathname === "/support" || pathname === "/contact") {
        return null; 
    }

    // Renderizar el footer en otras páginas
    return(
         <footer className="footer">
     {/* Cambiamos flex por grid y definimos 3 columnas iguales */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 items-center p-4 bg-gray-800 text-white">
        
        {/* 1. Sección izquierda: Redes sociales */}
        <div className="flex justify-center md:justify-start">
            <div className="flex items-center gap-2 rounded-2xl p-2 bg-gray-900 w-fit">
                <a href="https://facebook.com" target="_blank">
                    <div className="text-white rounded-full p-1 hover:bg-blue-600 hover:text-white transition-colors duration-300">
                        <Facebook />
                    </div>
                </a>
                <a href="https://instagram.com" target="_blank">
                    <div className="text-white rounded-full p-1 hover:bg-purple-600 hover:text-white transition-colors duration-300">
                        <Instagram />
                    </div>
                </a>
                <a href="https://x.com" target="_blank">
                    {/* Aplicamos el filtro invert que vimos antes para que sea blanco */}
                    <div className="rounded-full invert p-1 hover:bg-white transition-colors duration-300">
                        <img className="w-6 h-6 " src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/logos/x-jvgvt5gje92oz29ez4fgd.png/x-0muuxjzgzvtlpaduv3p4k2s.png?_a=DATAg1AAZAA0" alt="x_icon" />
                    </div>
                </a>
            </div>
        </div>

        {/* 2. Sección centro: Copyright (Ahora sí estará en el puro centro) */}
        <div className="font-mono text-center">
            <p>Nan Salazar © 2025 | Derechos reservados.</p>
        </div>

        {/* 3. Sección derecha: Enlaces */}
        <div className="flex justify-center md:justify-end gap-2 font-mono text-md flex-wrap">
            <a className="hover:text-orange-500 transition-colors duration-300" href="/contact">Contacto</a>
            <span>|</span>
            <a className="hover:text-orange-500 transition-colors duration-300" href="/support">Soporte</a>
            <span>|</span>
            <a className="hover:text-orange-500 transition-colors duration-300" href="/legal">Legal</a>
        </div>

    </div>
</footer>
    )
}

export default Footer;