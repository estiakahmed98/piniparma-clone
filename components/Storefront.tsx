"use client";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
export function Storefront({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");
  return admin ? (
    <main>{children}</main>
  ) : (
    <div
      className={pathname === "/" ? "storefront storefront-home" : "storefront"}
    >
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
