"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ItemProps } from "@/app/data/data";

interface FavoriteContextType {
  favorite: favoriteItem[];
  isOpen: boolean;
  addToFavorite: (item: ItemProps) => void;
  removeFromfavorite: (itemId: number) => void;
  clearFavorite: () => void;
  openFavorite: () => void;
  closefavorite: () => void;
  getTotalFavorite: () => number;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorite, setFavorite] = useState<FavoriteItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar carrito desde localStorage al montar el componente
  useEffect(() => {
    try {
      const savedFavorite = localStorage.getItem("nan-salazar-favorite");
      if (savedFavorite) {
        setCart(JSON.parse(savedFavorite));
      }
    } catch (error) {
      console.error("Error loading favorite from localStorage:", error);
    }
    setIsHydrated(true);
  }, []);

  // Guardar carrito en localStorage cada vez que cambia
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem("nan-salazar-favorite", JSON.stringify(favorite));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [favorite, isHydrated]);

  const addToFavorite = useCallback((item: ItemProps) => {
    setCart((prevFavorite) => {
      const existingItem = prevFavorite.find((favoriteItem) => favoriteItem.id === item.id);

      if (existingItem) {
        return prevFavorite.map((favoriteItem) =>
          favoriteItem.id === item.id
            ? { ...favoriteItem }
            : favoriteItem
        );
      }

      return [...prevFavorite, { ...item }];
    });

    // Abrir lista de favorite automáticamente al agregar
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
      const price = item.discount 
        ? Math.round(item.price * (1 - item.discount / 100))
        : item.price;
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
