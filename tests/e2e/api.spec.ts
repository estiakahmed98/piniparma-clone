import { test, expect } from "@playwright/test";

test("API mode delegates filtering and pagination without exposing credentials", async ({
  page,
  request,
}) => {
  await page.goto("/collections/suits", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".product-card")).toHaveCount(24);
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  await page
    .locator(".filter-colors")
    .getByLabel("Black", { exact: true })
    .check();
  await page.locator(".filter-sizes").getByLabel("48", { exact: true }).check();
  await page
    .locator(".filter-drawer")
    .getByRole("button", { name: "Close filters" })
    .click();
  await expect(page.locator(".filter-chips")).toContainText("Black");
  await page.getByRole("button", { name: "NEXT", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
  const status = await request.get("http://127.0.0.1:3120/__fixture/status");
  const { requests } = await status.json();
  expect(
    requests.some(
      (r: { query: string }) =>
        r.query.includes("colors=Black") &&
        r.query.includes("sizes=48") &&
        r.query.includes("page=2"),
    ),
  ).toBe(true);
  expect(requests.every((r: { authorized: boolean }) => r.authorized)).toBe(
    true,
  );
  expect(await page.content()).not.toContain("fixture-private-token");
  expect(await page.content()).not.toContain("DEMO ESTIMATE");
});

test("exact Size + Color variants drive price, stock, persisted cart and blocked checkout", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/products/fixture-navy-suit", {
    waitUntil: "networkidle",
  });
  await expect(page.locator(".detail-price")).toHaveCount(1);
  await page
    .locator(".detail-sizes")
    .getByRole("button", { name: "48", exact: true })
    .click();
  await expect(page.locator(".detail-price")).toContainText("22,000");
  await expect(
    page
      .locator(".detail-sizes")
      .getByRole("button", { name: "50", exact: true }),
  ).toBeDisabled();
  await page
    .locator(".detail-color")
    .getByRole("button", { name: "Black", exact: true })
    .click();
  await page
    .locator(".detail-sizes")
    .getByRole("button", { name: "48", exact: true })
    .click();
  await expect(page.locator(".detail-price")).toContainText("23,000");
  await page
    .locator(".detail-color")
    .getByRole("button", { name: "Navy", exact: true })
    .click();
  await page
    .locator(".detail-sizes")
    .getByRole("button", { name: "48", exact: true })
    .click();
  await page.locator(".add-bag").click();
  await expect(
    page.getByRole("dialog", { name: "Shopping bag" }),
  ).toBeVisible();
  await expect(page.locator(".drawer-item-info")).toContainText("22,000");
  for (let n = 0; n < 6; n++)
    await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.locator(".qty-controls strong")).toHaveText("5");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("aura-commerce-cart-v2") || "[]")[0]
            ?.backendVariantId,
      ),
    )
    .toBe(4101);
  const persisted = await page.evaluate(
    () => JSON.parse(localStorage.getItem("aura-commerce-cart-v2") || "[]")[0],
  );
  expect(persisted).not.toHaveProperty("price");
  expect(persisted).not.toHaveProperty("product");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(".cart-count")).toHaveText("5");
  await page.locator(".cart-button").click();
  await page.getByRole("button", { name: /CHECKOUT/ }).click();
  await expect(
    page.getByRole("heading", { name: "Checkout is not available yet" }),
  ).toBeVisible();
  expect(
    (
      await request.post("/api/commerce/checkout", { data: persisted })
    ).status(),
  ).toBe(409);
  expect(errors).toEqual([]);
});

test("a failed backend never falls back to local prices, stock or records", async ({
  page,
  request,
}) => {
  await request.get("http://127.0.0.1:3120/__fixture/fail?enabled=true");
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", {
        name: "The collection is temporarily unavailable.",
      }),
    ).toBeVisible();
    await expect(page.locator(".product-card")).toHaveCount(0);
    const response = await request.get("/api/commerce/products?category=suits");
    expect(response.status()).toBe(503);
    expect(await response.json()).not.toHaveProperty("products");
  } finally {
    await request.get("http://127.0.0.1:3120/__fixture/fail?enabled=false");
  }
});
