export type Collection =
  | "suits"
  | "jackets"
  | "shirts"
  | "trousers"
  | "knitwear"
  | "shoes"
  | "accessories";
export type CollectionPage = Collection | "summer";
export type DataSource = "local" | "api";
export type SortOrder = "featured" | "price-asc" | "price-desc" | "az";
export type HomepageGroup =
  "featured" | "new-arrivals" | "best-sellers" | "summer";
export type CommerceVariant = {
  backendVariantId: number;
  backendProductId: number;
  sku: string;
  size: string | null;
  color: string | null;
  options: Record<string, string>;
  price: number;
  currency: "BDT";
  availableStock: number | null;
  active: boolean;
  image: string | null;
};
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Collection;
  sourceCategory: string;
  categories: string[];
  sourceUrl: string | null;
  price: number | null;
  compareAt?: number;
  currency: "BDT";
  priceSource: "DEMO_ESTIMATE" | "SOURCE" | "BACKEND";
  requiresPriceVerification: boolean;
  demoStock: number | null;
  availableStock: number | null;
  candidateSizes: string[];
  sizes: string[];
  colors: string[];
  color: string;
  season: string;
  image: string;
  images: string[];
  videos: string[];
  description: string;
  needsReview: boolean;
  featured?: boolean;
  bestSelling?: boolean;
  badge?: string;
  dataSource: DataSource;
  backendProductId: number | null;
  mappingVerified: boolean;
  variants: CommerceVariant[];
  attributes: { name: string; value: string }[];
};
export type CommerceCategory = {
  id: number | null;
  slug: string;
  name: string;
  parentId: number | null;
  parentSlug?: string | null;
  collection: Collection | null;
  image: string | null;
  sourcePath?: string;
};
export type CatalogQuery = {
  category?: CollectionPage;
  q?: string;
  sort?: SortOrder;
  colors?: string[];
  sizes?: string[];
  seasons?: string[];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  ids?: string[];
  group?: HomepageGroup;
};
export type FilterOptions = {
  colors: string[];
  sizes: string[];
  seasons: string[];
  colorCounts: Record<string, number>;
  seasonCounts: Record<string, number>;
  minPrice: number | null;
  maxPrice: number | null;
  total: number;
};
export type ProductPage = {
  products: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
  filters: FilterOptions;
  dataSource: DataSource;
};
export type HomepageProducts = Record<HomepageGroup, Product[]>;
export type StockLevelDTO = {
  warehouseId: number;
  quantity: number;
  reserved: number;
};
export type CategoryDTO = {
  id: number;
  slug: string;
  name: string;
  parentId: number | null;
  collection: Collection | null;
  image: string | null;
};
export type VariantDTO = {
  id: number;
  productId: number;
  sku: string;
  price: string | number;
  currency: "BDT";
  active: boolean;
  options: Record<string, string>;
  colorImage: string | null;
  availableStock: number | null;
  stockLevels?: StockLevelDTO[];
};
export type StorefrontProductDTO = {
  id: number;
  frontendId: string | null;
  slug: string;
  name: string;
  description: string;
  basePrice: string | number;
  originalPrice: string | number | null;
  currency: "BDT";
  image: string | null;
  gallery: string[];
  videoUrl: string | null;
  category: CategoryDTO & { collection: Collection };
  available: boolean;
  featured: boolean;
  bestSelling: boolean;
  mappingVerified: boolean;
  variants: VariantDTO[];
  attributes: { value: string; attribute: { id: number; name: string } }[];
};
export type BackendProductPage = {
  products: StorefrontProductDTO[];
  pagination: ProductPage["pagination"];
  filters: FilterOptions;
};
export type CartLine = {
  isDemo: boolean;
  key: string;
  productId: string;
  productSlug: string;
  backendProductId: number | null;
  backendVariantId: number | null;
  size: string;
  color: string;
  quantity: number;
  dataSource: DataSource;
  product: Product;
};
export type CartMutation = {
  productId: number;
  variantId: number;
  quantity: number;
};
export type CartSyncRequest = {
  lines: CartMutation[];
  revision: string | null;
};
export type ServerCart = {
  id: string;
  revision: string;
  lines: {
    id: string;
    productId: number;
    variantId: number;
    quantity: number;
    unitPrice: string;
    availableStock: number;
  }[];
  currency: "BDT";
  subtotal: string;
};
export type ShippingAddress = {
  country: string;
  district: string;
  area: string;
  addressDetails: string;
};
export type ShippingQuoteRequest = {
  cartId: string;
  cartRevision: string;
  address: ShippingAddress;
};
export type ShippingQuote = {
  id: string;
  cartId: string;
  cartRevision: string;
  amount: string;
  currency: "BDT";
  expiresAt: string;
};
export type CodOrderRequest = {
  cartId: string;
  cartRevision: string;
  shippingQuoteId: string;
  idempotencyKey: string;
  paymentMethod: "CashOnDelivery";
  customer: { name: string; email: string; phone: string };
  address: ShippingAddress;
  termsAccepted: true;
  privacyPolicyAccepted: true;
};
export type OrderReceipt = {
  id: number;
  orderNumber: string;
  currency: "BDT";
  total: string;
  status: string;
};
export interface CheckoutTransport {
  syncCart(request: CartSyncRequest): Promise<ServerCart>;
  quoteShipping(request: ShippingQuoteRequest): Promise<ShippingQuote>;
  createCodOrder(request: CodOrderRequest): Promise<OrderReceipt>;
}
