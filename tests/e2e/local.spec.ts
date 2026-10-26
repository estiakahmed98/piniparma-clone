import { test, expect } from "@playwright/test";
import catalog from "../../public/boed_static_public/products.json";

test("local product can complete the demo bag, delivery and review flow without sending an order", async ({
  page,
}) => {
  const mutations: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      /checkout|orders/.test(new URL(request.url()).pathname)
    )
      mutations.push(request.url());
  });
  const product = catalog.products.find(
    (p) => p.slug === "beige-nuvola-jacket-made-in-italy",
  )!;
  await page.goto(`/products/${product.slug}`, { waitUntil: "networkidle" });
  await expect(page.locator(".add-bag")).toBeEnabled();
  await page
    .locator(".detail-sizes")
    .getByRole("button", { name: "48", exact: true })
    .click();
  await page.locator(".add-bag").click();
  await expect(
    page.getByRole("dialog", { name: "Shopping bag" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Increase quantity", exact: true })
    .click();
  await expect(page.locator(".qty-controls strong")).toHaveText("2");
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator(".cart-count")).toHaveText("2");
  await page.locator(".cart-button").click();
  await expect(page.locator(".drawer-item-info")).toContainText("48");
  await page
    .getByRole("button", { name: "PROCEED TO CHECKOUT", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Delivery details" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "REVIEW CHECKOUT" }).click();
  await expect(
    page.getByRole("heading", { name: "Delivery details" }),
  ).toBeVisible();
  await page.getByLabel("Full name *", { exact: true }).fill("Demo Customer");
  await page.getByLabel("Phone number *", { exact: true }).fill("01700000000");
  await page
    .getByLabel("Street address *", { exact: true })
    .fill("Demo Road 1, House 2");
  await page.getByLabel("District / City *", { exact: true }).fill("Dhaka");
  await page.getByRole("button", { name: "REVIEW CHECKOUT" }).click();
  await expect(
    page.getByRole("heading", { name: "Review your details" }),
  ).toBeVisible();
  await expect(page.locator("aside dl")).toContainText(
    (product.price * 2 + 80).toLocaleString("en-BD"),
  );
  await page.getByRole("button", { name: "Edit delivery details" }).click();
  await expect(page.getByLabel("Full name *", { exact: true })).toHaveValue(
    "Demo Customer",
  );
  await page.getByRole("button", { name: "REVIEW CHECKOUT" }).click();
  await page.getByRole("button", { name: "COMPLETE DEMO CHECKOUT" }).click();
  await expect(
    page.getByRole("heading", { name: "Demo checkout complete" }),
  ).toBeVisible();
  await expect(
    page.getByText("Your checkout preview is complete.", { exact: false }),
  ).toContainText("No real order has been placed");
  await expect(page.locator(".cart-count")).toHaveText("0");
  expect(mutations).toEqual([]);
});

test("homepage media, navigation and responsive geometry retain their design", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/", { waitUntil: "networkidle" });
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
  ).toBe(mobile ? 6 : 12);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const heroSource = await page.locator('.campaign-image').evaluate((image: HTMLImageElement) => decodeURI(image.currentSrc));
  expect(heroSource).toContain(mobile ? 'Coastal Stone Terrace Elegance 2.png' : 'Coastal Stone Terrace Elegance.png');
  const rows = await page.locator('.mosaic-tile').evaluateAll(tiles => tiles.map(tile => {const box = tile.getBoundingClientRect();return {top:box.top,width:box.width,left:box.left,right:box.right};}));
  for (const index of [3,4]) {
    expect(Math.abs(rows[index].top - rows[2].top)).toBeLessThan(1);
    expect(Math.abs(rows[index].width - rows[2].width)).toBeLessThan(1);
  }
  expect(Math.abs(rows[0].top - rows[1].top)).toBeLessThan(1);
  expect(Math.abs(rows[5].top - rows[6].top)).toBeLessThan(1);
  if(mobile) expect(rows[2].width).toBeLessThan(page.viewportSize()!.width / 3 + 1);
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
  await expect(page.locator(".add-bag")).toBeEnabled();
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
