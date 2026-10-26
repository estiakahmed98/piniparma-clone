# AURA BOED commerce integration readiness

This branch prepares the frontend and contracts. **A live General E-commerce backend is not connected.** The production database, catalogue import, versioned facade and real order flow still require integration. Browser API tests use the explicit fixture in `tests/mock-storefront.ts`.

## Catalogue delivery

| Check | Result |
| --- | ---: |
| Original records | 503 |
| Prepared records | 503 |
| Previously exposed by the image-only frontend | 338 |
| Generated demo prices | 503 |
| Generated demo stock quantities | 503 |
| Generated descriptions awaiting review | 503 |
| Products with unverified sizes | 503 |
| Missing-image products retained with placeholders | 165 |
| Missing paths among existing media | 0 |
| Duplicate gallery arrays | 0 |
| Source-category anomalies requiring review | 24 |
| Products with unresolved details | 503 |
| Verified backend mappings | 0 |

`reports/catalog-validation.json` lists the issues for every record. Its counts describe the complete prepared catalogue, rather than just changes in the most recent run. Product IDs, slugs, names, original categories/hierarchy, main images, galleries, videos, source URLs and existing metadata remain intact. `data/commerce-import-manifest.json` stores immutable source fingerprints and full original-record hashes; tests verify identity and media preservation. The pipeline fails if IDs/slugs collide, protected fields change, existing official prices/stock are invalid, or product count changes unexpectedly.

Run `npm run catalog:prepare`. Generation is deterministic: stock is `20 + SHA256(slug).readUInt32BE(0) % 81`. Prices use configurable category bands and, where appropriate, product-name subtypes from `config/catalog-preparation.json`. Existing official prices and stock are preserved; generated demo estimates can be regenerated from those rules. No FX conversion or official supplier price claim is made. Names and categories supply only editorial descriptions; no extra fabric percentages, care claims or origin claims are invented.

`config/category-overrides.json` flags anomalous Gloves/Homewear source assignments. These affect only the normalized frontend collection and candidate sizes; the raw category hierarchy is preserved. For example, a loafer filed under Homewear appears in Shoes, while a suit hanger is priced as an accessory rather than a suit. Each override requires importer review.

`priceSource: "DEMO_ESTIMATE"`, `requiresPriceVerification`, `stockSource: "DEMO_ESTIMATE"`, `requiresStockVerification`, `descriptionSource`, and `requiresDescriptionReview` identify generated values. `candidateSizes` are review suggestions, never `sizes` or sellable variants. All current confirmed `sizes` and `variants` remain empty. Demo stock is exposed separately from `availableStock`; local available inventory is unknown. Consequently, local product detail pages cannot add invented fashion options to a bag or place an order. Cards label prices DEMO; details explain the estimate.

## Run modes and private configuration

Copy `.env.example` to `.env.local` and run `npm run dev`.

```dotenv
COMMERCE_DATA_SOURCE=local
```

Local mode reads the prepared JSON on the server, with no backend dependency. Listing/filtering/search/pagination use the same frontend BFF as API mode. Full catalogue data is no longer imported into client components. Only a page of products and small curated header previews are serialized.

```dotenv
COMMERCE_DATA_SOURCE=api
COMMERCE_API_BASE_URL=https://your-commerce-origin.example
COMMERCE_API_TOKEN=your-private-storefront-service-token
```

`COMMERCE_API_BASE_URL` is an origin; versioned endpoint paths are in `lib/commerce-config.ts`. Both origin and token are server-only. No `NEXT_PUBLIC_` credential or admin credential is used. The same production build supports either runtime mode because catalogue pages are dynamically server-rendered. Invalid configuration fails explicitly. API errors, missing endpoints, incompatible contracts and non-BDT prices never fall back to local records, prices or stock.

Homepage merchandising lives in `config/merchandising.json` for local mode; API mode requests the same featured/new-arrivals/best-sellers/summer groups from the backend facade. Best-seller selections in local mode are curated demo selections, not claims about sales history. Existing hero/editorial images, story video, navigation markup, ratios, typography, responsive classes and scroll animations are retained.

Browser requests are restricted to `/api/commerce/products`, `/api/commerce/categories` and `/api/commerce/filters`. These frontend routes validate queries and forward to a fixed backend origin. Upstream responses are runtime-validated with Zod. The BFF never accepts a target backend URL from the browser. Product errors use the existing design language; homepage/catalogue error states contain no substitute demo products.

## Actual backend audit

Inspected the local `general_ecommerce/prisma/schema.prisma` and relevant route implementations at reference commit `6cbda049631a04f99caa71196f6125857b4dcf1b`. Schema SHA256 is `1445ff0b94846468f482e5a60b31ce26b2f2b972cbf97f3dc5a7c0e78c3bc718`. All 12 relevant models match the user-supplied Prisma attachment. Exact field summaries and hashes are in `reports/backend-schema-audit.json`.

| Frontend concept | Actual Prisma source / adapter rule |
| --- | --- |
| Frontend record key | Original string `id`, separate from database IDs; stable `aura-boed:<id>` import key |
| Product database ID | `Product.id: Int`; `backendProductId` is nullable until verified |
| SEO route | `Product.slug`; importer/facade must retain the original frontend slug |
| Category hierarchy | `Category.id`, `slug`, `parentId`; manifest source paths retain the original hierarchy |
| Product price | `Product.basePrice: Decimal(10,2)` and optional `originalPrice`; currency must be explicitly BDT |
| Variant identity/price | `ProductVariant.id`, `productId`, `price`, `currency`, `active`, `sku` |
| Size + Color | `ProductVariant.options: Json`; `ProductVariantOption` and `ProductVariantOptionValue` define option sets |
| Main/gallery/video | `Product.image`, `gallery: String[]`, `videoUrl`; all original source videos remain in JSON/manifest even though the backend has one video field |
| Attributes | `ProductAttribute.value` plus `Attribute.name`; no unrelated backend modules are projected |
| Available inventory | Sum `max(0, StockLevel.quantity - StockLevel.reserved)` per warehouse; absent StockLevels mean unknown inventory |
| Legacy stock | `ProductVariant.stock` is not accepted as an authoritative warehouse fallback |
| Cart identity | `CartItem.productId`, `variantId`, `quantity`; frontend persistence keeps exact numeric variant IDs |

The existing backend has a public `GET /api/products?view=storefront` projection, so `/api/products` is not presumed private or presumed a suitable paginated public endpoint. Its admin paginated branch is access-controlled; the storefront branch currently fetches the catalogue with its existing projection and does not implement this frontend's filter/page contract. Public categories use `GET /api/categories?view=storefront`; dynamic facets use `GET /api/storefront/catalog-facets`. Existing `GET/POST /api/cart` requires an authenticated user. Legacy `POST /api/shipping/quote` accepts a subtotal from its input; the proposed facade instead quotes an authoritative server cart. `POST /api/orders` already implements `CashOnDelivery`, legal-consent checks, backend price calculation and warehouse inventory logic. Reuse that business logic; do not duplicate it in this frontend.

**The following versioned routes are proposed and are not present in the audited backend.** An implementation must project only storefront fields, enforce active/non-deleted products and categories, calculate effective variant prices and stock, and preserve import mappings. No backend source or database was modified in this phase.

## Exact integration contract

Canonical request/response types are in `lib/commerce-types.ts`; runtime catalogue schemas are in `lib/commerce-adapter.ts`, and query validation is in `lib/commerce-query.ts`.

| Backend facade endpoint | Request | Response |
| --- | --- | --- |
| `GET /api/storefront/v1/products` | `CatalogQuery` query parameters | `BackendProductPage` |
| `GET /api/storefront/v1/products/:slug` | Original SEO slug | `StorefrontProductDTO`; missing product: 404 with `{ "code": "PRODUCT_NOT_FOUND" }` |
| `GET /api/storefront/v1/categories` | None | `CategoryDTO[]` including parent IDs and normalized collection mapping |
| `GET /api/storefront/v1/home` | None | `{ featured, "new-arrivals", "best-sellers", summer }`, each a `StorefrontProductDTO[]` |
| `GET /api/storefront/v1/filters` | Optional `category` | `FilterOptions` |
| `POST /api/storefront/v1/cart` | `CartSyncRequest` | `ServerCart` |
| `POST /api/storefront/v1/shipping-quotes` | `ShippingQuoteRequest` | `ShippingQuote` with expiry and cart revision |
| `POST /api/storefront/v1/orders/cod` | `CodOrderRequest` | `OrderReceipt` |

Example catalogue request:

```http
GET /api/storefront/v1/products?category=suits&colors=Navy&sizes=48&sort=price-asc&page=1&limit=24
```

Other query keys: `q`, `minPrice`, `maxPrice`, `seasons`, repeated `ids` (stable frontend record IDs), `group`. Sort values: `featured`, `price-asc`, `price-desc`, `az`. Groups: `featured`, `new-arrivals`, `best-sellers`, `summer`. Pagination starts at 1 and has maximum page size 48. Filters contain **confirmed** size/color values and category-level counts, rather than review candidates. The backend must filter and paginate before returning products; the frontend does not download and filter a complete API catalogue.

Product projection example (see `tests/fixtures/commerce.ts` for a complete executable example):

```json
{
  "id": 41,
  "frontendId": "original-aura-product-id",
  "slug": "original-aura-product-slug",
  "name": "Navy Suit",
  "description": "Reviewed description",
  "basePrice": "21000.00",
  "originalPrice": null,
  "currency": "BDT",
  "image": "/media/suit.webp",
  "gallery": ["/media/suit.webp"],
  "videoUrl": null,
  "category": { "id": 7, "slug": "suits", "name": "Suits", "parentId": null, "collection": "suits", "image": null },
  "available": true,
  "featured": true,
  "bestSelling": false,
  "mappingVerified": true,
  "variants": [{ "id": 4101, "productId": 41, "sku": "NAVY-48", "price": "22000.00", "currency": "BDT", "active": true, "options": { "Size": "48", "Color": "Navy" }, "colorImage": null, "availableStock": 5 }],
  "attributes": []
}
```

`mappingVerified` must come from a verified import registry on the backend. It cannot be inferred from a matching slug or supplied by a browser. If returning raw StockLevels to the server adapter, include `warehouseId`, `quantity`, `reserved` and a consistent availableStock projection; warehouse details are not serialized to the browser. Duplicate IDs/slugs, another product's variant, inconsistent inventory and ambiguous Size+Color combinations fail closed. Selecting a confirmed size/color changes the exact selected variant, price and stock. Unavailable combinations are disabled.

## Import mapping and checkout boundary

Fill `backendProductId`, `backendCategoryId`, `backendVariants` and `mappingStatus: "VERIFIED"` in the manifest **after** an audited import. Each backendVariants entry must contain the exact `backendVariantId` and verified option values. Import currency must be BDT; the backend's default USD must not silently relabel a value. Use a backend import registry keyed by `importKey`; do not coerce frontend IDs into integers.

`lib/commerce-checkout.ts` prepares typed server-only cart/shipping/COD transports. Real checkout is deliberately disabled in `getCommerceConfig`, and `POST /api/commerce/checkout` always returns 409 `CHECKOUT_DISABLED` without an upstream call. Local data cannot enable checkout. The shopping bag navigates to `/checkout`, which explains the preview status. No live order is created by this branch.

The future cart request contains only `{ productId, variantId, quantity }` lines and a server revision. Guest persistence stores IDs/quantities only, never trusted prices, totals or product snapshots. On restore it fetches current catalogue data, resolves exact variants and rejects unknown/unavailable lines. Legacy textual-size demo carts are not promoted into verified variant carts. Bag calculations are display estimates; the server must recalculate at synchronization and checkout. A future guest-cart facade needs an opaque signed HttpOnly cart/session cookie, CSRF protection, rate limiting, stock revalidation/reservations, and atomic revision checks.

Shipping uses `{ cartId, cartRevision, address }`; no browser subtotal is accepted by the proposed contract. COD requests contain a server cart/quote reference, idempotency key, customer/address, `paymentMethod: "CashOnDelivery"`, and explicit terms/privacy consent. Order totals, product prices and inventory reservations stay in General E-commerce. Revalidate ownership, mappings, quote expiry, cart revision and inventory transactionally before placing an order.

## Validation and remaining blockers

```sh
npm run catalog:prepare
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The preparation phase must pass catalogue JSON schema/integrity checks, adapter contract tests, and local/API-fixture browser tests. Playwright runs desktop (1440px) and mobile (390px) scenarios against a production build. It checks retained homepage media/layout, scroll-triggered video, search, filtered listings, pagination, missing-image details, exact variant prices/stock, guest-cart persistence and the checkout block. API fixtures also verify private-token isolation, query forwarding and absence of demo fallback during an outage. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` optionally selects an existing Chromium/Chrome executable. These are contract and UI checks, **not live backend/database end-to-end tests or an approved pixel-perfect screenshot baseline**.

Before live connection: implement/review the versioned backend facade; import and verify all product/category/variant IDs; verify all demo prices/descriptions and the 165 missing image records; confirm sizes and warehouse inventory; resolve the 24 category anomalies; implement the guest-cart ownership boundary and COD facade around existing business logic; then run real database-backed checkout/reservation/shipping/idempotency tests. Real order creation and payment settings stay disabled until that review passes. No Admin, SCM, Investor or Business Network integrations were added.

See `reports/test-results.json` for the final verification record and `reports/changed-files.txt` for the exact delivery file list.
