import { Outlet } from "react-router-dom";
import CartFlyLayer from "./CartFlyLayer";
import Header from "./Header";
import SlideCart from "./SlideCart";

export default function Layout() {
  return (
    <div className="relative min-h-screen overflow-hidden">
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
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <Outlet />
        </main>
        <footer className="border-t border-[#ddcdbc] bg-[#fffaf3]/82 backdrop-blur dark:border-[#3a2d25] dark:bg-[#16110e]/84">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm leading-7 text-stone-600 dark:text-stone-400 sm:px-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
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
