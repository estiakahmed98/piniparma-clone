"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { Icon } from "./Icons";
import {
  products,
  subcollections,
  type CollectionPage,
  summerProducts,
  categoryNames,
  categoryDescription,
} from "@/lib/products";

type Sort = "featured" | "price-asc" | "price-desc" | "az";
const COLORS = [
  "Beige",
  "Grey",
  "Navy",
  "Brown",
  "Black",
  "Blue",
  "Cream",
  "Olive",
];
const SIZES = [
  "38",
  "40",
  "42",
  "44",
  "46",
  "S",
  "M",
  "L",
  "XL",
  "30",
  "32",
  "34",
  "36",
  "39",
  "41",
  "43",
  "One size",
];
const SEASONS = ["Spring / Summer", "Autumn / Winter", "All Season"];

type Props = { category: CollectionPage };
export function CollectionView({ category }: Props) {
  const [sort, setSort] = useState<Sort>("featured");
  const [grid, setGrid] = useState<1 | 2 | 4>(4);
  const [filterOpen, setFilterOpen] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [quickFilter, setQuickFilter] = useState("");
  const isSuits = category === "suits";
  const allProducts =
    category === "summer"
      ? summerProducts
      : products.filter((p) => p.category === category);

  const shown = useMemo(() => {
    let result = allProducts.filter((p) => {
      if (colors.length && !colors.includes(p.color)) return false;
      if (sizes.length && !p.sizes.some((s) => sizes.includes(s))) return false;
      if (seasons.length && !seasons.includes(p.season)) return false;
      if (minPrice !== "" && (p.price === null || p.price < Number(minPrice)))
        return false;
      if (maxPrice !== "" && (p.price === null || p.price > Number(maxPrice)))
        return false;
      if (quickFilter) {
        if (quickFilter === "All" || quickFilter === "All Season") return true;
        if (COLORS.includes(quickFilter)) return p.color === quickFilter;
        if (SEASONS.includes(quickFilter)) return p.season === quickFilter;
        if (quickFilter === "Black") return p.color === "Black";
      }
      return true;
    });
    if (sort === "price-asc")
      result = [...result].sort(
        (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
      );
    if (sort === "price-desc")
      result = [...result].sort(
        (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
      );
    if (sort === "az")
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
    // allProducts derived from the static data source; dependency category captures its identity.
  }, [category, colors, sizes, seasons, minPrice, maxPrice, quickFilter, sort]);
  const activeCount =
    colors.length +
    sizes.length +
    seasons.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (quickFilter ? 1 : 0);
  const resetFilters = () => {
    setColors([]);
    setSizes([]);
    setSeasons([]);
    setMinPrice("");
    setMaxPrice("");
    setQuickFilter("");
  };
  const toggle = (
    value: string,
    values: string[],
    setter: (items: string[]) => void,
  ) =>
    setter(
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    );
  const countSubcollection = (tag: string) =>
    allProducts.filter((p) =>
      tag === "All"
        ? true
        : tag === "All Season"
          ? p.season === "All Season"
          : COLORS.includes(tag)
            ? p.color === tag
            : p.season === tag,
    ).length;
  return (
    <>
      <div className="collection-top">
        <h1>{categoryNames[category]}</h1>
        {isSuits ? (
          <div className="subcategory-scroll" aria-label="Suits subcollections">
            {subcollections.map(({ label, tag }) => (
              <button
                key={label}
                className={quickFilter === tag ? "selected-subcategory" : ""}
                onClick={() => setQuickFilter(quickFilter === tag ? "" : tag)}
              >
                {label} <span>{countSubcollection(tag)}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="collection-description">
            {categoryDescription[category]}
          </p>
        )}
      </div>

      <div className="collection-toolbar">
        <span className="count-products">
          {shown.length} product{shown.length === 1 ? "" : "s"}
        </span>
        <div className="collection-controls">
          <label htmlFor="collection-sort">Sort by:</label>
          <select
            id="collection-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="az">Alphabetically, A–Z</option>
          </select>
          <button
            className="filter-trigger"
            onClick={() => setFilterOpen(true)}
          >
            Filter {activeCount > 0 ? `(${activeCount})` : ""}
            <Icon name="sliders" size={17} />
          </button>
          <span className="grid-controls">
            <button
              aria-label="Four columns"
              className={grid === 4 ? "active-grid" : ""}
              onClick={() => setGrid(4)}
            >
              <Icon name="grid-four" size={20} />
            </button>
            <button
              aria-label="Two columns"
              className={grid === 2 ? "active-grid" : ""}
              onClick={() => setGrid(2)}
            >
              <Icon name="grid-two" size={20} />
            </button>
            <button
              aria-label="Single column"
              className={grid === 1 ? "active-grid" : ""}
              onClick={() => setGrid(1)}
            >
              <Icon name="grid-one" size={20} />
            </button>
          </span>
        </div>
      </div>

      {activeCount > 0 && (
        <div className="filter-chips">
          <span>ACTIVE FILTERS</span>
          {colors.map((v) => (
            <button key={v} onClick={() => toggle(v, colors, setColors)}>
              {v} ×
            </button>
          ))}
          {sizes.map((v) => (
            <button key={v} onClick={() => toggle(v, sizes, setSizes)}>
              Size {v} ×
            </button>
          ))}
          {seasons.map((v) => (
            <button key={v} onClick={() => toggle(v, seasons, setSeasons)}>
              {v} ×
            </button>
          ))}
          {quickFilter && (
            <button onClick={() => setQuickFilter("")}>
              Collection: {quickFilter} ×
            </button>
          )}
          <button className="clear-all" onClick={resetFilters}>
            Clear all
          </button>
        </div>
      )}
      {shown.length ? (
        <div className={`collection-product-grid grid-${grid}`}>
          {shown.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <h2>No pieces match your selection.</h2>
          <p>Try adjusting your filters to discover more of the collection.</p>
          <button className="dark-button" onClick={resetFilters}>
            CLEAR ALL FILTERS
          </button>
        </div>
      )}
      <div className="collection-end">
        <span>
          YOU'VE VIEWED {shown.length} OF {shown.length} PRODUCTS
        </span>
        <div className="progress-line">
          <div style={{ width: "100%" }} />
        </div>
        <Link href="/">
          BACK TO HOME <Icon name="arrow-right" size={15} />
        </Link>
      </div>
      <div className="collection-seo">
        <span className="eyebrow">THE Aura BOED COLLECTION</span>
        <h2>{categoryNames[category]} for Modern Living</h2>
        <p>
          {categoryDescription[category]} Inspired by classic forms, designed
          for the contemporary wardrobe, and made to balance style with comfort.
        </p>
      </div>

      {filterOpen && (
        <>
          <button
            className="drawer-backdrop"
            aria-label="Close filters"
            onClick={() => setFilterOpen(false)}
          />
          <aside
            className="filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
          >
            <div className="drawer-head">
              <h2>Filter</h2>
              <button
                aria-label="Close filters"
                onClick={() => setFilterOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="filter-body">
              <FilterSection title="Color">
                <div className="filter-colors">
                  {COLORS.map((c) => (
                    <label key={c}>
                      <input
                        type="checkbox"
                        checked={colors.includes(c)}
                        onChange={() => toggle(c, colors, setColors)}
                      />
                      <span
                        className={`color-dot dot-${c.toLowerCase().replace(" ", "-")}`}
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
              <FilterSection title="Size">
                <div className="filter-sizes">
                  {SIZES.filter((s) =>
                    allProducts.some((p) => p.sizes.includes(s)),
                  ).map((s) => (
                    <label key={s}>
                      <input
                        type="checkbox"
                        checked={sizes.includes(s)}
                        onChange={() => toggle(s, sizes, setSizes)}
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
              <FilterSection title="Price (BDT)">
                <div className="price-inputs">
                  <label>
                    From
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </label>
                  <label>
                    To
                    <input
                      type="number"
                      min="0"
                      placeholder="50000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </label>
                </div>
              </FilterSection>
              <FilterSection title="Season">
                <div className="filter-checks">
                  {SEASONS.map((s) => (
                    <label key={s}>
                      <input
                        type="checkbox"
                        checked={seasons.includes(s)}
                        onChange={() => toggle(s, seasons, setSeasons)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </FilterSection>
            </div>
            <div className="filter-footer">
              <button className="reset-button" onClick={resetFilters}>
                Reset filters
              </button>
              <button
                className="dark-button"
                onClick={() => setFilterOpen(false)}
              >
                SHOW {shown.length} PRODUCTS
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="filter-section">
      <button
        className="filter-section-title"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {title}
        <Icon name={open ? "minus" : "plus"} size={17} />
      </button>
      {open && children}
    </section>
  );
}
