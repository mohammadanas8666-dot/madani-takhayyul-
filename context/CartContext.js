'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('madani_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('madani_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item._id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const cartCount = cart.reduce((count, item) => count + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
