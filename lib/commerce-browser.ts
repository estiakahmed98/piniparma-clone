import type { CatalogQuery, ProductPage } from "./commerce-types";
import { queryString } from "./commerce-query";

export async function fetchCatalogue(
  query: CatalogQuery,
  signal?: AbortSignal,
): Promise<ProductPage> {
  const response = await fetch(`/api/commerce/products?${queryString(query)}`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error("The collection could not be loaded. Please try again.");
  return response.json() as Promise<ProductPage>;
}
