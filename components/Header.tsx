"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { products, collectionImage, formatPrice } from "@/lib/products";
import { Icon } from "./Icons";
import { useStore } from "./StoreProvider";
import { AccountDialog } from "./AccountDialog";

type MenuName = "Clothing" | "Shoes" | "Accessories" | "Gifts" | null;
const clothingLinks = [
  ["Suits", "/collections/suits"],
  ["Jackets", "/collections/jackets"],
  ["Trousers", "/collections/trousers"],
  ["Knitwear", "/collections/knitwear"],
  ["T-shirts", "/collections/shirts"],
  ["Outerwear", "/collections/jackets"],
  ["Classic Shirts", "/collections/shirts"],
  ["Casual Shirts", "/collections/shirts"],
  ["Eveningwear", "/collections/suits"],
  ["Waistcoats", "/collections/suits"],
  ["View All", "/collections/suits"],
];
const menuContent = {
  Clothing: {
    title: "CLOTHING",
    links: clothingLinks,
    highlights: [
      ["New Arrivals", "/collections/suits"],
      ["Occasion Dressing", "/collections/suits"],
      ["Everyday Essentials", "/collections/shirts"],
      ["The Aura BOED Edit", "/"],
      ["Best Sellers", "/collections/suits"],
      ["Our Story", "/#our-story"],
    ],
    promo: "Tailoring, Reimagined",
    promoCta: "Explore suits",
    promoHref: "/collections/suits",
    image: collectionImage("suits"),
  },
  Shoes: {
    title: "FOOTWEAR",
    links: [
      ["Loafers", "/collections/shoes"],
      ["Classic Shoes", "/collections/shoes"],
      ["Leather Essentials", "/collections/shoes"],
      ["View All", "/collections/shoes"],
    ],
    highlights: [
      ["Latest Styles", "/collections/shoes"],
      ["The Occasion Edit", "/collections/shoes"],
      ["Best Sellers", "/collections/shoes"],
    ],
    promo: "The Finishing Touch",
    promoCta: "Discover shoes",
    promoHref: "/collections/shoes",
    image: collectionImage("shoes"),
  },
  Accessories: {
    title: "ACCESSORIES",
    links: [
      ["Ties", "/collections/accessories"],
      ["Pocket Squares", "/collections/accessories"],
      ["Belts & Leather", "/collections/accessories"],
      ["Cufflinks", "/collections/accessories"],
      ["View All", "/collections/accessories"],
    ],
    highlights: [
      ["The Gift Edit", "/collections/accessories"],
      ["Timeless Details", "/collections/accessories"],
      ["Best Sellers", "/collections/accessories"],
    ],
    promo: "It Is In The Details",
    promoCta: "View accessories",
    promoHref: "/collections/accessories",
    image: collectionImage("accessories"),
  },
  Gifts: {
    title: "DISCOVER GIFTS",
    links: [
      ["Gifts for Him", "/collections/accessories"],
      ["Modern Classics", "/collections/shirts"],
      ["Special Occasions", "/collections/suits"],
      ["View All", "/collections/accessories"],
    ],
    highlights: [
      ["Thoughtful Choices", "/collections/accessories"],
      ["New Season Gifts", "/collections/accessories"],
      ["Explore Collections", "/collections/suits"],
    ],
    promo: "A Thoughtful Gesture",
    promoCta: "Shop gifts",
    promoHref: "/collections/accessories",
    image: collectionImage("accessories"),
  },
};

export function Header() {
  const { cartCount, setCartOpen, favorites } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<MenuName>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 40);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
  useEffect(() => {
    setMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setWishlistOpen(false);
    setAccountOpen(false);
  }, [pathname]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setSearchOpen(false);
        setMobileOpen(false);
        setWishlistOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  const searchResults = search.trim()
    ? products
        .filter((p) =>
          `${p.name} ${p.category} ${p.color}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .slice(0, 6)
    : products.filter((p) => p.featured).slice(0, 4);
  const savedProducts = products.filter((p) => favorites.includes(p.id));
  const activeMenu = menu ? menuContent[menu] : null;

  return (
    <>
      <div className="announcement">
        <Link href="/collections/suits">
          DISCOVER OUR NEW SEASON COLLECTION
        </Link>
      </div>
      <div
        className={`header-wrap ${scrolled ? "header-scrolled" : ""}`}
        onMouseLeave={() => setMenu(null)}
      >
        <header className="site-header">
          <div className="header-left">
            <button
              className="mobile-toggle icon-button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" size={23} />
            </button>
            <Link
              className="red-link"
              href="/collections/suits"
              onMouseEnter={() => setMenu(null)}
            >
              New Arrivals
            </Link>
            {(["Clothing", "Shoes", "Accessories", "Gifts"] as const).map(
              (nav) => (
                <Link
                  key={nav}
                  href={
                    nav === "Clothing"
                      ? "/collections/suits"
                      : nav === "Shoes"
                        ? "/collections/shoes"
                        : "/collections/accessories"
                  }
                  className={menu === nav ? "nav-active" : ""}
                  onMouseEnter={() => setMenu(nav)}
                  onFocus={() => setMenu(nav)}
                  aria-expanded={menu === nav}
                >
                  {nav}
                </Link>
              ),
            )}
            <Link
              className="red-link"
              href="/#our-story"
              onMouseEnter={() => setMenu(null)}
            >
              Our Story
            </Link>
          </div>
          <Link
            className="brand-logo"
            href="/"
            aria-label="Aura BOED homepage"
            onMouseEnter={() => setMenu(null)}
          >
            <img
              className="nav-brand-wordmark"
              src="/AURA_BOED_Logo.svg"
              alt="Aura BOED"
              width={190}
              height={57}
            />
          </Link>
          <div className="header-right">
            <button
              className="icon-button"
              aria-label="Search products"
              onClick={() => {
                setMenu(null);
                setSearchOpen(true);
              }}
            >
              <Icon name="search" size={18} />
            </button>
            <button
              className="icon-button favorites-icon"
              aria-label={`Saved items (${favorites.length})`}
              onClick={() => {
                setMenu(null);
                setWishlistOpen(true);
              }}
            >
              <Icon name="bookmark" size={18} />
              {favorites.length > 0 && <sup>{favorites.length}</sup>}
            </button>
            <span className="header-divider" />
            <button className="language-button" aria-label="Language English">
              EN <Icon name="chevron-down" size={11} />
            </button>
            <Link className="desktop-nav" href="/#our-story">
              Our stores
            </Link>
            <button
              className="account-trigger"
              aria-label="Open account"
              aria-haspopup="dialog"
              onClick={() => {
                setMenu(null);
                setAccountOpen(true);
              }}
            >
              <span>Account</span>
              <Icon name="user" size={19} />
            </button>
            <button
              className="cart-button"
              onClick={() => {
                setMenu(null);
                setCartOpen(true);
              }}
            >
              Cart <span className="cart-count">{cartCount}</span>
            </button>
          </div>
        </header>
        {activeMenu && (
          <div className="mega-menu" onMouseEnter={() => setMenu(menu)}>
            <div className="mega-column mega-list">
              <h3>{activeMenu.title}</h3>
              {activeMenu.links.map(([label, href]) => (
                <Link href={href} key={label}>
                  {label}
                </Link>
              ))}
            </div>
            <div className="mega-column mega-list">
              <h3>HIGHLIGHTS</h3>
              {activeMenu.highlights.map(([label, href]) => (
                <Link href={href} key={label}>
                  {label}
                </Link>
              ))}
            </div>
            <div className="mega-column mega-feature">
              <h3>BEST-SELLING ESSENTIALS</h3>
              {products
                .filter((p) => p.image)
                .slice(0, 3)
                .map((p) => (
                  <Link
                    className="mini-product"
                    href={`/products/${p.slug}`}
                    key={p.id}
                  >
                    {p.image ? (
                      <img src={p.image} alt="" />
                    ) : (
                      <span className="image-unavailable">No image</span>
                    )}
                    <span>
                      {p.name}
                      <strong>Buy now</strong>
                    </span>
                  </Link>
                ))}
            </div>
            <Link className="mega-editorial" href={activeMenu.promoHref}>
              <img src={activeMenu.image} alt="" />
              <div>
                <h2>{activeMenu.promo}</h2>
                <span>
                  {activeMenu.promoCta} <Icon name="arrow-right" size={16} />
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>
      {menu && (
        <button
          className="mega-shade"
          onMouseEnter={() => setMenu(null)}
          onClick={() => setMenu(null)}
          aria-label="Close menu"
        />
      )}

      {searchOpen && (
        <div className="modal-shade" onMouseDown={() => setSearchOpen(false)}>
          <div
            className="search-panel"
            role="dialog"
            aria-label="Search products"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="search-panel-head">
              <h2>What are you looking for?</h2>
              <button
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <Icon name="close" size={22} />
              </button>
            </div>
            <div className="search-input-wrap">
              <Icon name="search" size={23} />
              <input
                autoFocus
                placeholder="Search for a product or collection..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <h3>
              {search.trim()
                ? `RESULTS (${searchResults.length})`
                : "THE SELECTION OF THE MOMENT"}
            </h3>
            <div className="search-results">
              {searchResults.length ? (
                searchResults.map((p) => (
                  <Link
                    href={`/products/${p.slug}`}
                    key={p.id}
                    onClick={() => setSearchOpen(false)}
                  >
                    {p.image ? (
                      <img src={p.image} alt="" />
                    ) : (
                      <span className="image-unavailable">No image</span>
                    )}
                    <span>
                      {p.name}
                      <small>{formatPrice(p.price)}</small>
                    </span>
                  </Link>
                ))
              ) : (
                <p>No products found. Try another term.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {wishlistOpen && (
        <div className="modal-shade" onMouseDown={() => setWishlistOpen(false)}>
          <div
            className="wishlist-panel"
            role="dialog"
            aria-label="Saved pieces"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="drawer-head">
              <h2>Saved pieces ({savedProducts.length})</h2>
              <button
                aria-label="Close saved items"
                onClick={() => setWishlistOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            {savedProducts.length ? (
              <div className="wishlist-items">
                {savedProducts.map((p) => (
                  <Link
                    href={`/products/${p.slug}`}
                    key={p.id}
                    onClick={() => setWishlistOpen(false)}
                  >
                    {p.image ? (
                      <img src={p.image} alt="" />
                    ) : (
                      <span className="image-unavailable">No image</span>
                    )}
                    <span>
                      {p.name}
                      <small>View item</small>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-bag">
                <Icon name="bookmark" size={34} />
                <h3>Your wishlist is empty</h3>
                <p>Save your favourite styles to find them later.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {accountOpen && <AccountDialog onClose={() => setAccountOpen(false)} />}

      {mobileOpen && (
        <div className="modal-shade" onMouseDown={() => setMobileOpen(false)}>
          <nav
            className="mobile-panel"
            aria-label="Mobile navigation"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="drawer-head">
              <span className="mobile-brand">
                <img
                  src="/AURA_BOED_Logo.svg"
                  alt="Aura BOED"
                  width={170}
                  height={55}
                />
              </span>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            {[
              ["New Arrivals", "/collections/suits"],
              ...clothingLinks.slice(0, 8),
              ["Shoes", "/collections/shoes"],
              ["Accessories", "/collections/accessories"],
              ["Our Story", "/#our-story"],
            ].map(([label, href], i) => (
              <Link
                key={`${label}-${i}`}
                href={href}
                onClick={() => setMobileOpen(false)}
              >
                {label}
                <Icon name="arrow-right" size={16} />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
