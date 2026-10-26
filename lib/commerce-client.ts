import "server-only";
import { cache } from "react";
import { z } from "zod";
import {
  getCommerceConfig,
  storefrontRoutes,
  type CommerceConfig,
} from "./commerce-config";
import {
  adaptBackendProduct,
  backendPageSchema,
  categorySchema,
  filterOptionsSchema,
  productDtoSchema,
} from "./commerce-adapter";
import { catalogQuerySchema, queryString } from "./commerce-query";
import {
  localCategories,
  localHome,
  localList,
  localProducts,
} from "./commerce-local";
import type {
  CatalogQuery,
  CommerceCategory,
  FilterOptions,
  HomepageProducts,
  Product,
  ProductPage,
} from "./commerce-types";

export class CommerceError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 502,
  ) {
    super(message);
    this.name = "CommerceError";
  }
}
export function createCommerceClient(
  config: CommerceConfig,
  fetcher: typeof fetch = fetch,
) {
  async function request<T>(
    path: string,
    schema: z.ZodType<T>,
    query = "",
  ): Promise<T> {
    if (!config.baseUrl)
      throw new CommerceError(
        "CONFIGURATION",
        "Commerce backend is not configured",
        503,
      );
    const url = new URL(path, config.baseUrl);
    url.search = query;
    try {
      const response = await fetcher(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(config.timeoutMs),
        headers: {
          Accept: "application/json",
          ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
        },
      });
      if (response.status === 404) {
        const error = (await response.json().catch(() => null)) as {
          code?: string;
        } | null;
        if (error?.code === "PRODUCT_NOT_FOUND")
          throw new CommerceError("NOT_FOUND", "Product not found", 404);
        throw new CommerceError(
          "ENDPOINT_UNAVAILABLE",
          "The required storefront endpoint is not implemented",
          502,
        );
      }
      if (!response.ok)
        throw new CommerceError(
          "BACKEND_UNAVAILABLE",
          "The catalogue service is unavailable",
          502,
        );
      const parsed = schema.safeParse(await response.json());
      if (!parsed.success)
        throw new CommerceError(
          "INVALID_CONTRACT",
          "The catalogue service returned an incompatible response",
          502,
        );
      return parsed.data;
    } catch (error) {
      if (error instanceof CommerceError) throw error;
      throw new CommerceError(
        "BACKEND_UNAVAILABLE",
        "The catalogue service could not be reached",
        502,
      );
    }
  }
  return {
    source: config.dataSource,
    async listProducts(input: CatalogQuery = {}): Promise<ProductPage> {
      const query = catalogQuerySchema.parse(input);
      if (config.dataSource === "local") return localList(query);
      const page = await request(
        storefrontRoutes.products,
        backendPageSchema,
        queryString(query),
      );
      if (
        page.pagination.page !== query.page ||
        page.pagination.limit !== query.limit ||
        page.products.length > query.limit ||
        new Set(page.products.map((p) => p.id)).size !== page.products.length
      )
        throw new CommerceError(
          "INVALID_CONTRACT",
          "Invalid catalogue pagination",
        );
      const products = page.products.map(adaptBackendProduct);
      if (
        new Set(products.map((p) => p.id)).size !== products.length ||
        new Set(products.map((p) => p.slug)).size !== products.length
      )
        throw new CommerceError(
          "INVALID_CONTRACT",
          "Duplicate storefront identity",
        );
      return { ...page, products, dataSource: "api" };
    },
    async getProduct(slug: string): Promise<Product | null> {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return null;
      if (config.dataSource === "local")
        return localProducts.find((p) => p.slug === slug) || null;
      try {
        const product = adaptBackendProduct(
          await request(
            `${storefrontRoutes.products}/${encodeURIComponent(slug)}`,
            productDtoSchema,
          ),
        );
        if (product.slug !== slug)
          throw new CommerceError(
            "INVALID_CONTRACT",
            "The returned product slug does not match the route",
          );
        return product;
      } catch (error) {
        if (error instanceof CommerceError && error.code === "NOT_FOUND")
          return null;
        throw error;
      }
    },
    async categories(): Promise<CommerceCategory[]> {
      return config.dataSource === "local"
        ? localCategories()
        : request(storefrontRoutes.categories, z.array(categorySchema));
    },
    async filters(category?: CatalogQuery["category"]): Promise<FilterOptions> {
      return config.dataSource === "local"
        ? localList({ category }).filters
        : request(
            storefrontRoutes.filters,
            filterOptionsSchema,
            queryString({ category }),
          );
    },
    async home(): Promise<HomepageProducts> {
      if (config.dataSource === "local") return localHome();
      const items = z.array(productDtoSchema).max(48);
      const home = await request(
        storefrontRoutes.home,
        z.object({
          featured: items,
          "new-arrivals": items,
          "best-sellers": items,
          summer: items,
        }),
      );
      return {
        featured: home.featured.map(adaptBackendProduct),
        "new-arrivals": home["new-arrivals"].map(adaptBackendProduct),
        "best-sellers": home["best-sellers"].map(adaptBackendProduct),
        summer: home.summer.map(adaptBackendProduct),
      };
    },
  };
}
export const getCommerceClient = cache(() =>
  createCommerceClient(getCommerceConfig()),
);
export const getHomepageProducts = cache(() => getCommerceClient().home());
export const getProductBySlug = cache((slug: string) =>
  getCommerceClient().getProduct(slug),
);
export const getCategories = cache(() => getCommerceClient().categories());
