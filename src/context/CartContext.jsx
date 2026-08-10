import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart, getProducts } from "../services/database";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const readGuestCart = () => {
    try { return JSON.parse(localStorage.getItem("nkeys-guest-cart") || "[]"); } catch { return []; }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      const guestItems = readGuestCart();
      getCart(user.id)
        .then(async (items) => {
          for (const item of guestItems) {
            await addToCart({ id: `cart-${Date.now()}-${item.product_id}`, user_id: user.id, product_id: item.product_id, quantity: item.quantity });
          }
          setCartItems(guestItems.length ? await getCart(user.id) : items);
          localStorage.removeItem("nkeys-guest-cart");
        })
        .catch((err) => console.error("Error loading cart:", err))
        .finally(() => setLoading(false));
    } else {
      setCartItems(readGuestCart());
    }
  }, [user]);

  const handleAdd = async (productId, quantity = 1) => {
    if (!user) {
      const products = await getProducts();
      const product = products.find((item) => item.id === productId);
      if (!product) return;
      setCartItems((current) => {
        const existing = current.find((item) => item.product_id === productId);
        const updated = existing
          ? current.map((item) => item.product_id === productId ? { ...item, quantity: item.quantity + quantity } : item)
          : [...current, { id: `guest-${Date.now()}-${productId}`, product_id: productId, quantity, products: product }];
        localStorage.setItem("nkeys-guest-cart", JSON.stringify(updated));
        return updated;
      });
      return;
    }
    try {
      const existing = cartItems.find((item) => item.product_id === productId);
      const newQty = existing ? existing.quantity + quantity : quantity;
      const cartId = existing?.id || `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await addToCart({ id: cartId, user_id: user.id, product_id: productId, quantity: newQty });
      
      const updated = await getCart(user.id);
      setCartItems(updated);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleUpdateQuantity = async (cartItemId, quantity) => {
    if (!user) {
      setCartItems((prev) => {
        const updated = quantity <= 0 ? prev.filter((item) => item.id !== cartItemId) : prev.map((item) => item.id === cartItemId ? { ...item, quantity } : item);
        localStorage.setItem("nkeys-guest-cart", JSON.stringify(updated));
        return updated;
      });
      return;
    }
    try {
      if (quantity <= 0) {
        await handleRemove(cartItemId);
        return;
      }
      await updateCartQuantity(cartItemId, quantity);
      setCartItems((prev) =>
        prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
      );
    } catch (err) {
      console.error("Error updating cart quantity:", err);
    }
  };

  const handleRemove = async (cartItemId) => {
    if (!user) {
      setCartItems((prev) => {
        const updated = prev.filter((item) => item.id !== cartItemId);
        localStorage.setItem("nkeys-guest-cart", JSON.stringify(updated));
        return updated;
      });
      return;
    }
    try {
      await removeFromCart(cartItemId);
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const handleClear = async () => {
    if (!user) {
      localStorage.removeItem("nkeys-guest-cart");
      setCartItems([]);
      return;
    }
    try {
      await clearCart(user.id);
      setCartItems([]);
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.products?.discount_price || item.products?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const value = {
    cartItems,
    loading,
    cartCount,
    cartTotal,
    addItem: handleAdd,
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemove,
    clearCart: handleClear
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
