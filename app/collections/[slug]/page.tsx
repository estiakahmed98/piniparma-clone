import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CollectionView } from "@/components/CollectionView";
import { categoryNames, type CollectionPage } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return Object.keys(categoryNames).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: categoryNames[slug as CollectionPage] ?? "Collection" };
}
export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  if (!(slug in categoryNames)) notFound();
  return <CollectionView category={slug as CollectionPage} />;
}
