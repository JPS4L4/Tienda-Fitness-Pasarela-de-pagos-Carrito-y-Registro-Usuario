"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User as UserIcon, ShoppingCart as ShoppingCartIcon, LogOut, Heart, Menu, X, Package, LayoutDashboard } from "lucide-react";
import { useFavoritesStore } from "@/lib/stores/favoritesStore";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/hooks/useAuthUser";
import { signOut } from "next-auth/react";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import FavoritesDrawer from "./FavoritesDrawer";

const NAV_LINKS = [
  { href: "/items", label: "Tienda" },
  { href: "/plans", label: "Planes" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const favorites = useFavoritesStore((state) => state.favorites);
  const { getTotalItems, openCart } = useCart();
  const { user, isAuthenticated, isLoading } = useUser();
  const totalItems = getTotalItems();
  const [showUserMenu, setShowUserMenu] = useState(false);
  // El rol viene de la sesión (calculado en el servidor); es solo para mostrar el enlace.
  const isAdmin = user?.role === "admin";

  const linkClass = (active: boolean) =>
    cn(
      "relative py-2 text-base font-extrabold uppercase tracking-[0.12em] transition-colors",
      "after:absolute after:inset-x-0 after:-bottom-1 after:h-[3px] after:origin-left after:bg-accent after:transition-transform",
      active ? "text-fg after:scale-x-100" : "text-fg-soft hover:text-fg after:scale-x-0 hover:after:scale-x-100"
    );

  const iconBtn =
    "relative flex h-11 w-11 items-center justify-center text-fg transition-colors hover:bg-surface-3 hover:text-accent";
  const countBadge =
    "absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center bg-accent px-1 text-xs font-extrabold text-on-accent";

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-accent bg-bg/95" aria-label="Principal">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4 md:h-[72px]">
          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={cn(iconBtn, "md:hidden")}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Izquierda: enlaces */}
          <div className="hidden flex-1 items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass(pathname === l.href)}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Centro: marca */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-display text-2xl uppercase leading-none tracking-wide text-fg transition-colors hover:text-accent sm:text-3xl"
            aria-label={`${BRAND_NAME}, inicio`}
          >
            <span aria-hidden="true" className="inline-block h-6 w-2 -skew-x-12 bg-accent sm:h-7" />
            {BRAND_NAME}
          </Link>

          {/* Derecha: acciones */}
          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <button onClick={() => setIsOpen(true)} className={iconBtn} aria-label="Abrir favoritos">
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && <span className={countBadge}>{favorites.length}</span>}
            </button>

            <button onClick={() => openCart()} className={iconBtn} aria-label="Abrir carrito">
              <ShoppingCartIcon className="h-5 w-5" />
              {totalItems > 0 && <span className={countBadge}>{totalItems}</span>}
            </button>

            <FavoritesDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />

            {/* Usuario (escritorio) */}
            {!isLoading &&
              (isAuthenticated && user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={cn(
                      "flex h-11 items-center gap-2 px-3 text-base font-extrabold uppercase tracking-[0.1em] transition-colors hover:bg-surface-3 hover:text-accent",
                      pathname.startsWith("/profile") ? "text-accent" : "text-fg"
                    )}
                    aria-expanded={showUserMenu}
                    aria-haspopup="menu"
                    title={user.name || "Usuario"}
                  >
                    <UserIcon className="h-5 w-5" />
                    {user.name?.split(" ")[0] || "Usuario"}
                  </button>

                  {showUserMenu && (
                    <div role="menu" className="absolute right-0 z-50 mt-2 w-60 border-2 border-line-strong bg-surface">
                      <div className="border-b border-line px-4 py-3">
                        <p className="text-sm font-bold text-fg">{user.name}</p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                      </div>
                      <MenuLink href="/profile" icon={<UserIcon className="h-4 w-4" />} onClick={() => setShowUserMenu(false)}>
                        Mi perfil
                      </MenuLink>
                      <MenuLink href="/profile/orders" icon={<Package className="h-4 w-4" />} onClick={() => setShowUserMenu(false)}>
                        Mis compras
                      </MenuLink>
                      {isAdmin && (
                        <MenuLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setShowUserMenu(false)}>
                          Panel admin
                        </MenuLink>
                      )}
                      <button
                        role="menuitem"
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-2 border-t border-line px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-danger transition-colors hover:bg-danger/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn btn-primary btn-sm ml-2 hidden md:inline-flex">
                  Iniciar sesión
                </Link>
              ))}
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="border-t border-line pb-4 md:hidden">
            <div className="flex flex-col pt-2">
              {NAV_LINKS.map((l) => (
                <MobileLink key={l.href} href={l.href} active={pathname === l.href} onClick={() => setIsMobileMenuOpen(false)}>
                  {l.label}
                </MobileLink>
              ))}
              {!isLoading &&
                (isAuthenticated && user ? (
                  <>
                    <MobileLink href="/profile" active={pathname === "/profile"} onClick={() => setIsMobileMenuOpen(false)}>
                      Mi perfil
                    </MobileLink>
                    <MobileLink href="/profile/orders" active={pathname === "/profile/orders"} onClick={() => setIsMobileMenuOpen(false)}>
                      Mis compras
                    </MobileLink>
                    {isAdmin && (
                      <MobileLink href="/admin" active={false} onClick={() => setIsMobileMenuOpen(false)}>
                        Panel admin
                      </MobileLink>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="px-2 py-3 text-left text-lg font-extrabold uppercase tracking-[0.1em] text-danger hover:bg-danger/10"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn btn-primary btn-block mt-3"
                  >
                    Iniciar sesión
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function MenuLink({
  href,
  icon,
  onClick,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider text-fg-soft transition-colors hover:bg-surface-3 hover:text-accent"
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "border-l-4 px-3 py-3 text-lg font-extrabold uppercase tracking-[0.1em] transition-colors hover:bg-surface-3",
        active ? "border-accent text-accent" : "border-transparent text-fg"
      )}
    >
      {children}
    </Link>
  );
}
