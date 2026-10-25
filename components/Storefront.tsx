 'use client';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
export function Storefront({children}: {children: React.ReactNode}) {
  const admin = usePathname().startsWith('/admin');
  return admin ? <main>{children}</main> : <><Header/><main>{children}</main><Footer/><CartDrawer/></>;
}
