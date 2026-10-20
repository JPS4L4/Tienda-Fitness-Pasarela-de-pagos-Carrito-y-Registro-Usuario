"use client";

import { applyDiscount, isValidPrice } from "@/lib/money";
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ItemUI } from "@/app/src/types/item";
import { LEGACY_STORAGE_PREFIX, STORAGE_PREFIX, migrateLegacyStorageKey } from "@/lib/brand";

export interface CartItem extends ItemUI {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  addToCart: (item: ItemUI, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  /** Actualiza precio de lista y descuento de los productos del carrito con los valores del servidor */
  syncPrices: (prices: { id: number; price: number; discount: number | null }[]) => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// Un producto sin precio válido (0, NaN…) nunca entra ni permanece en el carrito
const withValidPrice = (items: CartItem[]) => items.filter((item) => isValidPrice(item.price));

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [storageKey, setStorageKey] = useState(`${STORAGE_PREFIX}-cart:guest`);
  const { data: session, status } = useSession();
  const initializedRef = useRef(false);
  const syncingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar carrito (local o servidor) según el usuario
  useEffect(() => {
    if (status === "loading") return;

    const userKey = session?.user?.email
      ? `${STORAGE_PREFIX}-cart:${session.user.email}`
      : `${STORAGE_PREFIX}-cart:guest`;

    const loadCart = async () => {
      migrateLegacyStorageKey(userKey, userKey.replace(STORAGE_PREFIX, LEGACY_STORAGE_PREFIX));
      migrateLegacyStorageKey(`${STORAGE_PREFIX}-cart:guest`, `${LEGACY_STORAGE_PREFIX}-cart:guest`);
      setIsHydrated(false);
      setStorageKey(userKey);

      try {
        if (status === "authenticated" && session?.user?.email) {
          const guestKey = `${STORAGE_PREFIX}-cart:guest`;
          const guestRaw = localStorage.getItem(guestKey);
          const guestItems: CartItem[] = guestRaw ? JSON.parse(guestRaw) : [];

          if (guestItems.length > 0) {
            syncingRef.current = true;
            await fetch("/api/cart?merge=true", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: guestItems.map((item) => ({ id: item.id, quantity: item.quantity })),
              }),
            });
            localStorage.removeItem(guestKey);
          }

          const response = await fetch("/api/cart");
          const data = await response.json();
          if (response.ok && Array.isArray(data.items)) {
            setCart(withValidPrice(data.items));
          } else {
            setCart([]);
          }
        } else {
          const savedCart = localStorage.getItem(userKey);
          if (savedCart) {
            setCart(withValidPrice(JSON.parse(savedCart)));
          } else {
            setCart([]);
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        setCart([]);
      } finally {
        syncingRef.current = false;
        setIsHydrated(true);
        initializedRef.current = true;
      }
    };

    loadCart();
  }, [session?.user?.email, status]);

  // Guardar carrito en localStorage cada vez que cambia
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(cart));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [cart, isHydrated, storageKey]);

  // Sincronizar carrito con servidor cuando está autenticado
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!isHydrated || !initializedRef.current || syncingRef.current) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
          }),
        });
      } catch (error) {
        console.error("Error syncing cart:", error);
      }
    }, 400);
  }, [cart, isHydrated, status]);

  const addToCart = useCallback((item: ItemUI, quantity: number = 1) => {
    if (!isValidPrice(item.price)) return;
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }

      return [...prevCart, { ...item, quantity }];
    });

    // Abrir el carrito automáticamente al agregar
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((itemId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const syncPrices = useCallback(
    (prices: { id: number; price: number; discount: number | null }[]) => {
      setCart((prevCart) => {
        let changed = false;
        const next = prevCart.map((item) => {
          const fresh = prices.find((current) => current.id === item.id);
          if (!fresh) return item;
          const discount = fresh.discount ?? 0;
          if (item.price === fresh.price && (item.discount ?? 0) === discount) return item;
          changed = true;
          return { ...item, price: fresh.price, discount };
        });
        return changed ? next : prevCart;
      });
    },
    []
  );

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => {
      const price = applyDiscount(item.price, item.discount);
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncPrices,
        openCart,
        closeCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de CartProvider");
  }
  return context;
};
