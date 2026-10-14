import { NavLink, useLocation } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "../common/Logo";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../hooks/useWishlist";
import { NavSearch } from "./NavSearch";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/tracker", label: "Tracker" },
  { to: "/about", label: "About" },
  { to: "/blogs", label: "Blogs" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef(null);
  const { pathname } = useLocation();
  const cart = useCart();
  const wishlist = useWishlist();

  useEffect(() => {
    setSearchOpen(false);
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    function onPointer(event) {
      if (headerRef.current?.contains(event.target)) return;
      setSearchOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [searchOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-line/80 bg-ivory/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <button
          type="button"
          className="rounded-full p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <NavLink to="/" className="text-ink outline-none! transition-opacity focus-visible:opacity-70 lg:mr-6 xl:mr-8" aria-label="Satin home">
          <Logo className="h-9 w-auto" />
        </NavLink>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative text-sm tracking-[0.14em] uppercase after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-rose after:transition-all after:duration-300 ${isActive ? "text-ink after:w-full" : "text-ink-soft after:w-0 hover:text-ink hover:after:w-full"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-controls="site-search"
            onClick={() => {
              setOpen(false);
              setSearchOpen((value) => !value);
            }}
            className="rounded-full p-2 text-ink hover:bg-blush/60"
          >
            <Search size={20} />
          </button>
          <IconLink to="/wishlist" label={wishlist.count ? `Wishlist, ${wishlist.count} saved` : "Wishlist"} className="hidden sm:inline-flex">
            <span className="relative">
              <Heart size={20} />
              {wishlist.count > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] text-paper">
                  {wishlist.count}
                </span>
              )}
            </span>
          </IconLink>
          <IconLink to="/account" label="Account" className="hidden sm:inline-flex">
            <User size={20} />
          </IconLink>
          <button
            type="button"
            aria-label={cart.count ? `Cart, ${cart.count} items` : "Cart"}
            aria-expanded={cart.drawerOpen}
            aria-controls="cart-drawer"
            onClick={cart.toggleDrawer}
            className="rounded-full p-2 text-ink hover:bg-blush/60"
          >
            <span className="relative">
              <ShoppingBag size={20} />
              {cart.count > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] text-paper">
                  {cart.count}
                </span>
              )}
            </span>
          </button>
          <NavLink
            to="/shop"
            className="ml-2 hidden rounded-full bg-ink px-4 py-2 text-sm whitespace-nowrap text-paper sm:inline-flex"
          >
            Shop Now
          </NavLink>
        </div>
      </div>

      {searchOpen && (
        <div id="site-search">
          <NavSearch onClose={() => setSearchOpen(false)} />
        </div>
      )}

      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-paper px-5 py-4 lg:hidden" aria-label="Mobile">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block py-3 text-lg text-ink"
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/wishlist" onClick={() => setOpen(false)} className="block border-t border-line py-3 text-lg text-ink">
            {wishlist.count ? `Wishlist, ${wishlist.count} saved` : "Wishlist"}
          </NavLink>
          <NavLink to="/account" onClick={() => setOpen(false)} className="block py-3 text-lg text-ink">
            Account
          </NavLink>
        </nav>
      )}
    </header>
  );
}

function IconLink({ to, label, children, className = "" }) {
  return (
    <NavLink to={to} aria-label={label} className={`rounded-full p-2 text-ink hover:bg-blush/60 ${className}`}>
      {children}
    </NavLink>
  );
}
