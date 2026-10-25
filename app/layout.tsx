import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/components/StoreProvider';
import { Storefront } from '@/components/Storefront';



export const metadata: Metadata = {
  icons: {
    icon: { url: '/favicon.png', type: 'image/png' },
    shortcut: '/favicon.png',
  },
  title: { default: 'Aura BOED | Modern Tailoring & Contemporary Essentials', template: '%s | Aura BOED' },
  description: 'An elegant showcase storefront for Aura BOED: modern tailoring, contemporary essentials, and considered style.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Browser extensions can add attributes to <html> before React hydrates.
  // Keep suppression at this element so mismatches inside the app stay visible.
  return <html lang="en" suppressHydrationWarning><body><StoreProvider><Storefront>{children}</Storefront></StoreProvider></body></html>;
}
