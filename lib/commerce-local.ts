import "server-only";
import catalog from "@/public/boed_static_public/products.json";
import merchandising from "@/config/merchandising.json";
import categoryOverrides from "@/config/category-overrides.json";
import type {
  CatalogQuery,
  CommerceCategory,
  Collection,
  FilterOptions,
  HomepageGroup,
  HomepageProducts,
  Product,
  ProductPage,
} from "./commerce-types";
import { catalogQuerySchema } from "./commerce-query";

export function collectionFor(category: string, slug?: string): Collection {
  const override = slug
    ? (categoryOverrides as Record<string, { collection: string }>)[slug]
    : undefined;
  if (override) return override.collection as Collection;
  if (/Shoes/i.test(category)) return "shoes";
  if (/Trousers|Swimwear/i.test(category)) return "trousers";
  if (/Knitwear|Homewear/i.test(category)) return "knitwear";
  if (/Shirts/i.test(category)) return "shirts";
  if (/Jackets|Outerwear|Waistcoats/i.test(category)) return "jackets";
  if (/Suits|Tuxedos/i.test(category)) return "suits";
  return "accessories";
}
const localMedia = (path: string | null) =>
  path ? `/boed_static_public${path}` : "";
export const localProducts: Product[] = catalog.products.map((item) => {
  const color =
    item.name.match(
      /\b(Beige|Grey|Navy|Brown|Black|Blue|Cream|Olive|White|Green|Burgundy|Almond)\b/i,
    )?.[0] || "Not specified";
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: collectionFor(item.category, item.slug),
    sourceCategory: item.category,
    categories: item.categories,
    sourceUrl: item.sourceUrl,
    price: item.price,
    currency: "BDT",
    priceSource:
      item.priceSource === "DEMO_ESTIMATE" ? "DEMO_ESTIMATE" : "SOURCE",
    requiresPriceVerification: item.requiresPriceVerification ?? false,
    demoStock: item.stockSource === "DEMO_ESTIMATE" ? item.stock : null,
    availableStock: null,
    sizes: item.sizes,
    candidateSizes: item.candidateSizes ?? [],
    colors: color === "Not specified" ? [] : [color],
    color,
    season: "Not specified",
    image: localMedia(item.image),
    images: item.images.map(localMedia),
    videos: item.videos.map(localMedia),
    description: item.description || "",
    needsReview:
      item.needsReview ||
      item.requiresDescriptionReview ||
      item.requiresSizeVerification ||
      item.requiresPriceVerification,
    featured: merchandising.featured.includes(item.slug),
    bestSelling: merchandising["best-sellers"].includes(item.slug),
    dataSource: "local",
    backendProductId: null,
    mappingVerified: false,
    variants: [],
    attributes: [],
  };
});
export function localCategories(): CommerceCategory[] {
  const paths = [
    ...new Set(
      catalog.products.flatMap((p) =>
        p.categories.flatMap((category) => {
          const parts = category.split(" / ");
          return parts.map((_, index) => parts.slice(0, index + 1).join(" / "));
        }),
      ),
    ),
  ];
  return paths.map((sourcePath) => ({
    id: null,
    slug: sourcePath.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: sourcePath.split(" / ").at(-1)!,
    parentId: null,
    parentSlug: sourcePath.includes(" / ")
      ? sourcePath
          .split(" / ")
          .slice(0, -1)
          .join(" / ")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
      : null,
    collection: sourcePath.includes(" / ") ? collectionFor(sourcePath) : null,
    image:
      localProducts.find((p) => p.categories.includes(sourcePath) && p.image)
        ?.image || null,
    sourcePath,
  }));
}
function count(values: string[]) {
  return values.reduce<Record<string, number>>(
    (result, value) => ({ ...result, [value]: (result[value] || 0) + 1 }),
    {},
  );
}
export function localFilters(products: Product[]): FilterOptions {
  const prices = products.flatMap((p) => (p.price === null ? [] : [p.price]));
  return {
    colors: [...new Set(products.flatMap((p) => p.colors))].sort(),
    sizes: [...new Set(products.flatMap((p) => p.sizes))].sort(),
    seasons: [
      ...new Set(
        products.map((p) => p.season).filter((s) => s !== "Not specified"),
      ),
    ],
    colorCounts: count(products.map((p) => p.color)),
    seasonCounts: count(products.map((p) => p.season)),
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    total: products.length,
  };
}
export function localList(input: CatalogQuery = {}): ProductPage {
  const query = catalogQuerySchema.parse(input);
  let candidates = localProducts.filter(
    (p) =>
      !query.category ||
      (query.category === "summer"
        ? /linen|cotton|swim|summer/i.test(p.name)
        : p.category === query.category),
  );
  if (query.group) {
    const slugs = merchandising[query.group];
    candidates = slugs.flatMap(
      (slug) => candidates.find((p) => p.slug === slug) || [],
    );
  }
  const filters = localFilters(candidates);
  candidates = candidates.filter(
    (p) =>
      (!query.q ||
        `${p.name} ${p.sourceCategory}`
          .toLowerCase()
          .includes(query.q.toLowerCase())) &&
      (!query.ids?.length || query.ids.includes(p.id)) &&
      (!query.colors?.length || query.colors.includes(p.color)) &&
      (!query.sizes?.length || p.sizes.some((s) => query.sizes!.includes(s))) &&
      (!query.seasons?.length || query.seasons.includes(p.season)) &&
      (query.minPrice === undefined ||
        (p.price !== null && p.price >= query.minPrice)) &&
      (query.maxPrice === undefined ||
        (p.price !== null && p.price <= query.maxPrice)),
  );
  if (query.sort === "price-asc")
    candidates.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  else if (query.sort === "price-desc")
    candidates.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  else if (query.sort === "az")
    candidates.sort((a, b) => a.name.localeCompare(b.name));
  else if (!query.group)
    candidates.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  return {
    products: candidates.slice(
      (query.page - 1) * query.limit,
      query.page * query.limit,
    ),
    pagination: {
      page: query.page,
      limit: query.limit,
      total: candidates.length,
      pages: Math.ceil(candidates.length / query.limit),
    },
    filters,
    dataSource: "local",
  };
}
export function localHome(): HomepageProducts {
  return Object.fromEntries(
    Object.keys(merchandising).map((group) => [
      group,
      localList({ group: group as HomepageGroup, limit: 12 }).products,
    ]),
  ) as HomepageProducts;
}
