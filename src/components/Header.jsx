import { Check, ChevronDown, Heart, Menu, ShoppingBag, Store, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useStore } from "../context/StoreContext";

const linkClasses = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-white hover:text-stone-900"
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
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
      <div className="page-reveal mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <NavLink
            to={homePath}
            className="flex items-center gap-3"
            onClick={() => {
              closeMobileMenu();
              closeProfileMenu();
            }}
          >
            <span className="motion-float inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-soft">
              <Store size={18} />
            </span>
            <div>
              <p className="font-sans text-lg font-semibold text-ink">NKeys</p>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                Stickers & keychains
              </p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-2 rounded-full bg-sand px-2 py-2 md:flex">
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
                className={({ isActive }) =>
                  `hidden items-center gap-2 rounded-full border bg-white px-4 py-3 text-sm font-semibold shadow-sm transition duration-300 hover:-translate-y-0.5 lg:inline-flex ${
                    isActive
                      ? "border-stone-900 text-stone-900"
                      : "border-stone-200 text-ink hover:border-stone-900"
                  }`
                }
              >
                <Heart size={16} className="text-rose-500" />
                Likes
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-50 px-2 text-xs text-rose-700">
                  {likedProductIds.length}
                </span>
              </NavLink>
            ) : null}

            <div className="relative hidden md:block" ref={profileMenuRef}>
              {currentCustomer ? (
                <>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((current) => !current)}
                    className="inline-flex items-center gap-3 rounded-full border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-stone-900"
                    aria-expanded={profileMenuOpen}
                    aria-label="Toggle profile menu"
                  >
                    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-sand text-xs font-semibold text-ink">
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
                    <div className="absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-soft">
                      <div className="flex items-center gap-3 rounded-3xl bg-sand p-4">
                        <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-ink">
                          {currentCustomer.firstName.slice(0, 1).toUpperCase()}
                          <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{currentCustomer.name}</p>
                          <p className="truncate text-xs text-stone-500">{currentCustomer.email}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3 rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                            Phone
                          </p>
                          <p className="mt-1 font-medium text-ink">{currentCustomer.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                            Account
                          </p>
                          <p className="mt-1 font-medium text-ink">
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
                        className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-stone-900"
                      >
                        Log out
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            {isOwner ? (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                data-cart-anchor="true"
                className={`inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-stone-900 ${
                  isCartBumping ? "cart-bump" : ""
                }`}
              >
                <ShoppingBag size={16} />
                Cart
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-stone-900 px-2 text-xs text-white">
                  {cartCount}
                </span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="inline-flex rounded-full border border-stone-200 bg-white p-3 transition duration-300 hover:-translate-y-0.5 md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <nav className="page-reveal-right grid gap-3 rounded-3xl border border-stone-200 bg-white p-3 md:hidden">
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
            {isOwner ? (
              <NavLink to="/admin" className={linkClasses} onClick={closeMobileMenu}>
                Admin
              </NavLink>
            ) : null}
            {currentCustomer ? (
              <div className="rounded-3xl bg-stone-50 p-4 text-sm text-stone-600">
                <p className="font-semibold text-ink">{currentCustomer.name}</p>
                <p className="mt-1 break-all">{currentCustomer.email}</p>
                <p className="mt-1">{currentCustomer.phone}</p>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    signOutCustomer();
                  }}
                  className="mt-4 inline-flex rounded-full border border-stone-200 bg-white px-4 py-2 font-semibold text-ink transition hover:border-stone-900"
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
