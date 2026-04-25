import { Check, ChevronDown, Heart, Menu, ShoppingBag, Store, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useStore } from "../context/StoreContext";

const linkClasses = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive
    ? "bg-terracotta text-white shadow-sm"
    : "text-stone-700 hover:bg-[#fffaf3] hover:text-terracotta dark:text-stone-300 dark:hover:bg-[#2b211c] dark:hover:text-[#f7ebe0]"
  }`;

export default function Header() {
  const {
    cartCount,
    cartPulseKey,
    currentCustomer,
    isOwner,
    likedProductIds,
    setCartOpen,
    signOutCustomer
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const profileMenuRef = useRef(null);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const closeProfileMenu = () => setProfileMenuOpen(false);
  const homePath = "/";

  useEffect(() => {
    if (!cartPulseKey) {
      return undefined;
    }

    setIsCartBumping(true);
    const timer = window.setTimeout(() => {
      setIsCartBumping(false);
    }, 620);

    return () => {
      window.clearTimeout(timer);
    };
  }, [cartPulseKey]);

  useEffect(() => {
    if (!profileMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
    };
  }, [profileMenuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-[#ddcdbc] bg-[#f6efe6]/90 backdrop-blur dark:border-[#3a2d25] dark:bg-[#16110e]/90">
      <div className="page-reveal mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <NavLink
            to={homePath}
            className="flex items-center gap-3"
            onClick={() => {
              closeMobileMenu();
              closeProfileMenu();
            }}
          >
            <span className="motion-float inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta to-[#9f552f] text-white shadow-soft sm:h-11 sm:w-11">
              <Store size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-sans text-base font-semibold text-ink dark:text-white sm:text-lg">NKeys</p>
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-stone-500 dark:text-stone-400 sm:text-xs">
                Stickers & keychains
              </p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-2 rounded-full border border-[#ddcdbc] bg-[#efe1cf]/90 px-2 py-2 dark:border-[#3a2d25] dark:bg-[#231b16] md:flex">
            <NavLink to="/" className={linkClasses}>
              Home
            </NavLink>
            <NavLink to="/products" className={linkClasses}>
              Shop
            </NavLink>
            <NavLink to="/about" className={linkClasses}>
              About
            </NavLink>
            {isOwner ? (
              <NavLink to="/admin" className={linkClasses}>
                Admin
              </NavLink>
            ) : null}
          </nav>

          <div className="flex items-center gap-2">
            {currentCustomer ? (
              <NavLink
                to="/likes"
                onClick={closeProfileMenu}
                className={({ isActive }) => `hidden items-center gap-2 rounded-full border bg-[#fffaf3] px-4 py-3 text-sm font-semibold shadow-sm transition duration-300 hover:-translate-y-0.5 dark:border-[#3a2d25] dark:bg-[#231b16] dark:text-white lg:inline-flex ${isActive
                  ? "border-terracotta text-terracotta"
                  : "border-[#ddcdbc] text-ink hover:border-terracotta dark:hover:border-[#7b5b48]"
                  }`}
              >
                <Heart size={16} className="text-rose-500" />
                Likes
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#f6ddd4] px-2 text-xs text-[#9d4c2b] dark:bg-rose-950/50 dark:text-rose-300">
                  {likedProductIds.length}
                </span>
              </NavLink>
            ) : null}

            {!currentCustomer ? (
              <Link
                to="/verify"
                className="hidden rounded-full border border-[#ddcdbc] bg-[#fffaf3] px-4 py-3 text-sm font-semibold text-ink shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-terracotta hover:text-terracotta dark:border-[#3a2d25] dark:bg-[#231b16] dark:text-white dark:hover:border-[#7b5b48] md:inline-flex"
              >
                Owner login
              </Link>
            ) : null}

            <div className="relative hidden md:block" ref={profileMenuRef}>
              {currentCustomer ? (
                <>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((current) => !current)}
                    className="inline-flex items-center gap-3 rounded-full border border-[#ddcdbc] bg-[#fffaf3] px-3 py-2.5 text-sm font-semibold text-ink shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-terracotta dark:border-[#3a2d25] dark:bg-[#231b16] dark:text-white dark:hover:border-[#7b5b48]"
                    aria-expanded={profileMenuOpen}
                    aria-label="Toggle profile menu"
                  >
                    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-sand text-xs font-semibold text-ink dark:bg-stone-800 dark:text-white">
                      {currentCustomer.firstName.slice(0, 1).toUpperCase()}
                      <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition ${profileMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {profileMenuOpen ? (
                    <div className="absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-[1.75rem] border border-[#ddcdbc] bg-[#fffaf3] p-4 shadow-soft dark:border-[#3a2d25] dark:bg-[#211915]">
                      <div className="flex items-center gap-3 rounded-3xl bg-[#efe1cf] p-4 dark:bg-[#2b211c]">
                        <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fffaf3] text-sm font-semibold text-ink dark:bg-[#3a2d25] dark:text-white">
                          {currentCustomer.firstName.slice(0, 1).toUpperCase()}
                          <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink dark:text-white">{currentCustomer.name}</p>
                          <p className="truncate text-xs text-stone-500 dark:text-stone-400">{currentCustomer.email}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3 rounded-3xl border border-[#ddcdbc] bg-[#f7ecde] p-4 text-sm text-stone-600 dark:border-[#3a2d25] dark:bg-[#2b211c]/70 dark:text-stone-300">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                            Phone
                          </p>
                          <p className="mt-1 font-medium text-ink dark:text-white">{currentCustomer.phone}</p>
                        </div>
                        {currentCustomer.gender ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                              Gender
                            </p>
                            <p className="mt-1 font-medium text-ink dark:text-white">{currentCustomer.gender}</p>
                          </div>
                        ) : null}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                            Account
                          </p>
                          <p className="mt-1 font-medium text-ink dark:text-white">
                            {currentCustomer.isOwner
                              ? "Owner account"
                              : currentCustomer.verifiedBy === "phone"
                                ? "Mobile verified customer"
                                : "Email verified customer"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={signOutCustomer}
                        className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#ddcdbc] bg-[#fffaf3] px-4 py-3 text-sm font-semibold text-ink transition hover:border-terracotta hover:text-terracotta dark:border-[#3a2d25] dark:bg-[#2b211c] dark:text-white dark:hover:border-[#7b5b48]"
                      >
                        Log out
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              data-cart-anchor="true"
              className={`inline-flex items-center gap-2 rounded-full border border-[#ddcdbc] bg-[#fffaf3] px-3 py-3 text-sm font-semibold text-ink shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-terracotta dark:border-[#3a2d25] dark:bg-[#231b16] dark:text-white dark:hover:border-[#7b5b48] sm:px-4 ${isCartBumping ? "cart-bump" : ""
                }`}
              aria-label={`Open cart with ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            >
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">Cart</span>
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-terracotta px-2 text-xs text-white">
                {cartCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="inline-flex rounded-full border border-[#ddcdbc] bg-[#fffaf3] p-3 transition duration-300 hover:-translate-y-0.5 dark:border-[#3a2d25] dark:bg-[#231b16] dark:text-white md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <nav className="page-reveal-right grid gap-3 rounded-3xl border border-[#ddcdbc] bg-[#fffaf3] p-3 dark:border-[#3a2d25] dark:bg-[#211915] md:hidden">
            <NavLink to="/" className={linkClasses} onClick={closeMobileMenu}>
              Home
            </NavLink>
            <NavLink to="/products" className={linkClasses} onClick={closeMobileMenu}>
              Shop
            </NavLink>
            <NavLink to="/about" className={linkClasses} onClick={closeMobileMenu}>
              About
            </NavLink>
            <NavLink to="/likes" className={linkClasses} onClick={closeMobileMenu}>
              Likes
            </NavLink>
            {!currentCustomer ? (
              <NavLink to="/verify" className={linkClasses} onClick={closeMobileMenu}>
                Owner login
              </NavLink>
            ) : null}
            {isOwner ? (
              <NavLink to="/admin" className={linkClasses} onClick={closeMobileMenu}>
                Admin
              </NavLink>
            ) : null}
            {currentCustomer ? (
              <div className="rounded-3xl bg-[#f7ecde] p-4 text-sm text-stone-600 dark:bg-[#2b211c] dark:text-stone-300">
                <p className="font-semibold text-ink dark:text-white">{currentCustomer.name}</p>
                <p className="mt-1 break-words dark:text-stone-400">{currentCustomer.email}</p>
                <p className="mt-1 dark:text-stone-400">{currentCustomer.phone}</p>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    signOutCustomer();
                  }}
                  className="mt-4 inline-flex rounded-full border border-[#ddcdbc] bg-[#fffaf3] px-4 py-2 font-semibold text-ink transition hover:border-terracotta hover:text-terracotta dark:border-[#3a2d25] dark:bg-[#3a2d25] dark:text-white dark:hover:border-[#7b5b48]"
                >
                  Log out
                </button>
              </div>
            ) : null}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
