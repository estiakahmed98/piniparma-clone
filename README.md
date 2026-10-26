# Aura BOED — Premium Front-End Demo

A complete **Next.js App Router + TypeScript** storefront demo. The design follows the visual layout direction shown in the provided Pini Parma screenshots—minimal luxury typography, centered wordmark, wide four-column mega menu, clean product catalog—with **original Aura BOED branding, copy, product records, and self-contained vector placeholders**.

> No backend, database, authentication, payment gateway, or real checkout. The shopping bag and wishlist are demo-only browser state saved in `localStorage`. Do not accept real customer orders with this version.

## Requirements

- Node.js 20.9+ (Node.js 22 LTS recommended)
- npm
- Internet access for the first `npm install`

## Start the website on Windows 11 (PowerShell)

```powershell
cd "C:\YourFolder\Aura-BOED-demo"
npm install
npm run dev
```

Open **http://localhost:3000**

To produce a production build:

```powershell
npm run build
npm run start
```

## Pages included

| URL | What it shows |
| --- | --- |
| `/` | Full landing page: hero, collections, best-sellers, editorial, story, footer |
| `/collections/suits` | Suits collection, horizontal subcategories, 4/2/1 columns, sorting, filters |
| `/collections/jackets` | Jackets collection |
| `/collections/shirts` | Shirts collection |
| `/collections/trousers` | Trousers collection |
| `/collections/knitwear` | Knitwear collection |
| `/collections/shoes` | Shoes collection |
| `/collections/accessories` | Accessories collection |
| `/products/sand-beige-tailored-suit` | Example product page, size selector, quantity, add to bag |

Other product pages work automatically through the product data.

## How to replace images

All current SVG visuals are **original placeholder illustrations, not borrowed product photography**.

1. Put your images in `public/images/`. Recommended format: `.webp` or `.jpg`.
2. In `lib/products.ts`, edit each product's `image` path.
3. Example:

```ts
{
  id: 'BOED-101',
  slug: 'sand-beige-tailored-suit',
  name: 'Sand beige tailored two-piece suit',
  category: 'suits',
  price: 24500,
  color: 'Beige',
  sizes: ['38', '40', '42'],
  season: 'Spring / Summer',
  image: '/images/my-beige-suit.webp',
  description: 'Your product description.'
}
```

Homepage editorial image paths are located in `app/page.tsx`:

- `/images/hero-editorial.svg`: main hero, recommended 1800 x 1050+ landscape
- `/images/story-banner.svg`: editorial banner, recommended 1700 x 650+
- category collection image paths in the `collectionCards` array

Mega-menu promotional image paths and links are in `components/Header.tsx`.

Product photos display with `object-fit: cover`, so use vertically composed photos around a **4:5 ratio** and position the product centrally. Replace the SVG placeholders with your own licensed photography before showing the final commercial site.

If you want to regenerate placeholder SVGs, run:

```powershell
python scripts/generate_placeholders.py
```

> This overwrites the predefined `.svg` placeholders, **not** your custom `.webp` or `.jpg` photos.

## Text, prices, brand & colours

- Product names, prices, sizes, colors, descriptions: `lib/products.ts`
- Header, mega-menu links, language label: `components/Header.tsx`
- Footer and newsletter demo: `components/Footer.tsx`
- Homepage marketing copy and categories: `app/page.tsx`
- Site metadata/title: `app/layout.tsx`
- Typography, colors, spacing, product grid, breakpoints: inline Tailwind classes in `app/` and `components/`; shared tokens in `app/layout.tsx`
- Currency: `formatPrice()` in `lib/products.ts` (currently BDT `৳`)

## Functionality implemented (client-side demo)

- Desktop multi-column mega menu for Clothing, Shoes, Accessories, Gifts
- Responsive mobile menu, search and saved-item overlays
- Account dialog with login, signup and password-reset designs, password visibility, validation, keyboard focus containment and demo submit feedback (no authentication or data storage)
- Product search through predefined sample catalog
- Suits horizontal subcategory filter
- Sort by featured, price ascending/descending, alphabetical
- Filter by color, size, season, numeric price range
- Collection grid size controls
- Product detail pages with selected size, quantity, add to bag
- Wishlist toggle and cart drawer
- LocalStorage persistence for cart and wishlist
- Demo checkout button with a clear no-payment message
- Email sign-up form UI **without storage/sending**
- Semantic labels, escape key handling for header overlays, and reduced motion support

## Demo test cases

1. Open `/`, hover **Clothing**. A wide 4-column menu should appear. Move outside to close it.
2. Click **Suits** and check title, category links, product count, 4-column images.
3. Open **Filter**, select color Grey, then **SHOW PRODUCTS**. The listing should narrow.
4. Sort by **Price: Low to High**, verify prices ascend.
5. Click a product, choose size 42, quantity 2, **ADD TO BAG**. Cart opens with quantity 2.
6. Reload the page. Cart quantity and saved items should remain in that browser.
7. Open search and type **navy**, then click a result.
8. Test around 390px wide (Chrome DevTools) for mobile navigation and 2-column listing.

## Scope note

This is an original **visual demo** based on the supplied reference screens, not a copy of proprietary site scripts or images. Exact photo-level parity requires adding your client's authentic product and editorial photos. No API keys or environment variables required.

## Styling

Tailwind CSS v4 runs through `@tailwindcss/postcss`. All page and component styles live in JSX `className` utilities, including responsive layouts, hover/focus states, pseudo-elements, and dynamic state variants.

`app/tailwind.css` contains only Tailwind imports and the media marquee animation theme. There are no component stylesheets or `@apply` rules. Fonts load from the root layout, which also defines shared design tokens as Tailwind utilities. Preflight is omitted to preserve the storefront's existing browser defaults.
