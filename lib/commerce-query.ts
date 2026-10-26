import { z } from "zod";
import type { CatalogQuery } from "./commerce-types";

export const collections = [
  "suits",
  "jackets",
  "shirts",
  "trousers",
  "knitwear",
  "shoes",
  "accessories",
  "summer",
] as const;
const list = z.array(z.string().trim().min(1).max(180)).max(50).optional();
const price = z.number().finite().min(0).max(99999999).optional();
export const catalogQuerySchema = z
  .object({
    category: z.enum(collections).optional(),
    q: z.string().trim().max(160).optional(),
    sort: z.enum(["featured", "price-asc", "price-desc", "az"]).optional(),
    colors: list,
    sizes: list,
    seasons: list,
    ids: list,
    minPrice: price,
    maxPrice: price,
    page: z.number().int().min(1).max(100000).default(1),
    limit: z.number().int().min(1).max(48).default(24),
    group: z
      .enum(["featured", "new-arrivals", "best-sellers", "summer"])
      .optional(),
  })
  .strict()
  .refine(
    (q) =>
      q.minPrice === undefined ||
      q.maxPrice === undefined ||
      q.minPrice <= q.maxPrice,
    { message: "Minimum price cannot exceed maximum price" },
  );
export function queryFromSearchParams(params: URLSearchParams): CatalogQuery {
  const input: Record<string, unknown> = {};
  for (const key of ["category", "q", "sort", "group"])
    if (params.has(key)) input[key] = params.get(key);
  for (const key of ["page", "limit", "minPrice", "maxPrice"])
    if (params.has(key)) input[key] = Number(params.get(key));
  for (const key of ["colors", "sizes", "seasons", "ids"])
    if (params.has(key))
      input[key] = params
        .getAll(key)
        .flatMap((value) => value.split(","))
        .filter(Boolean);
  return catalogQuerySchema.parse(input);
}
export function queryString(query: CatalogQuery) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else params.set(key, String(value));
  }
  return params.toString();
}
