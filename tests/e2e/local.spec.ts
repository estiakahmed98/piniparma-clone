import { test, expect } from "@playwright/test";
import catalog from "../../public/boed_static_public/products.json";

test("homepage media, navigation and responsive geometry retain their design", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".editorial-home")).toHaveCount(1);
  await expect(page.locator(".editorial-home")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
  await expect(page.locator(".tailoring-products .product-card")).toHaveCount(
    4,
  );
  await expect(page.locator("[data-story-video]")).not.toHaveAttribute("src");
  const mobile = page.viewportSize()!.width < 700;
  expect(
    await page
      .locator(".mosaic-grid")
      .evaluate(
        (e) => getComputedStyle(e).gridTemplateColumns.split(" ").length,
      ),
  ).toBe(mobile ? 2 : 12);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.locator("[data-story-video]").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator("[data-story-video]")
        .evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0.1),
    )
    .toBe(true);
  await page.screenshot({ path: testInfo.outputPath("story.png") });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect
    .poll(() =>
      page
        .locator("[data-story-video]")
        .evaluate((v: HTMLVideoElement) => v.paused),
    )
    .toBe(true);
  if (mobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
  } else {
    await page.getByRole("link", { name: "Clothing", exact: true }).hover();
    await expect(page.locator(".mega-menu")).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("server filtering, pagination, search and every product detail remain accessible", async ({
  page,
  request,
}) => {
  const initial = await request.get(
    "/api/commerce/products?category=trousers&limit=24",
  );
  const total = (await initial.json()).pagination.total;
  await page.goto("/collections/trousers", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".product-card")).toHaveCount(24);
  const responsePromise = page.waitForResponse(
    (r) =>
      r.url().includes("/api/commerce/products?") &&
      r.url().includes("sort=price-asc"),
  );
  await page.selectOption("#collection-sort", "price-asc");
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  const data = await response.json();
  expect(
    data.products.every(
      (p: { price: number }, i: number, a: { price: number }[]) =>
        i === 0 || a[i - 1].price <= p.price,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "NEXT", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Collection pages" }),
  ).toContainText("Page 2");
  await expect(page.locator(".product-card")).toHaveCount(
    Math.min(24, total - 24),
  );
  await page
    .getByRole("button", { name: "Search products", exact: true })
    .click();
  await page
    .getByPlaceholder("Search for a product or collection...")
    .fill("navy");
  await expect(page.locator(".search-results a").first()).toBeVisible();
  const product = catalog.products[0];
  await page.goto(`/products/${product.slug}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator(".product-detail h1")).toHaveText(product.name);
  await expect(page.locator(".gallery-image-button").first()).toBeVisible();
  await expect(page.locator(".product-detail")).toContainText(
    "Demo price estimate",
  );
  await expect(page.locator(".add-bag")).toBeDisabled();
  await page.goto(
    "/products/beige-and-light-grey-fancy-pocket-square-made-in-italy",
    { waitUntil: "domcontentloaded" },
  );
  await expect(
    page.getByRole("heading", { name: "Nothing here, yet." }),
  ).toBeVisible();
  const denied = await request.post("/api/commerce/checkout", {
    data: { total: 1, price: 1, variantId: 1 },
  });
  expect(denied.status()).toBe(409);
  const all = await request.get("/api/commerce/products?limit=48");
  expect((await all.json()).pagination.total).toBe(catalog.total);
});
