import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { ProductDetailClient } from "./product-detail-client";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/shop/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};
  return {
    title: `${product.name.en} — Gift Delivery Oman`,
    description: product.description.en,
  };
}

export default async function ProductPage(props: PageProps<"/shop/[slug]">) {
  const { slug } = await props.params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
