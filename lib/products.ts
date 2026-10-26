export type { Product, Collection, CollectionPage } from "./commerce-types";
import type { CollectionPage } from "./commerce-types";

export const subcollections = [
  { label: "Business Suits", tag: "All Season" },
  { label: "Classic Tailoring", tag: "All" },
  { label: "Premium Fabrics", tag: "All" },
  { label: "Striped Suits", tag: "Grey" },
  { label: "Eveningwear", tag: "Black" },
  { label: "Beige Suits", tag: "Beige" },
  { label: "Blue Suits", tag: "Navy" },
  { label: "Wedding Suits", tag: "Cream" },
  { label: "Grey Suits", tag: "Grey" },
  { label: "Summer Suits", tag: "Spring / Summer" },
  { label: "Linen Suits", tag: "Spring / Summer" },
];

export const categoryNames: Record<CollectionPage, string> = {
  suits: "Suits",
  jackets: "Jackets",
  shirts: "Shirts",
  trousers: "Trousers",
  knitwear: "Knitwear",
  shoes: "Shoes",
  accessories: "Accessories",
  summer: "The Summer Collection",
};

export const categoryDescription: Record<CollectionPage, string> = {
  suits:
    "Modern tailoring designed to reflect your individuality. Discover refined silhouettes for every occasion.",
  jackets: "Effortless layers, thoughtful details and impeccable balance.",
  shirts: "Essential shirts for confident, considered dressing.",
  trousers: "Relaxed elegance, made for every day.",
  knitwear: "Modern comfort in soft textures and classic tones.",
  shoes: "Finishing touches for a well-appointed wardrobe.",
  accessories: "Small details. Lasting impressions.",
  summer:
    "Linen, cotton and swimwear. An edit of lighter pieces for sun-filled days.",
};

export function formatPrice(n: number | null) {
  return n === null ? "Price on request" : `BDT ${n.toLocaleString("en-BD")}`;
}
