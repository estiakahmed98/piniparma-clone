import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adaptBackendProduct,
  availableFromStockLevels,
  canAddVariant,
  selectVariant,
} from "../lib/commerce-adapter";
import { createCommerceClient, CommerceError } from "../lib/commerce-client";
import { getCommerceConfig } from "../lib/commerce-config";
import {
  createCheckoutTransport,
  assertVerifiedMapping,
} from "../lib/commerce-checkout";
import {
  catalogQuerySchema,
  queryFromSearchParams,
} from "../lib/commerce-query";
import { fixtureProduct, fixtureFilters } from "./fixtures/commerce";
import type { CommerceConfig } from "../lib/commerce-config";
const api: CommerceConfig = {
  dataSource: "api",
  baseUrl: "https://storefront.example",
  token: "private-test-token",
  timeoutMs: 1000,
  checkoutEnabled: false,
};

test("schema-compatible adaptation separates ids, prices and authoritative warehouse inventory", () => {
  const p = adaptBackendProduct(fixtureProduct);
  assert.equal(p.id, "fixture-navy-suit");
  assert.equal(p.backendProductId, 41);
  assert.equal(p.price, 21000);
  assert.equal(p.demoStock, null);
  assert.equal(p.images.length, 2, "main image is not duplicated in gallery");
  assert.equal(p.availableStock, 8);
  const variant = selectVariant(p, "48", "Navy")!;
  assert.equal(variant.backendVariantId, 4101);
  assert.equal(variant.price, 22000);
  assert.equal(variant.availableStock, 5);
  assert.equal(canAddVariant(p, variant, 5), true);
  assert.equal(canAddVariant(p, variant, 6), false);
  assert.equal(canAddVariant(p, selectVariant(p, "50", "Navy"), 1), false);
  assert.equal(selectVariant(p, "50", "Black"), undefined);
  assert.equal(
    canAddVariant(
      { ...p, priceSource: "DEMO_ESTIMATE", requiresPriceVerification: true },
      variant,
      1,
    ),
    false,
  );
  assert.equal(
    canAddVariant({ ...p, mappingVerified: false }, variant, 1),
    false,
  );
  assert.equal(availableFromStockLevels([]), null);
  assert.equal(
    availableFromStockLevels([
      { warehouseId: 1, quantity: 2, reserved: 4 },
      { warehouseId: 2, quantity: 5, reserved: 1 },
    ]),
    4,
  );
});
test("invalid currency, unrelated variants, invalid prices and mismatched stock fail closed", () => {
  for (const changes of [
    { currency: "USD" },
    { basePrice: "NaN" },
    { image: "javascript:alert(1)" },
    { variants: [{ ...fixtureProduct.variants[0], productId: 99 }] },
    { variants: [{ ...fixtureProduct.variants[0], availableStock: 99 }] },
  ])
    assert.throws(() => adaptBackendProduct({ ...fixtureProduct, ...changes }));
});
test("API listing forwards filters and private credentials server-side, without a demo fallback", async () => {
  const calls: { url: string; headers: HeadersInit | undefined }[] = [];
  const fetcher = (async (input, init) => {
    calls.push({ url: String(input), headers: init?.headers });
    return Response.json({
      products: [fixtureProduct],
      pagination: { page: 2, limit: 5, total: 6, pages: 2 },
      filters: fixtureFilters,
    });
  }) as typeof fetch;
  const client = createCommerceClient(api, fetcher);
  const page = await client.listProducts({
    category: "suits",
    colors: ["Navy"],
    sizes: ["48"],
    page: 2,
    limit: 5,
    sort: "price-asc",
  });
  assert.equal(page.products[0].dataSource, "api");
  assert.equal(page.products[0].price, 21000);
  const url = new URL(calls[0].url);
  assert.equal(url.searchParams.get("page"), "2");
  assert.equal(url.searchParams.get("sizes"), "48");
  assert.equal(
    new Headers(calls[0].headers).get("Authorization"),
    "Bearer private-test-token",
  );
  for (const fetcher of [
    (async () => new Response("down", { status: 503 })) as typeof fetch,
    (async () => Response.json({ products: [] })) as typeof fetch,
    (async () => {
      throw Error("offline");
    }) as typeof fetch,
  ]) {
    await assert.rejects(
      () => createCommerceClient(api, fetcher).listProducts(),
      CommerceError,
    );
  }
});
test("local mode never fetches a backend and API mode cannot omit private configuration", async () => {
  let calls = 0;
  const client = createCommerceClient(
    { ...api, dataSource: "local" },
    (async () => {
      calls++;
      throw Error("unexpected fetch");
    }) as typeof fetch,
  );
  assert.equal((await client.listProducts()).dataSource, "local");
  assert.equal(calls, 0);
  const previous = {
    source: process.env.COMMERCE_DATA_SOURCE,
    url: process.env.COMMERCE_API_BASE_URL,
  };
  try {
    process.env.COMMERCE_DATA_SOURCE = "api";
    delete process.env.COMMERCE_API_BASE_URL;
    assert.throws(() => getCommerceConfig());
  } finally {
    if (previous.source === undefined) delete process.env.COMMERCE_DATA_SOURCE;
    else process.env.COMMERCE_DATA_SOURCE = previous.source;
    if (previous.url === undefined) delete process.env.COMMERCE_API_BASE_URL;
    else process.env.COMMERCE_API_BASE_URL = previous.url;
  }
});
test("query contract rejects invalid pagination, negative or reversed prices and unknown categories", () => {
  for (const query of [
    { page: 0 },
    { limit: 500 },
    { minPrice: -1 },
    { minPrice: 500, maxPrice: 100 },
    { category: "admin" },
  ])
    assert.equal(catalogQuerySchema.safeParse(query).success, false);
  assert.deepEqual(
    queryFromSearchParams(
      new URLSearchParams("colors=Navy&colors=Black&sizes=48&page=2&limit=5"),
    ).colors,
    ["Navy", "Black"],
  );
});
test("missing versioned endpoints are service errors; explicit missing products are 404s", async () => {
  const unavailable = createCommerceClient(
    api,
    (async () => new Response("Not found", { status: 404 })) as typeof fetch,
  );
  await assert.rejects(
    () => unavailable.getProduct("missing-product"),
    (error) =>
      error instanceof CommerceError && error.code === "ENDPOINT_UNAVAILABLE",
  );
  const notFound = createCommerceClient(api, (async () =>
    Response.json(
      { code: "PRODUCT_NOT_FOUND" },
      { status: 404 },
    )) as typeof fetch);
  assert.equal(await notFound.getProduct("missing-product"), null);
  const mismatch = createCommerceClient(api, (async () =>
    Response.json(fixtureProduct)) as typeof fetch);
  await assert.rejects(() => mismatch.getProduct("another-slug"));
  const product = adaptBackendProduct(fixtureProduct);
  product.variants.push({ ...product.variants[0], backendVariantId: 9999 });
  assert.equal(
    selectVariant(product, "48", "Navy"),
    undefined,
    "ambiguous size/color combinations must not select an arbitrary ID",
  );
});
test("local/unverified/disabled checkout cannot reach an order API or submit browser totals", async () => {
  let mutations = 0;
  const fetcher = (async () => {
    mutations++;
    return Response.json({});
  }) as typeof fetch;
  for (const dataSource of ["local", "api"] as const) {
    const transport = createCheckoutTransport({ ...api, dataSource }, fetcher);
    await assert.rejects(() =>
      transport.syncCart({
        lines: [{ productId: 41, variantId: 4101, quantity: 1 }],
        revision: null,
      }),
    );
    await assert.rejects(() =>
      transport.quoteShipping({
        cartId: "x",
        cartRevision: "r",
        address: {
          country: "BD",
          district: "Dhaka",
          area: "Dhanmondi",
          addressDetails: "Road 1",
        },
      }),
    );
    await assert.rejects(() => transport.createCodOrder({} as never));
  }
  assert.throws(() =>
    assertVerifiedMapping([{ productId: 41, variantId: 4101, quantity: 1 }]),
  );
  assert.equal(mutations, 0);
});
