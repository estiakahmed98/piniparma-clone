import { z } from "zod";
import type {
  Product,
  StorefrontProductDTO,
  StockLevelDTO,
  CommerceVariant,
} from "./commerce-types";

const intId = z.number().int().positive().safe();
const money = z.union([
  z.number().finite().nonnegative().max(99999999.99),
  z.string().regex(/^\d{1,8}(?:\.\d{1,2})?$/),
]);
const media = z
  .string()
  .refine(
    (value) =>
      (value.startsWith("/") && !value.startsWith("//")) ||
      /^https?:\/\//i.test(value),
    "Unsupported media URL",
  );
const category = z.object({
  id: intId,
  slug: z.string().min(1),
  name: z.string().min(1),
  parentId: intId.nullable(),
  collection: z
    .enum([
      "suits",
      "jackets",
      "shirts",
      "trousers",
      "knitwear",
      "shoes",
      "accessories",
    ])
    .nullable(),
  image: media.nullable(),
});
export const categorySchema = category;
const stockLevel = z.object({
  warehouseId: intId,
  quantity: z.number().int().nonnegative(),
  reserved: z.number().int().nonnegative(),
});
export const productDtoSchema = z.object({
  id: intId,
  frontendId: z.string().min(1).nullable(),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  name: z.string().min(1),
  description: z.string(),
  basePrice: money,
  originalPrice: money.nullable(),
  currency: z.literal("BDT"),
  image: media.nullable(),
  gallery: z.array(media),
  videoUrl: media.nullable(),
  category: category.extend({
    collection: z.enum([
      "suits",
      "jackets",
      "shirts",
      "trousers",
      "knitwear",
      "shoes",
      "accessories",
    ]),
  }),
  available: z.boolean(),
  featured: z.boolean(),
  bestSelling: z.boolean(),
  mappingVerified: z.boolean(),
  variants: z.array(
    z.object({
      id: intId,
      productId: intId,
      sku: z.string().min(1),
      price: money,
      currency: z.literal("BDT"),
      active: z.boolean(),
      options: z.record(z.string(), z.string()),
      colorImage: media.nullable(),
      availableStock: z.number().int().nonnegative().nullable(),
      stockLevels: z.array(stockLevel).optional(),
    }),
  ),
  attributes: z.array(
    z.object({
      value: z.string(),
      attribute: z.object({ id: intId, name: z.string() }),
    }),
  ),
});
export const filterOptionsSchema = z.object({
  colors: z.array(z.string()),
  sizes: z.array(z.string()),
  seasons: z.array(z.string()),
  colorCounts: z.record(z.string(), z.number().int().nonnegative()),
  seasonCounts: z.record(z.string(), z.number().int().nonnegative()),
  minPrice: z.number().finite().nonnegative().nullable(),
  maxPrice: z.number().finite().nonnegative().nullable(),
  total: z.number().int().nonnegative(),
});
export const backendPageSchema = z.object({
  products: z.array(productDtoSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive().max(48),
    total: z.number().int().nonnegative(),
    pages: z.number().int().nonnegative(),
  }),
  filters: filterOptionsSchema,
});

export function availableFromStockLevels(
  levels: StockLevelDTO[],
): number | null {
  if (!levels.length) return null;
  if (new Set(levels.map((level) => level.warehouseId)).size !== levels.length)
    throw new Error("Duplicate warehouse stock projection");
  return levels.reduce(
    (sum, level) => sum + Math.max(0, level.quantity - level.reserved),
    0,
  );
}
function option(options: Record<string, string>, name: string) {
  return (
    Object.entries(options).find(([key]) => key.toLowerCase() === name)?.[1] ||
    null
  );
}
export function adaptBackendProduct(
  input: StorefrontProductDTO | unknown,
): Product {
  const p = productDtoSchema.parse(input);
  if (new Set(p.variants.map((v) => v.id)).size !== p.variants.length)
    throw new Error("Duplicate backend variant ID");
  const variants: CommerceVariant[] = p.variants.map((v) => {
    if (v.productId !== p.id)
      throw new Error("Variant belongs to another product");
    const stock = v.stockLevels
      ? availableFromStockLevels(v.stockLevels)
      : v.availableStock;
    if (
      v.stockLevels &&
      v.availableStock !== null &&
      stock !== v.availableStock
    )
      throw new Error("Inconsistent inventory projection");
    return {
      backendVariantId: v.id,
      backendProductId: p.id,
      sku: v.sku,
      size: option(v.options, "size"),
      color: option(v.options, "color"),
      options: v.options,
      price: Number(v.price),
      currency: "BDT",
      availableStock: stock,
      active: p.available && v.active,
      image: v.colorImage,
    };
  });
  const sizes = [
    ...new Set(variants.filter((v) => v.active && v.size).map((v) => v.size!)),
  ];
  const colors = [
    ...new Set(
      variants.filter((v) => v.active && v.color).map((v) => v.color!),
    ),
  ];
  const attr = (name: string) =>
    p.attributes.find((a) => a.attribute.name.toLowerCase() === name)?.value;
  const active = variants.filter((v) => v.active);
  const availableStock =
    active.length && active.every((v) => v.availableStock !== null)
      ? active.reduce((sum, v) => sum + v.availableStock!, 0)
      : null;
  return {
    id: p.frontendId || `backend:${p.id}`,
    slug: p.slug,
    name: p.name,
    category: p.category.collection,
    sourceCategory: p.category.name,
    categories: [p.category.name],
    sourceUrl: null,
    price: Number(p.basePrice),
    compareAt: p.originalPrice === null ? undefined : Number(p.originalPrice),
    currency: "BDT",
    priceSource: "BACKEND",
    requiresPriceVerification: false,
    demoStock: null,
    availableStock,
    sizes,
    candidateSizes: [],
    colors,
    color: colors[0] || attr("color") || "Not specified",
    season: attr("season") || "Not specified",
    image: p.image || p.gallery[0] || "",
    images: [...new Set([...(p.image ? [p.image] : []), ...p.gallery])],
    videos: p.videoUrl ? [p.videoUrl] : [],
    description: p.description,
    needsReview: !p.mappingVerified,
    featured: p.featured,
    bestSelling: p.bestSelling,
    dataSource: "api",
    backendProductId: p.id,
    mappingVerified: p.mappingVerified,
    variants,
    attributes: p.attributes.map((a) => ({
      name: a.attribute.name,
      value: a.value,
    })),
  };
}
export function selectVariant(
  product: Product,
  size: string,
  color: string,
): CommerceVariant | undefined {
  const matches = product.variants.filter(
    (v) =>
      v.active &&
      (v.size === null || v.size === size) &&
      (v.color === null || v.color === color),
  );
  return matches.length === 1 ? matches[0] : undefined;
}
export function canAddVariant(
  product: Product,
  variant: CommerceVariant | undefined,
  quantity: number,
): boolean {
  return (
    product.dataSource === "api" &&
    product.priceSource === "BACKEND" &&
    !product.requiresPriceVerification &&
    product.mappingVerified &&
    !!variant &&
    variant.active &&
    variant.backendProductId === product.backendProductId &&
    product.variants.some((v) => v === variant) &&
    selectVariant(product, variant.size || "", variant.color || "")
      ?.backendVariantId === variant.backendVariantId &&
    Number.isInteger(quantity) &&
    quantity > 0 &&
    variant.availableStock !== null &&
    quantity <= variant.availableStock
  );
}
