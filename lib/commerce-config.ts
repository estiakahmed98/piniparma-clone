import "server-only";
import type { DataSource } from "./commerce-types";

export type CommerceConfig = {
  dataSource: DataSource;
  baseUrl: string | null;
  token: string | undefined;
  timeoutMs: number;
  checkoutEnabled: boolean;
};
export function getCommerceConfig(): CommerceConfig {
  const source = process.env.COMMERCE_DATA_SOURCE || "local";
  if (source !== "local" && source !== "api")
    throw new Error("COMMERCE_DATA_SOURCE must be local or api");
  const baseUrl = process.env.COMMERCE_API_BASE_URL || null;
  if (source === "api") {
    if (!baseUrl)
      throw new Error("COMMERCE_API_BASE_URL is required in API mode");
    const url = new URL(baseUrl);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      throw new Error("Invalid commerce backend URL");
    if (
      process.env.NODE_ENV === "production" &&
      url.protocol !== "https:" &&
      !["localhost", "127.0.0.1"].includes(url.hostname)
    )
      throw new Error("The production commerce backend requires HTTPS");
  }
  return {
    dataSource: source,
    baseUrl,
    token: process.env.COMMERCE_API_TOKEN,
    timeoutMs: 10000,
    checkoutEnabled: false,
  };
}

// These are proposed, versioned facade routes. See docs/commerce-integration.md.
// Never point these adapters at privileged admin endpoints.
export const storefrontRoutes = {
  products: "/api/storefront/v1/products",
  categories: "/api/storefront/v1/categories",
  home: "/api/storefront/v1/home",
  filters: "/api/storefront/v1/filters",
  cart: "/api/storefront/v1/cart",
  shipping: "/api/storefront/v1/shipping-quotes",
  orders: "/api/storefront/v1/orders/cod",
} as const;
