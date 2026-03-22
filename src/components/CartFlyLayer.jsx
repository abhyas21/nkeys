import { ShoppingBag } from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function CartFlyLayer() {
  const { cartFlyAnimation } = useStore();

  if (!cartFlyAnimation) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]" aria-hidden="true">
      <div
        key={cartFlyAnimation.id}
        className="cart-fly-card"
        style={{
          left: `${cartFlyAnimation.startLeft}px`,
          top: `${cartFlyAnimation.startTop}px`,
          "--cart-fly-x": `${cartFlyAnimation.deltaX}px`,
          "--cart-fly-y": `${cartFlyAnimation.deltaY}px`
        }}
      >
        <div className="cart-fly-trail" />
        <div className="cart-fly-frame">
          <div className="cart-fly-thumb-wrap">
            {cartFlyAnimation.imageSrc ? (
              <img
                src={cartFlyAnimation.imageSrc}
                alt=""
                className="cart-fly-thumb"
              />
            ) : (
              <div className="cart-fly-thumb cart-fly-thumb-fallback">
                {cartFlyAnimation.productName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="cart-fly-copy">
            <span className="cart-fly-label">Added</span>
            <span className="cart-fly-name">{cartFlyAnimation.productName}</span>
          </div>
          <span className="cart-fly-badge">
            <ShoppingBag size={15} />
          </span>
        </div>
      </div>
    </div>
  );
}
