import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart, getProducts } from "../services/database";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

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

  const handleAdd = async (productOrId, quantity = 1) => {
    let productObj = typeof productOrId === "object" && productOrId !== null ? productOrId : null;
    const targetId = String(productObj?.id || productOrId);

    if (!productObj) {
      const allProducts = await getProducts();
      productObj = allProducts.find((item) => String(item.id) === targetId);
    }
    if (!productObj) return;

    if (!user) {
      setCartItems((current) => {
        const existing = current.find((item) => String(item.product_id || item.products?.id) === targetId);
        const updated = existing
          ? current.map((item) => (String(item.product_id || item.products?.id) === targetId ? { ...item, quantity: item.quantity + quantity } : item))
          : [...current, { id: `guest-${Date.now()}-${targetId}`, product_id: targetId, quantity, products: productObj }];
        localStorage.setItem("nkeys-guest-cart", JSON.stringify(updated));
        return updated;
      });
      triggerToast(`${productObj.name || "Item"} added to bag!`);
      return;
    }

    try {
      const existing = cartItems.find((item) => String(item.product_id || item.products?.id) === targetId);
      const newQty = existing ? existing.quantity + quantity : quantity;
      const cartId = existing?.id || `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      await addToCart({ id: cartId, user_id: user.id, product_id: targetId, quantity: newQty });
      const updated = await getCart(user.id);
      setCartItems(updated);
      triggerToast(`${productObj.name || "Item"} added to bag!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setCartItems((current) => {
        const existing = current.find((item) => String(item.product_id || item.products?.id) === targetId);
        const updated = existing
          ? current.map((item) => (String(item.product_id || item.products?.id) === targetId ? { ...item, quantity: item.quantity + quantity } : item))
          : [...current, { id: `local-${Date.now()}-${targetId}`, product_id: targetId, quantity, products: productObj }];
        return updated;
      });
      triggerToast(`${productObj.name || "Item"} added to bag!`);
    }
  };

  const handleUpdateQuantity = async (cartItemId, quantity) => {
    const targetCartId = String(cartItemId);
    if (!user) {
      setCartItems((prev) => {
        const updated = quantity <= 0 ? prev.filter((item) => String(item.id) !== targetCartId) : prev.map((item) => (String(item.id) === targetCartId ? { ...item, quantity } : item));
        localStorage.setItem("nkeys-guest-cart", JSON.stringify(updated));
        return updated;
      });
      return;
    }
    try {
      if (quantity <= 0) {
        await handleRemove(targetCartId);
        return;
      }
      await updateCartQuantity(targetCartId, quantity);
      setCartItems((prev) =>
        prev.map((item) => (String(item.id) === targetCartId ? { ...item, quantity } : item))
      );
    } catch (err) {
      console.error("Error updating cart quantity:", err);
    }
  };

  const handleRemove = async (cartItemId) => {
    const targetCartId = String(cartItemId);
    if (!user) {
      setCartItems((prev) => {
        const updated = prev.filter((item) => String(item.id) !== targetCartId);
        localStorage.setItem("nkeys-guest-cart", JSON.stringify(updated));
        return updated;
      });
      return;
    }
    try {
      await removeFromCart(targetCartId);
      setCartItems((prev) => prev.filter((item) => String(item.id) !== targetCartId));
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

  return (
    <CartContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-stone-900 text-white dark:bg-white dark:text-stone-900 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-slide-in">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
