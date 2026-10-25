import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { Icon } from '@/components/Icons';
import { products } from '@/lib/products';

const collectionCards = [
  { title: 'THE SUIT EDIT', subtitle: 'Elegance, considered', href: '/collections/suits', image: '/images/suit-grey.svg' },
  { title: 'RELAXED JACKETS', subtitle: 'Modern layers', href: '/collections/jackets', image: '/images/suit-beige.svg' },
  { title: 'SHIRTS & ESSENTIALS', subtitle: 'Everyday refinement', href: '/collections/shirts', image: '/images/shirt-blue.svg' },
  { title: 'FOOTWEAR', subtitle: 'The finishing detail', href: '/collections/shoes', image: '/images/shoes-brown.svg' },
];

export default function Home() {
  return <>
    <section className="home-hero">
      <img src="/images/hero-editorial.svg" alt="Original illustration of Aura BOED tailored looks; replace with brand campaign photography" className="home-hero-image"/>
      <div className="home-hero-content"><span className="eyebrow light-eyebrow">A NEW PERSPECTIVE ON STYLE</span><h1>Quiet confidence.<br/><em>Lasting elegance.</em></h1><p>Introducing the Aura BOED collection. Tailoring and essentials for the moments that matter.</p><Link href="/collections/suits" className="outline-light-button">DISCOVER THE COLLECTION <Icon name="arrow-right" size={17}/></Link></div>
      <span className="hero-caption">Aura BOED / NEW SEASON EDITORIAL</span>
    </section>

    <section className="intro-copy"><span className="eyebrow">THE ART OF DRESSING WELL</span><h2>Designed for the way you live.</h2><p>Considered fabrics, modern silhouettes and effortless versatility. Discover pieces made to feel distinctly yours.</p></section>

    <section className="category-section section-gutter"><div className="section-heading"><div><span className="eyebrow">THE EDIT</span><h2>Explore our collections</h2></div><Link href="/collections/suits" className="text-link">VIEW ALL COLLECTIONS <Icon name="arrow-right" size={18}/></Link></div>
      <div className="category-grid">{collectionCards.map((card) => <Link href={card.href} className="category-tile" key={card.title}><div className="category-image"><img src={card.image} alt=""/></div><div className="category-text"><span>{card.subtitle}</span><h3>{card.title}</h3><span className="category-arrow"><Icon name="arrow-right" size={20}/></span></div></Link>)}</div>
    </section>

    <section className="featured-section section-gutter"><div className="section-heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>Best-selling essentials</h2></div><Link href="/collections/suits" className="text-link">DISCOVER MORE <Icon name="arrow-right" size={18}/></Link></div><div className="home-product-grid">{products.filter((p) => ['BOED-101','BOED-102','BOED-103','BOED-104'].includes(p.id)).map((p) => <ProductCard key={p.id} product={p}/>)}</div></section>

    <section className="story-banner" id="our-story"><img src="/images/story-banner.svg" alt="Abstract Aura BOED tailoring campaign illustration"/><div className="story-content"><span className="eyebrow light-eyebrow">THE Aura BOED PHILOSOPHY</span><h2>The details<br/>define us.</h2><p>We believe good design needs no introduction. Thoughtful proportions, quiet textures, and the freedom to be yourself.</p><Link href="/collections/suits" className="outline-light-button">EXPLORE OUR STORY <Icon name="arrow-right" size={17}/></Link></div></section>

    <section className="editorial-section section-gutter"><div className="editorial-visual"><img src="/images/suit-cream.svg" alt="Cream suit illustration placeholder"/></div><div className="editorial-copy"><span className="eyebrow">REFINED BY DESIGN</span><h2>For every moment<br/>worth dressing for.</h2><p>From workday confidence to weekend occasions, each piece reflects a contemporary approach to classic tailoring. Discover the versatility of a well-chosen wardrobe.</p><Link href="/collections/suits" className="underlined-link">EXPLORE TAILORING <Icon name="arrow-right" size={18}/></Link></div></section>
  </>;
}
