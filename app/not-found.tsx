import Link from 'next/link';
export default function NotFound() { return <div className="notfound"><span className="eyebrow">404 / PAGE NOT FOUND</span><h1>Nothing here, yet.</h1><p>The collection you are looking for may have moved.</p><Link className="dark-button" href="/">RETURN TO HOMEPAGE</Link></div>; }
