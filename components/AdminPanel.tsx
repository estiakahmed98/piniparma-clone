"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { products, categoryNames, type Collection } from "@/lib/products";
import { Icon, type IconName } from "./Icons";
import "./AdminSidebar.css";
type AdminItem = { label: string; icon: IconName };
type AdminGroup = { label: string; description: string; items: AdminItem[] };
const navigationGroups: AdminGroup[] = [
  {
    label: "OVERVIEW",
    description: "Monitor store performance and daily activity.",
    items: [
      { label: "Dashboard", icon: "grid-four" },
      { label: "Analytics & Reports", icon: "sliders" },
    ],
  },
  {
    label: "CATALOGUE",
    description: "Organise products, merchandising and catalogue information.",
    items: [
      { label: "Products", icon: "bag" },
      { label: "Categories & Collections", icon: "grid-four" },
      { label: "Variants & Attributes", icon: "sliders" },
      { label: "Brands", icon: "bookmark" },
      { label: "Product Reviews", icon: "check" },
    ],
  },
  {
    label: "SALES & FULFILMENT",
    description:
      "Manage orders, payment status, delivery and after-sales service.",
    items: [
      { label: "Orders", icon: "bag" },
      { label: "Abandoned Checkouts", icon: "rotate" },
      { label: "Payments & Transactions", icon: "shield" },
      { label: "Invoices", icon: "bookmark" },
      { label: "Shipping & Delivery", icon: "truck" },
      { label: "Returns & Refunds", icon: "rotate" },
    ],
  },
  {
    label: "INVENTORY & SUPPLY",
    description:
      "Track stock across warehouses, manage purchasing and coordinate inventory movements.",
    items: [
      { label: "Inventory", icon: "grid-four" },
      { label: "Warehouses", icon: "map-pin" },
      { label: "Stock Transfers", icon: "truck" },
      { label: "Stock Adjustments", icon: "sliders" },
      { label: "Purchase Orders", icon: "bag" },
      { label: "Suppliers", icon: "user" },
      { label: "Low Stock Alerts", icon: "bookmark" },
    ],
  },
  {
    label: "CUSTOMERS",
    description:
      "Understand customers, manage segments and handle support requests.",
    items: [
      { label: "Customers", icon: "user" },
      { label: "Customer Groups", icon: "grid-four" },
      { label: "Support & Tickets", icon: "user" },
    ],
  },
  {
    label: "MARKETING & CONTENT",
    description:
      "Plan promotions, manage storefront content and grow customer relationships.",
    items: [
      { label: "Discounts & Coupons", icon: "bookmark" },
      { label: "Campaigns", icon: "arrow-right" },
      { label: "Gift Cards", icon: "bag" },
      { label: "Newsletter Subscribers", icon: "user" },
      { label: "Pages & Banners", icon: "grid-two" },
      { label: "SEO", icon: "search" },
    ],
  },
  {
    label: "ADMINISTRATION",
    description:
      "Control staff access, store configuration, integrations and operational settings.",
    items: [
      { label: "Users & Roles", icon: "user" },
      { label: "Permissions", icon: "shield" },
      { label: "Store Settings", icon: "sliders" },
      { label: "Taxes & Currencies", icon: "sliders" },
      { label: "Payment Gateways", icon: "shield" },
      { label: "Integrations", icon: "grid-four" },
      { label: "Activity Log", icon: "rotate" },
    ],
  },
];
const navigation = navigationGroups.flatMap((group) => group.items);
export function AdminPanel() {
  const [active, setActive] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [mobileNavigation, setMobileNavigation] = useState(false);
  const navigationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const handleResize = () => {
      if (!media.matches) setMobileNavigation(false);
    };
    media.addEventListener("change", handleResize);
    return () => media.removeEventListener("change", handleResize);
  }, []);
  useEffect(() => {
    if (!mobileNavigation) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = navigationRef.current;
    const focusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input:not([disabled])",
        ) || [],
      ).filter((element) => element.getClientRects().length);
    const focusFrame = requestAnimationFrame(() => focusable()[0]?.focus());
    const focusTimer = window.setTimeout(() => {
      if (!panel?.contains(document.activeElement)) focusable()[0]?.focus();
    }, 300);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileNavigation(false);
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!panel?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      cancelAnimationFrame(focusFrame);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, [mobileNavigation]);

  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        `${item.label} ${group.label}`
          .toLowerCase()
          .includes(menuSearch.trim().toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length);
  const activeGroup = navigationGroups.find((group) =>
    group.items.some((item) => item.label === active),
  );
  function selectSection(label: string) {
    setActive(label);
    setMobileNavigation(false);
  }
  function toggleGroup(label: string) {
    setCollapsedGroups((current) =>
      current.includes(label)
        ? current.filter((group) => group !== label)
        : [...current, label],
    );
  }

  const pictured = products.filter((p) => p.image).length;
  const categories = Object.entries(categoryNames) as [Collection, string][];
  const selected = products
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand-row" inert={mobileNavigation}>
          <Link
            href="/"
            className="admin-brand"
            aria-label="Aura BOED homepage"
          >
            <img
              className="admin-brand-icon"
              src="/favicon.png"
              alt=""
              width={40}
              height={40}
            />
            <img
              className="admin-brand-wordmark"
              src="/AURA_BOED_Logo.svg"
              alt="Aura BOED"
              width={170}
              height={55}
            />
          </Link>
          <button
            type="button"
            className="admin-mobile-nav-toggle"
            aria-label="Toggle admin navigation"
            aria-expanded={mobileNavigation}
            aria-controls="admin-sidebar-navigation"
            onClick={() => setMobileNavigation((open) => !open)}
          >
            <Icon name={mobileNavigation ? "close" : "menu"} size={22} />
          </button>
        </div>
        {mobileNavigation && (
          <button
            type="button"
            className="admin-mobile-backdrop"
            aria-label="Close admin navigation"
            tabIndex={-1}
            onClick={() => setMobileNavigation(false)}
          />
        )}
        <div
          ref={navigationRef}
          role={mobileNavigation ? "dialog" : undefined}
          aria-modal={mobileNavigation || undefined}
          aria-label={mobileNavigation ? "Admin navigation menu" : undefined}
          id="admin-sidebar-navigation"
          className={`admin-sidebar-navigation ${mobileNavigation ? "is-open" : ""}`}
        >
          <div className="admin-drawer-header">
            <Link
              href="/"
              className="admin-drawer-brand"
              aria-label="Aura BOED homepage"
            >
              <img
                src="/favicon.png"
                alt=""
                width={38}
                height={38}
              />
              <img
                src="/AURA_BOED_Logo.svg"
                alt="Aura BOED"
                width={150}
                height={55}
              />
            </Link>
            <button
              type="button"
              aria-label="Close admin menu"
              onClick={() => setMobileNavigation(false)}
            >
              <Icon name="close" size={23} />
            </button>
          </div>
          <label className="admin-menu-search">
            <Icon name="search" size={16} />
            <input
              aria-label="Search admin menu"
              placeholder="Find a menu..."
              value={menuSearch}
              onChange={(event) => setMenuSearch(event.target.value)}
            />
            {menuSearch && (
              <button
                type="button"
                aria-label="Clear menu search"
                onClick={() => setMenuSearch("")}
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </label>
          <nav aria-label="Admin navigation">
            {visibleGroups.map((group) => {
              const expanded =
                Boolean(menuSearch.trim()) ||
                !collapsedGroups.includes(group.label);
              const groupId = `admin-group-${group.label.toLowerCase().replaceAll(/[^a-z]+/g, "-")}`;
              return (
                <section className="admin-menu-group" key={group.label}>
                  <h2>
                    <button
                      type="button"
                      className="admin-group-toggle"
                      aria-expanded={expanded}
                      aria-controls={groupId}
                      onClick={() => toggleGroup(group.label)}
                    >
                      <span>{group.label}</span>
                      <Icon name="chevron-down" size={12} />
                    </button>
                  </h2>
                  <div
                    id={groupId}
                    className="admin-menu-items"
                    hidden={!expanded}
                  >
                    {group.items.map((item) => (
                      <button
                        type="button"
                        className="admin-menu-item"
                        key={item.label}
                        aria-current={
                          active === item.label ? "page" : undefined
                        }
                        onClick={() => selectSection(item.label)}
                      >
                        <Icon name={item.icon} size={18} />
                        <span>{item.label}</span>
                        {item.label !== "Dashboard" && <small>Soon</small>}
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </nav>
          {!visibleGroups.length && (
            <div className="admin-menu-empty">
              No menu items match ?{menuSearch}?.
              <button type="button" onClick={() => setMenuSearch("")}>
                Clear search
              </button>
            </div>
          )}
        </div>
        <div className="admin-sidebar-bottom">
          <div className="admin-preview">
            <Icon name="shield" />
            <div>
              Design preview<small>Admin services coming soon</small>
            </div>
          </div>
          <Link href="/">
            <Icon name="arrow-left" size={17} />
            Back to storefront
          </Link>
        </div>
      </aside>
      <section className="admin-workspace" inert={mobileNavigation}>
        <header className="admin-topbar">
          <span>
            Workspace <span>/</span> {active}
          </span>
          <div>
            <span className="admin-preview-pill">PREVIEW</span>
            <span className="admin-avatar">AB</span>
            <b>Store admin</b>
          </div>
        </header>
        <div className="admin-content">
          <div className="admin-page-title">
            <div>
              <span className="eyebrow">YOUR STORE AT A GLANCE</span>
              <h1>{active === "Dashboard" ? "Store overview" : active}</h1>
              <p>
                {active === "Dashboard"
                  ? "A clearer view of your collection. All in one place."
                  : "Everything you need to manage your store, coming soon."}
              </p>
            </div>
            <Link href="/" className="admin-view-store">
              View storefront <Icon name="arrow-right" size={17} />
            </Link>
          </div>
          {active !== "Dashboard" ? (
            <div className="admin-coming-soon">
              <span>
                <Icon
                  name={navigation.find((n) => n.label === active)!.icon}
                  size={32}
                />
              </span>
              <p className="eyebrow">ON THE WAY</p>
              <h2>{active} is coming soon.</h2>
              <p>{activeGroup?.description} This section is being prepared.</p>
              <button
                className="dark-button"
                onClick={() => setActive("Dashboard")}
              >
                BACK TO DASHBOARD <Icon name="arrow-right" size={17} />
              </button>
            </div>
          ) : (
            <>
              <div className="admin-welcome">
                <div>
                  <span>THE AURA BOED CATALOGUE</span>
                  <h2>Your collection, thoughtfully organised.</h2>
                  <p>
                    Explore your products and see what is ready for the next
                    chapter.
                  </p>
                </div>
                <Icon name="bag" size={64} />
              </div>
              <div className="admin-stats">
                {[
                  {
                    label: "Total products",
                    value: products.length,
                    note: "Imported from your catalogue",
                    icon: "bag",
                  },
                  {
                    label: "With photography",
                    value: pictured,
                    note: `${products.length - pictured} awaiting images`,
                    icon: "grid-four",
                  },
                  {
                    label: "Collections",
                    value: categories.length,
                    note: "Storefront categories",
                    icon: "bookmark",
                  },
                  {
                    label: "Prices pending",
                    value: products.filter((p) => p.price === null).length,
                    note: "Pricing has not been supplied",
                    icon: "sliders",
                  },
                ].map((stat) => (
                  <article key={stat.label}>
                    <div>
                      {stat.label}
                      <Icon name={stat.icon as IconName} size={19} />
                    </div>
                    <strong>{stat.value}</strong>
                    <small>{stat.note}</small>
                  </article>
                ))}
              </div>
              <div className="admin-dashboard-grid">
                <section className="admin-card">
                  <div className="admin-card-heading">
                    <div>
                      <h2>Product catalogue</h2>
                      <p>Your real products and imagery</p>
                    </div>
                    <label className="admin-search">
                      <Icon name="search" size={17} />
                      <input
                        aria-label="Search catalogue"
                        placeholder="Find a product..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="admin-table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Collection</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <Link href={`/products/${p.slug}`}>
                                {p.image ? (
                                  <img src={p.image} alt="" />
                                ) : (
                                  <span className="admin-no-image">
                                    <Icon name="bag" />
                                  </span>
                                )}
                                <span>{p.name}</span>
                              </Link>
                            </td>
                            <td>{categoryNames[p.category]}</td>
                            <td>
                              <span
                                className={`admin-status ${p.image ? "" : "pending"}`}
                              >
                                {p.image ? "Image available" : "Needs image"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!selected.length && (
                      <p className="admin-empty">
                        No products match your search.
                      </p>
                    )}
                  </div>
                </section>
                <section className="admin-card">
                  <div className="admin-card-heading">
                    <div>
                      <h2>Collection breakdown</h2>
                      <p>Pieces across your store</p>
                    </div>
                  </div>
                  <div className="admin-collections">
                    {categories.map(([key, label]) => {
                      const count = products.filter(
                        (p) => p.category === key,
                      ).length;
                      return (
                        <Link key={key} href={`/collections/${key}`}>
                          <div>
                            <span>{label}</span>
                            <b>{count}</b>
                          </div>
                          <div className="admin-bar">
                            <span
                              style={{
                                width: `${(count / products.length) * 100}%`,
                              }}
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <p className="admin-catalog-note">
                    Prices, sizes and stock are awaiting confirmation. No sales
                    or customer data is connected.
                  </p>
                </section>
              </div>
              <div className="admin-readiness">
                <Icon name="shield" size={24} />
                <div>
                  <h3>A little preparation goes a long way.</h3>
                  <p>
                    {products.filter((p) => p.needsReview).length} products
                    flagged for review. Confirm photography, pricing and
                    availability before taking orders.
                  </p>
                </div>
              </div>
            </>
          )}
          <footer className="admin-footer">
            Aura BOED <span>Considered design. Everyday clarity.</span>
          </footer>
        </div>
      </section>
    </div>
  );
}
