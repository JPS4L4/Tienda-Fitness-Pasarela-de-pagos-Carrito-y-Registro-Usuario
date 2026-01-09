"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search as SearchIcon, User as UserIcon, ShoppingCart as ShoppingCartIcon } from "lucide-react";
import { useState } from "react";
import GlobalSearchResults from "./GlobalSearchResults";

export default function Navbar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <nav className="bg-white border-b border-black h-20 sticky top-0 z-50 hover:border-orange-500 transition-colors ease-in-out duration-300">
      <div className="container mx-auto h-full px-4 flex items-center justify-center">
        
        {/* 1. SECCIÓN IZQUIERDA (Productos y Planes) */}
        {/* Usamos flex-1 para que ocupe el mismo espacio que la derecha */}
        <div className="flex-1 flex items-center justify-evenly mr-10">
          <NavLink href="/products" currentPath={pathname}>
            <span className={`text-black text-lg hover:text-orange-400 ${pathname == "/products" && "text-orange-500"}`}>Tienda</span>
          </NavLink>
          <NavLink href="/plans" currentPath={pathname}>
             <span className={`text-black text-lg hover:text-orange-400 ${pathname == "/plans" && "text-orange-500"}`}>Planes</span>
          </NavLink>
        </div>

        {/* 2. CENTRO (La Marca / Home) */}
        <div className="shrink-0">
          <Link 
            href="/" 
            className={`font-black text-black uppercase text-2xl tracking-widest hover:text-orange-400 ${pathname == "/" && "text-orange-500"}`}
          >
            Nan Salazar
          </Link>
        </div>

        {/* 3. SECCIÓN DERECHA (Contacto, Buscador, Usuario) */}
        <div className="flex-1 flex items-center justify-evenly ml-10">
          {/* Enlace de Contacto y Soporte */}
          {
            pathname === "/contact" ? (
                <NavLink href="/support" currentPath={pathname}>
            <span className="text-black text-lg hover:text-orange-400">Soporte</span>
          </NavLink>
              
            ) : (
            <NavLink href="/contact" currentPath={pathname}>
            <span className="text-black text-lg hover:text-orange-400">Contacto</span>
          </NavLink>
            )
          }          

          {/* Barra de Búsqueda o Icono de Carrito */}
          {pathname === "/products" || pathname === "/plans" ? (
            <Link href="/cart" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ShoppingCartIcon className="w-5 h-5 text-black hover:text-orange-500 transition-colors" />
            </Link>
          ) : (
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white text-sm text-gray-800 rounded-full pl-3 pr-8 py-1.5 border border-black focus:outline-none hover:border-orange-500  ease-in duration-100 focus:border-orange-500 w-40 transition-all focus:w-52"
              />
              <SearchIcon className="w-4 h-4 text-gray-800 absolute right-3 top-2 pointer-events-none" />
              {searchQuery && <GlobalSearchResults query={searchQuery} />}
            </div>
          )}

          {/* Ícono de Usuario */}
          <Link href="/user" className={`p-2 bg-black rounded-full hover:bg-orange-500 text-white transition-colors ${pathname == "/user" && "bg-orange-500"}`}>
            <UserIcon className="w-5 h-5"/>
          </Link>
        </div>

      </div>
    </nav>
  );
}

// --- Componentes Auxiliares (Para mantener limpio el código principal) ---

// 1. Componente para los Links de texto
function NavLink({ href, children, currentPath }: { href: string; children: React.ReactNode; currentPath: string }) {
  const isActive = currentPath === href;
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors duration-200 ${
        isActive ? "text-indigo-400" : "text-gray-300 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
