import type { CartLine, Product } from "./commerce-types";

export type DemoSelection = { size?: string; color?: string };
export function canAddDemoProduct(
  product: Product,
  quantity: number,
  selection: DemoSelection = {},
) {
  return (
    product.dataSource === "local" &&
    product.backendProductId === null &&
    product.price !== null &&
    Number.isFinite(product.price) &&
    product.price > 0 &&
    Number.isSafeInteger(quantity) &&
    quantity > 0 &&
    product.demoStock !== null &&
    quantity <= product.demoStock &&
    (!selection.size ||
      [...product.sizes, ...product.candidateSizes].includes(selection.size)) &&
    (!selection.color ||
      product.colors.includes(selection.color) ||
      selection.color === product.color)
  );
}
export function createDemoCartLine(
  product: Product,
  quantity: number,
  selection: DemoSelection = {},
): CartLine | null {
  if (!canAddDemoProduct(product, quantity, selection)) return null;
  const size = selection.size || "Size to confirm";
  const color = selection.color || product.color;
  return {
    key: `demo:${JSON.stringify([product.id, size, color])}`,
    isDemo: true,
    productId: product.id,
    productSlug: product.slug,
    backendProductId: null,
    backendVariantId: null,
    size,
    color,
    quantity,
    dataSource: "local",
    product,
  };
}
export function cartLineUnitPrice(line: CartLine): number | null {
  return line.isDemo && line.dataSource === "local"
    ? line.product.price
    : (line.product.variants.find(
        (v) => v.backendVariantId === line.backendVariantId,
      )?.price ?? null);
}
export function canUpdateCartLine(line: CartLine, quantity: number) {
  return line.isDemo
    ? canAddDemoProduct(line.product, quantity, {
        size: line.size === "Size to confirm" ? undefined : line.size,
        color: line.color,
      })
    : false;
}
export function demoDeliveryFee(region: string) {
  return region === "Dhaka" ? 80 : 150;
}
