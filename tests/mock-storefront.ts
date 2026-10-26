// Contract fixture only: this is not General E-commerce or a real database.
import { createServer } from "node:http";
import { fixtureProduct } from "./fixtures/commerce";
import type { StorefrontProductDTO } from "../lib/commerce-types";

let unavailable = false;
const requests: { path: string; query: string; authorized: boolean }[] = [];
const products: StorefrontProductDTO[] = Array.from(
  { length: 26 },
  (_, index) => ({
    ...fixtureProduct,
    id: 41 + index,
    bestSelling: index >= 4 && index < 8,
    frontendId:
      index === 0 ? fixtureProduct.frontendId : `fixture-suit-${index}`,
    slug: index === 0 ? fixtureProduct.slug : `fixture-suit-${index}`,
    name:
      index === 0
        ? fixtureProduct.name
        : `Navy Suit ${String(index).padStart(2, "0")}`,
    basePrice: String(21000 + index * 100),
    variants: fixtureProduct.variants.map((variant) => ({
      ...variant,
      id: variant.id + index * 10,
      productId: 41 + index,
    })),
  }),
);
const counts = {
  colors: ["Navy", "Black"],
  sizes: ["48", "50"],
  seasons: ["All Season"],
  colorCounts: { Navy: 26, Black: 26 },
  seasonCounts: { "All Season": 26 },
  minPrice: 21000,
  maxPrice: 23500,
  total: 26,
};
const server = createServer((req, res) => {
  const url = new URL(req.url!, "http://localhost");
  const json = (body: unknown, status = 200) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (url.pathname === "/__fixture/status")
    return json({ requests, unavailable });
  if (url.pathname === "/__fixture/fail") {
    unavailable = url.searchParams.get("enabled") === "true";
    return json({ unavailable });
  }
  requests.push({
    path: url.pathname,
    query: url.search,
    authorized: req.headers.authorization === "Bearer fixture-private-token",
  });
  if (unavailable) return json({ error: "Fixture offline" }, 503);
  if (url.pathname === "/api/storefront/v1/categories")
    return json([fixtureProduct.category]);
  if (url.pathname === "/api/storefront/v1/home")
    return json({
      featured: products.slice(0, 4),
      "new-arrivals": products.slice(0, 4),
      "best-sellers": products.slice(4, 8),
      summer: [],
    });
  if (url.pathname === "/api/storefront/v1/filters") return json(counts);
  if (url.pathname.startsWith("/api/storefront/v1/products/")) {
    const p = products.find((p) => p.slug === url.pathname.split("/").at(-1));
    return p ? json(p) : json({ code: "PRODUCT_NOT_FOUND" }, 404);
  }
  if (url.pathname === "/api/storefront/v1/products") {
    const q = url.searchParams,
      limit = Number(q.get("limit") || 24),
      page = Number(q.get("page") || 1);
    let result = products.filter(
      (p) =>
        (!q.get("category") || q.get("category") === "suits") &&
        (!q.get("q") ||
          p.name.toLowerCase().includes(q.get("q")!.toLowerCase())) &&
        (!q.has("ids") || q.getAll("ids").includes(p.frontendId!)) &&
        (!q.has("colors") ||
          p.variants.some((v) =>
            q.getAll("colors").includes(v.options.Color),
          )) &&
        (!q.has("sizes") ||
          p.variants.some((v) => q.getAll("sizes").includes(v.options.Size))) &&
        (!q.has("minPrice") ||
          Number(p.basePrice) >= Number(q.get("minPrice"))) &&
        (!q.has("maxPrice") ||
          Number(p.basePrice) <= Number(q.get("maxPrice"))),
    );
    if (q.get("sort") === "price-desc") result = [...result].reverse();
    if (q.get("sort") === "az")
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return json({
      products: result.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total: result.length,
        pages: Math.ceil(result.length / limit),
      },
      filters: counts,
    });
  }
  return json({ error: "Not implemented by test fixture" }, 404);
});
server.listen(Number(process.env.FIXTURE_PORT || 3120), "127.0.0.1", () =>
  console.log("Contract fixture listening (not a live backend)."),
);
