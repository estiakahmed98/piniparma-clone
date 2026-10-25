import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { productBySlug, products } from '@/lib/products';
import { ProductView } from '@/components/ProductView';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return products.map(({slug}) => ({slug})); }
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params;
  const product = productBySlug(slug);
  return { title: product?.name ?? 'Product', description: product?.description };
}
export default async function ProductPage({params}: Props) {
  const {slug} = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  return <ProductView product={product}/>;
}
