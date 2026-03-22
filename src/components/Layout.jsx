import { Outlet } from "react-router-dom";
import CartFlyLayer from "./CartFlyLayer";
import Header from "./Header";
import SlideCart from "./SlideCart";

export default function Layout() {
  return (
    <div className="relative min-h-screen overflow-hidden text-ink">
      <div aria-hidden="true" className="ambient-background">
        <div className="ambient-ribbon ambient-ribbon-a" />
        <div className="ambient-ribbon ambient-ribbon-b" />
        <div className="ambient-blob ambient-blob-a" />
        <div className="ambient-blob ambient-blob-b" />
        <div className="ambient-blob ambient-blob-c" />
        <div className="ambient-grid" />
        <div className="ambient-noise" />
      </div>

      <div className="relative z-10">
        <Header />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <footer className="border-t border-stone-200 bg-white/82 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-stone-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p>NKeys builds custom stickers and keychains for drops, gifts, events, and everyday carry.</p>
            <p>Frontend demo with persistent cart, reviews, checkout flow, admin panel, and SQL schema.</p>
          </div>
        </footer>
      </div>
      <SlideCart />
      <CartFlyLayer />
    </div>
  );
}
