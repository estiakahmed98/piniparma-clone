 'use client';
import Link from 'next/link';
import { useState } from 'react';
import { products, categoryNames, type Collection } from '@/lib/products';
import { Icon, type IconName } from './Icons';
const navigation: {label: string; icon: IconName}[] = [
  {label:'Dashboard',icon:'grid-four'}, {label:'Products',icon:'bag'},
  {label:'Orders',icon:'truck'}, {label:'Customers',icon:'user'},
  {label:'Collections',icon:'bookmark'}, {label:'Settings',icon:'sliders'},
];
export function AdminPanel() {
 const [active,setActive] = useState('Dashboard');
 const [query,setQuery] = useState('');
 const pictured = products.filter(p=>p.image).length;
 const categories = Object.entries(categoryNames) as [Collection,string][];
 const selected = products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).slice(0,6);
 return <div className="admin-shell">
  <aside className="admin-sidebar"><Link href="/" className="admin-brand">Aura BOED<small>STORE ADMINISTRATION</small></Link><span className="admin-nav-label">WORKSPACE</span>
   <nav aria-label="Admin navigation">{navigation.map(item=><button key={item.label} aria-current={active === item.label ? 'page' : undefined} onClick={()=>setActive(item.label)}><Icon name={item.icon} size={19}/><span>{item.label}</span>{item.label !== 'Dashboard' && <small>Soon</small>}</button>)}</nav>
   <div className="admin-sidebar-bottom"><div className="admin-preview"><Icon name="shield"/><div>Design preview<small>Admin services coming soon</small></div></div><Link href="/"><Icon name="arrow-left" size={17}/>Back to storefront</Link></div>
  </aside>
  <section className="admin-workspace"><header className="admin-topbar"><span>Workspace <span>/</span> {active}</span><div><span className="admin-preview-pill">PREVIEW</span><span className="admin-avatar">AB</span><b>Store admin</b></div></header>
  <div className="admin-content"><div className="admin-page-title"><div><span className="eyebrow">YOUR STORE AT A GLANCE</span><h1>{active === 'Dashboard' ? 'Store overview' : active}</h1><p>{active === 'Dashboard' ? 'A clearer view of your collection. All in one place.' : 'Everything you need to manage your store, coming soon.'}</p></div><Link href="/" className="admin-view-store">View storefront <Icon name="arrow-right" size={17}/></Link></div>
  {active !== 'Dashboard' ? <div className="admin-coming-soon"><span><Icon name={navigation.find(n=>n.label===active)!.icon} size={32}/></span><p className="eyebrow">ON THE WAY</p><h2>{active} is coming soon.</h2><p>This section is being prepared. Your dashboard is ready to explore.</p><button className="dark-button" onClick={()=>setActive('Dashboard')}>BACK TO DASHBOARD <Icon name="arrow-right" size={17}/></button></div> : <>
   <div className="admin-welcome"><div><span>THE AURA BOED CATALOGUE</span><h2>Your collection, thoughtfully organised.</h2><p>Explore your products and see what is ready for the next chapter.</p></div><Icon name="bag" size={64}/></div>
   <div className="admin-stats">{[{label:'Total products',value:products.length,note:'Imported from your catalogue',icon:'bag'}, {label:'With photography',value:pictured,note:`${products.length-pictured} awaiting images`,icon:'grid-four'}, {label:'Collections',value:categories.length,note:'Storefront categories',icon:'bookmark'}, {label:'Prices pending',value:products.filter(p=>p.price===null).length,note:'Pricing has not been supplied',icon:'sliders'}].map(stat=><article key={stat.label}><div>{stat.label}<Icon name={stat.icon as IconName} size={19}/></div><strong>{stat.value}</strong><small>{stat.note}</small></article>)}</div>
   <div className="admin-dashboard-grid"><section className="admin-card"><div className="admin-card-heading"><div><h2>Product catalogue</h2><p>Your real products and imagery</p></div><label className="admin-search"><Icon name="search" size={17}/><input aria-label="Search catalogue" placeholder="Find a product..." value={query} onChange={e=>setQuery(e.target.value)}/></label></div><div className="admin-table-scroll"><table><thead><tr><th>Product</th><th>Collection</th><th>Status</th></tr></thead><tbody>{selected.map(p=><tr key={p.id}><td><Link href={`/products/${p.slug}`}>{p.image ? <img src={p.image} alt=""/> : <span className="admin-no-image"><Icon name="bag"/></span>}<span>{p.name}</span></Link></td><td>{categoryNames[p.category]}</td><td><span className={`admin-status ${p.image ? '' : 'pending'}`}>{p.image ? 'Image available' : 'Needs image'}</span></td></tr>)}</tbody></table>{!selected.length && <p className="admin-empty">No products match your search.</p>}</div></section>
   <section className="admin-card"><div className="admin-card-heading"><div><h2>Collection breakdown</h2><p>Pieces across your store</p></div></div><div className="admin-collections">{categories.map(([key,label])=>{const count=products.filter(p=>p.category===key).length;return <Link key={key} href={`/collections/${key}`}><div><span>{label}</span><b>{count}</b></div><div className="admin-bar"><span style={{width:`${count/products.length*100}%`}}/></div></Link>;})}</div><p className="admin-catalog-note">Prices, sizes and stock are awaiting confirmation. No sales or customer data is connected.</p></section></div>
   <div className="admin-readiness"><Icon name="shield" size={24}/><div><h3>A little preparation goes a long way.</h3><p>{products.filter(p=>p.needsReview).length} products flagged for review. Confirm photography, pricing and availability before taking orders.</p></div></div>
  </>}
  <footer className="admin-footer">Aura BOED <span>Considered design. Everyday clarity.</span></footer></div></section>
 </div>;
}
