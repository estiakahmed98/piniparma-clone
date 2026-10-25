'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Icon } from './Icons';

const columns = [
  { title: 'CLOTHING', links: [['Suits','/collections/suits'],['Jackets','/collections/jackets'],['Trousers','/collections/trousers'],['Classic Shirts','/collections/shirts'],['Knitwear','/collections/knitwear']] },
  { title: 'ACCESSORIES', links: [['Footwear','/collections/shoes'],['Ties','/collections/accessories'],['Everyday Essentials','/collections/accessories'],['Gift Ideas','/collections/accessories']] },
  { title: 'CUSTOMER CARE', links: [['Contact Us','mailto:hello@example.com'],['Shipping Information','/#service'],['Returns & Exchanges','/#service'],['Size Guide','/collections/suits']] },
  { title: 'Aura BOED', links: [['Our Story','/#our-story'],['Craft & Philosophy','/#our-story'],['Visit Our Store','/#our-story'],['Shop All','/collections/suits']] }
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [signed, setSigned] = useState(false);
  const submit = (e: FormEvent) => { e.preventDefault(); if (email.includes('@')) { setSigned(true); setEmail(''); } };
  return <footer className="site-footer">
    <div className="service-strip" id="service"><div><Icon name="shield" size={28}/><strong>THOUGHTFUL QUALITY</strong><span>Every detail makes a difference</span></div><div><Icon name="truck" size={30}/><strong>DELIVERY ACROSS BANGLADESH</strong><span>Shipping options at checkout</span></div><div><Icon name="rotate" size={27}/><strong>PERSONAL SERVICE</strong><span>Visit us for a fitting consultation</span></div></div>
    <div className="footer-main">
      <div className="footer-links">{columns.map((column) => <div key={column.title}><h3>{column.title}</h3>{column.links.map(([label,url]) => <Link href={url} key={label}>{label}</Link>)}</div>)}</div>
      <div className="footer-signup"><h3>STAY IN TOUCH WITH Aura BOED</h3><p>Discover new collections, thoughtful details and stories from our studio.</p>{signed ? <p className="signup-success">Thank you! This was a demo sign-up; no email was stored.</p> : <form onSubmit={submit}><input type="email" required placeholder="Email address" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)}/><button aria-label="Subscribe" type="submit"><Icon name="arrow-right" size={23}/></button></form>}<div className="social-links"><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram"/></a><a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Icon name="facebook"/></a></div></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Aura BOED. Demo storefront.</span><span>Designed for a refined shopping experience.</span><span>Bangladesh · BDT ৳</span></div>
  </footer>;
}
