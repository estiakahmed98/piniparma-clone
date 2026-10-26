import "server-only";
import { z } from "zod";
import type {
  CheckoutTransport,
  CodOrderRequest,
  CartMutation,
} from "./commerce-types";
import type { CommerceConfig } from "./commerce-config";
import { storefrontRoutes } from "./commerce-config";
import { CommerceError } from "./commerce-client";
import manifest from "@/data/commerce-import-manifest.json";

const id = z.number().int().positive().safe();
const decimal = z.string().regex(/^\d{1,8}(?:\.\d{1,2})?$/);
const address = z
  .object({
    country: z.string().min(2).max(100),
    district: z.string().min(1).max(100),
    area: z.string().min(1).max(100),
    addressDetails: z.string().min(5).max(500),
  })
  .strict();
const pointer = {
  cartId: z.string().min(1).max(180),
  cartRevision: z.string().min(1).max(180),
};
const cartSchema = z.object({
  id: z.string(),
  revision: z.string(),
  currency: z.literal("BDT"),
  subtotal: decimal,
  lines: z.array(
    z.object({
      id: z.string(),
      productId: id,
      variantId: id,
      quantity: id,
      unitPrice: decimal,
      availableStock: z.number().int().nonnegative(),
    }),
  ),
});
const shippingSchema = z.object({
  id: z.string(),
  cartId: z.string(),
  cartRevision: z.string(),
  amount: decimal,
  currency: z.literal("BDT"),
  expiresAt: z.string().datetime(),
});
const orderSchema = z.object({
  id,
  orderNumber: z.string(),
  currency: z.literal("BDT"),
  total: decimal,
  status: z.string(),
});
const orderRequestSchema = z
  .object({
    ...pointer,
    shippingQuoteId: z.string().min(1),
    idempotencyKey: z.string().min(16).max(180),
    paymentMethod: z.literal("CashOnDelivery"),
    customer: z
      .object({
        name: z.string().min(2).max(120),
        email: z.email(),
        phone: z.string().regex(/^\+?[0-9 -]{8,20}$/),
      })
      .strict(),
    address,
    termsAccepted: z.literal(true),
    privacyPolicyAccepted: z.literal(true),
  })
  .strict();

export function assertVerifiedMapping(lines: CartMutation[]) {
  for (const line of lines) {
    const mapped = manifest.products.find(
      (p) =>
        Number(p.backendProductId) === line.productId &&
        p.mappingStatus === "VERIFIED",
    );
    const variants: { backendVariantId: number }[] =
      mapped?.backendVariants || [];
    if (!mapped || !variants.some((v) => v.backendVariantId === line.variantId))
      throw new CommerceError(
        "UNVERIFIED_MAPPING",
        "Product and variant mappings require verification",
        409,
      );
  }
}
export function createCheckoutTransport(
  config: CommerceConfig,
  fetcher: typeof fetch = fetch,
): CheckoutTransport {
  function guard() {
    if (
      config.dataSource !== "api" ||
      !config.checkoutEnabled ||
      !config.baseUrl
    )
      throw new CommerceError(
        "CHECKOUT_DISABLED",
        "Checkout is disabled until backend mapping and end-to-end verification are complete",
        409,
      );
  }
  async function post<T>(
    path: string,
    body: unknown,
    schema: z.ZodType<T>,
  ): Promise<T> {
    guard();
    const response = await fetcher(new URL(path, config.baseUrl!), {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(config.timeoutMs),
      headers: {
        "Content-Type": "application/json",
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok)
      throw new CommerceError(
        "CHECKOUT_FAILED",
        "The checkout service rejected the request",
        502,
      );
    return schema.parse(await response.json());
  }
  return {
    async syncCart(request) {
      guard();
      const parsed = z
        .object({
          lines: z
            .array(
              z
                .object({
                  productId: id,
                  variantId: id,
                  quantity: id.max(1000),
                })
                .strict(),
            )
            .min(1)
            .max(48),
          revision: z.string().nullable(),
        })
        .strict()
        .parse(request);
      assertVerifiedMapping(parsed.lines);
      return post(storefrontRoutes.cart, parsed, cartSchema);
    },
    async quoteShipping(request) {
      guard();
      const parsed = z
        .object({ ...pointer, address })
        .strict()
        .parse(request);
      return post(storefrontRoutes.shipping, parsed, shippingSchema);
    },
    async createCodOrder(request: CodOrderRequest) {
      guard();
      return post(
        storefrontRoutes.orders,
        orderRequestSchema.parse(request),
        orderSchema,
      );
    },
  };
}
