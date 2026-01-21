"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search as SearchIcon, User as UserIcon, ShoppingCart as ShoppingCartIcon } from "lucide-react";
import { useState } from "react";
import GlobalSearchResults from "./GlobalSearchResults";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const { getTotalItems, openCart } = useCart();
  const totalItems = getTotalItems();

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

          <button onClick={() => openCart()} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ShoppingCartIcon className="w-5 h-5 text-black hover:text-orange-500 transition-colors" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          
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
