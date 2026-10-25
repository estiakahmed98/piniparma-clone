import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/Icons";
import { products } from "@/lib/products";
import { homeImages } from "@/lib/home-images";
import "./home.css";

const categoryTiles = [
  {
    title: "The art of tailoring",
    label: "SUITS",
    href: "/collections/suits",
    image: homeImages.suits,
    span: "wide",
  },
  {
    title: "Small details.",
    label: "ACCESSORIES",
    href: "/collections/accessories",
    image: homeImages.accessories,
    span: "narrow",
  },
  {
    title: "A lighter layer.",
    label: "JACKETS",
    href: "/collections/jackets",
    image: homeImages.jackets,
    span: "third",
  },
  {
    title: "Everyday refinement.",
    label: "SHIRTS",
    href: "/collections/shirts",
    image: homeImages.shirts,
    span: "third",
  },
  {
    title: "Soft by nature.",
    label: "KNITWEAR",
    href: "/collections/knitwear",
    image: homeImages.knitwear,
    span: "third",
  },
  {
    title: "The finishing touch.",
    label: "SHOES",
    href: "/collections/shoes",
    image: homeImages.shoes,
    span: "half",
  },
  {
    title: "Room to move.",
    label: "TROUSERS",
    href: "/collections/trousers",
    image: homeImages.trousers,
    span: "half",
  },
];
const featuredSlugs = [
  "beige-nuvola",
  "light-blue-striped",
  "blue-cotton-knitted-bomber",
  "blue-cotton-and-linen-ribbed-polo",
];
const featuredProducts = featuredSlugs.map(
  (slug, index) =>
    products.find((p) => p.slug.includes(slug)) ||
    products.filter(
      (p) =>
        p.category === ["jackets", "shirts", "knitwear", "knitwear"][index],
    )[0],
);
const media = ["NOBLEMAN", "Forbes", "Esquire", "GQ", "THE RAKE", "VOGUE"];

export default function Home() {
  return (
    <div className="editorial-home">
      <section className="campaign-hero" aria-labelledby="campaign-title">
        <img
          className="campaign-image"
          src={homeImages.hero}
          alt="Italian tailoring, photographed in natural light"
          fetchPriority="high"
        />
        <div className="campaign-shade" />
        <div className="campaign-copy">
          <span className="editorial-kicker">A NEW SEASON OF POSSIBILITY</span>
          <h1 id="campaign-title">
            THE ART OF
            <br />
            DRESSING
            <br />
            <em>WELL.</em>
          </h1>
          <Link
            className="editorial-button button-white"
            href="/collections/suits"
          >
            EXPLORE THE COLLECTION <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        <div className="campaign-footnote">
          <span>AURA BOED / THE NEW COLLECTION</span>
          <a href="#tailoring-edit" aria-label="Scroll to the tailoring edit">
            SCROLL TO DISCOVER <Icon name="chevron-down" size={15} />
          </a>
        </div>
      </section>

      <section
        className="tailoring-edit"
        id="tailoring-edit"
        aria-label="The tailoring edit"
      >
        <div className="sticky-editorial">
          <img
            src={homeImages.tailoring}
            alt="Refined tailoring from the Aura BOED edit"
            loading="lazy"
          />
          <div className="sticky-editorial-copy">
            <span className="editorial-kicker">CONSIDERED IN EVERY DETAIL</span>
            <h2>
              100% Made in Italy
              <br />
              Tailoring
            </h2>
            <Link
              className="editorial-button button-outline"
              href="/collections/suits"
            >
              VIEW ALL SUITS <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </div>
        <div className="tailoring-products">
          {featuredProducts.map(
            (product) =>
              product && <ProductCard key={product.id} product={product} />,
          )}
        </div>
      </section>

      <section
        className="collection-mosaic"
        aria-labelledby="collection-mosaic-title"
      >
        <div className="editorial-section-heading">
          <span className="editorial-kicker">A WARDROBE, WELL CONSIDERED</span>
          <h2 id="collection-mosaic-title">
            Find your everyday extraordinary.
          </h2>
          <p>Timeless pieces. A thousand ways to make them yours.</p>
        </div>
        <div className="mosaic-grid">
          {categoryTiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className={`mosaic-tile mosaic-${tile.span}`}
            >
              <img src={tile.image} alt={tile.title} loading="lazy" />
              <div className="mosaic-caption">
                <span>{tile.label}</span>
                <h3>{tile.title}</h3>
                <span className="mosaic-cta">
                  DISCOVER <Icon name="arrow-right" size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="collection-story" id="our-story">
        <div className="collection-story-image">
          <img
            src={homeImages.story}
            alt="A closer look at the textures of Italian knitwear"
            loading="lazy"
          />
        </div>
        <div className="collection-story-copy">
          <span className="editorial-kicker">THE KNITWEAR COLLECTION</span>
          <h2>
            Exceptional texture.
            <br />
            Effortless character.
          </h2>
          <p>
            Quietly distinctive pieces for the way you live. Explore soft
            knitwear, considered proportions and the easy elegance of a
            well-chosen layer.
          </p>
          <p className="collection-story-detail">
            From fine knits to textured favourites, discover the pieces that
            bring your wardrobe together.
          </p>
          <Link
            href="/collections/knitwear"
            className="editorial-button button-dark-outline"
          >
            DISCOVER THE COLLECTION <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </section>

      <section className="summer-campaign" aria-labelledby="summer-title">
        <img
          src={homeImages.summer}
          alt="Relaxed summer dressing in warm natural light"
          loading="lazy"
        />
        <div className="campaign-shade" />
        <div className="summer-copy">
          <span className="editorial-kicker">LONG DAYS. LIGHTER LAYERS.</span>
          <h2 id="summer-title">
            A slower kind
            <br />
            of summer.
          </h2>
          <p>Linen, cotton and a little room to breathe.</p>
          <Link
            className="editorial-button button-white"
            href="/collections/summer"
          >
            SHOP NOW <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        <span className="summer-caption">
          THE SUMMER COLLECTION / AURA BOED
        </span>
      </section>

      <section className="media-section" aria-labelledby="media-title">
        <h2 className="editorial-kicker" id="media-title">
          STYLE IN THE MEDIA
        </h2>
        <div
          className="media-marquee"
          tabIndex={0}
          aria-label="Media mastheads. Animation pauses on hover or focus."
        >
          <div className="media-track">
            {[0, 1].map((copy) => (
              <div
                className="media-group"
                aria-hidden={copy === 1 || undefined}
                key={copy}
              >
                {media.map((name, index) => (
                  <span
                    key={name}
                    className={`media-wordmark media-wordmark-${index}`}
                  >
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="media-preview-note">
          Media mastheads shown for design preview.
        </p>
      </section>
    </div>
  );
}
