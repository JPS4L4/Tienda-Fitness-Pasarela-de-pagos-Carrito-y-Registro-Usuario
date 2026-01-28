"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User as UserIcon, ShoppingCart as ShoppingCartIcon, LogOut, Heart } from "lucide-react";
import { useFavoritesStore } from "@/lib/stores/favoritesStore" // ajusta la ruta
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/hooks/useAuthUser";
import { signOut } from "next-auth/react";
import FavoritesDrawer from "./FavoritesDrawer";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const favorites = useFavoritesStore(state => state.favorites)
  const { getTotalItems, openCart } = useCart();
  const { user, isAuthenticated, isLoading } = useUser();
  const totalItems = getTotalItems();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="bg-white border-b border-black h-20 sticky top-0 z-50 hover:border-orange-500 transition-colors ease-in-out duration-300">
      <div className="container mx-auto h-full px-4 flex items-center justify-center">
        
        {/* 1. SECCIÓN IZQUIERDA (Productos y Planes) */}
        {/* Usamos flex-1 para que ocupe el mismo espacio que la derecha */}
        <div className="flex-1 flex items-center justify-evenly mr-10">
          <NavLink href="/items" currentPath={pathname}>
            <span className={`text-black text-lg hover:text-orange-400 ${pathname == "/products" && "text-orange-500"}`}>Tienda</span>
          </NavLink>
          <NavLink href="/plans" currentPath={pathname}>
             <span className={`text-black text-lg hover:text-orange-400 ${pathname == "/plans" && "text-orange-500"}`}>Planes</span>
          </NavLink>
          {/* Enlace de Contacto y Soporte */}
         {/*  {
            pathname === "/contact" ? (
                <NavLink href="/support" currentPath={pathname}>
            <span className="text-black text-lg hover:text-orange-400">Soporte</span>
          </NavLink>
              
            ) : (
            <NavLink href="/contact" currentPath={pathname}>
            <span className="text-black text-lg hover:text-orange-400">Contacto</span>
          </NavLink>
            )
          }           */}
        
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
          {/* Lista de deseos */}
           <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Heart className="w-6 h-6 text-gray-700" />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </button>

      <FavoritesDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />

          {/* Carrito de compras */}
            <button onClick={() => openCart()} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ShoppingCartIcon className="w-5 h-5 text-black hover:text-orange-500 transition-colors" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* Gestión de usuario */}
          {!isLoading && (
            isAuthenticated && user ? (
              // Usuario autenticado: mostrar menú desplegable
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`p-2  hover:text-orange-500 text-black transition-colors ${pathname == "/profile" && "text-orange-500"}`}
                  title={user.name || "Usuario"}
                >
                  <UserIcon className="w-5 h-5 inline-block ml-1" /> Hola!, {user.name?.split(" ")[0] || "Usuario"} 
                </button>

                {/* Menú desplegable */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    {/* Header con nombre del usuario */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    {/* Links del menú */}
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      👤 Mi Perfil
                    </Link>
                    <Link 
                      href="/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      📦 Mis Compras
                    </Link>
                    

                    {/* Separator */}
                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Botón de logout */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        signOut({ callbackUrl: "/" })
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Usuario no autenticado: mostrar enlace de login
              <Link href="/login" className={`text-black text-lg hover:text-orange-400 ${pathname == "/login" && "text-orange-500"}`}>
                <span>Iniciar Sesión</span>
              </Link>
            )
          )}
          
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
