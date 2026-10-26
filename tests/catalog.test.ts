import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { execFileSync } from "node:child_process";
import Ajv from "ajv";
import catalog from "../public/boed_static_public/products.json";
import manifest from "../data/commerce-import-manifest.json";
import schema from "../data/products.schema.json";
import config from "../config/catalog-preparation.json";
import {
  localProducts,
  localList,
  localHome,
  collectionFor,
} from "../lib/commerce-local";

test("all 503 records satisfy JSON schema, unique identities and immutable source fingerprints", () => {
  const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
  assert.equal(validate(catalog), true, JSON.stringify(validate.errors));
  assert.equal(catalog.products.length, manifest.originalCount);
  assert.equal(localProducts.length, 503);
  assert.equal(new Set(catalog.products.map((p) => p.id)).size, 503);
  assert.equal(new Set(catalog.products.map((p) => p.slug)).size, 503);
  for (const product of catalog.products) {
    const entry = manifest.products.find((p) => p.frontendId === product.id)!;
    const record = product as unknown as Record<string, unknown>;
    const identity = Object.fromEntries(
      manifest.protectedFields.map((key) => [key, record[key]]),
    );
    assert.equal(
      crypto
        .createHash("sha256")
        .update(JSON.stringify(identity))
        .digest("hex"),
      entry.identitySha256,
      product.slug,
    );
    assert.equal(
      collectionFor(product.category, product.slug),
      entry.collection,
    );
    for (const file of [...product.images, ...product.videos])
      assert.equal(
        fs.existsSync(
          path.join(process.cwd(), "public/boed_static_public", file),
        ),
        true,
        file,
      );
  }
});
test("demo stock is seeded by slug and prices stay inside configurable bands", () => {
  for (const p of catalog.products) {
    const seed = crypto
      .createHash("sha256")
      .update(p.slug)
      .digest()
      .readUInt32BE(0);
    assert.equal(p.stock, 20 + (seed % 81));
    const band = config.priceBands.find((b) => b.name === p.demoPriceBand)!;
    assert.ok(p.price >= band.min && p.price <= band.max, p.slug);
    assert.equal(p.requiresPriceVerification, true);
    assert.equal(p.requiresStockVerification, true);
    assert.deepEqual(p.sizes, []);
    assert.equal(p.requiresSizeVerification, true);
    assert.equal(p.requiresDescriptionReview, true);
    assert.equal(
      localProducts.find((item) => item.id === p.id)!.variants.length,
      0,
    );
    assert.equal(
      localProducts.find((item) => item.id === p.id)!.availableStock,
      null,
    );
  }
});
test("re-running preparation is idempotent and never changes the original mapping fingerprints", () => {
  const files = [
    "public/boed_static_public/products.json",
    "data/commerce-import-manifest.json",
    "reports/catalog-validation.json",
  ];
  const hashes = files.map((file) =>
    crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
  );
  execFileSync(process.execPath, ["scripts/prepare-catalog.cjs"]);
  assert.deepEqual(
    files.map((file) =>
      crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
    ),
    hashes,
  );
});
test("category/search/price/color filters, sorting and disjoint pagination operate over every record", () => {
  const first = localList({
    category: "trousers",
    sort: "price-asc",
    limit: 10,
  });
  const second = localList({
    category: "trousers",
    sort: "price-asc",
    limit: 10,
    page: 2,
  });
  assert.ok(first.pagination.total > 10);
  assert.equal(
    first.products.some((p) =>
      second.products.some((other) => other.id === p.id),
    ),
    false,
  );
  assert.ok(
    first.products.every((p, i, a) => i === 0 || a[i - 1].price! <= p.price!),
  );
  const filtered = localList({
    q: "blue",
    colors: ["Blue"],
    minPrice: 4500,
    maxPrice: 20000,
    limit: 48,
  });
  assert.ok(filtered.products.length > 0);
  assert.ok(
    filtered.products.every(
      (p) => p.color === "Blue" && p.price! >= 4500 && p.price! <= 20000,
    ),
  );
  const alphabetical = localList({ sort: "az", limit: 48 });
  assert.ok(
    alphabetical.products.every(
      (p, i, a) => i === 0 || a[i - 1].name.localeCompare(p.name) <= 0,
    ),
  );
  assert.equal(
    localList({ sizes: ["48"] }).pagination.total,
    0,
    "candidate sizes never become sellable sizes",
  );
  assert.equal(localHome().featured.length, 4);
  assert.ok(
    localProducts.some((p) => !p.image),
    "missing images retain product records",
  );
});
