import "server-only";
import { getCommerceClient, getHomepageProducts } from "./commerce-client";
import type { Product, Collection } from "./commerce-types";

export async function getCommerceShell() {
  const client = getCommerceClient();
  try {
    const [home, categories] = await Promise.all([
      getHomepageProducts(),
      client.categories(),
    ]);
    // Only curated previews reach the browser; never serialize the full catalogue.
    const products: Product[] = [
      ...new Map(
        Object.values(home)
          .flat()
          .map((p) => [p.id, p]),
      ).values(),
    ];
    const collectionImages = {} as Record<Collection, string>;
    const collections: Collection[] = [
      "suits",
      "jackets",
      "shirts",
      "trousers",
      "knitwear",
      "shoes",
      "accessories",
    ];
    await Promise.all(
      collections.map(async (category) => {
        const page = await client.listProducts({ category, limit: 1 });
        const preview = page.products[0];
        if (preview && !products.some((p) => p.id === preview.id))
          products.push(preview);
        collectionImages[category] =
          categories.find((c) => c.collection === category && c.image)?.image ||
          preview?.image ||
          "";
      }),
    );
    return {
      products,
      categories,
      collectionImages,
      dataSource: client.source,
      catalogueError: false,
    };
  } catch {
    return {
      products: [],
      categories: [],
      collectionImages: {} as Record<Collection, string>,
      dataSource: client.source,
      catalogueError: true,
    };
  }
}
