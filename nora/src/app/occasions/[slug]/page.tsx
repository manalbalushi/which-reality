import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { occasions } from "@/data/occasions";
import { OccasionDetailClient } from "./occasion-detail-client";

export function generateStaticParams() {
  return occasions.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata(
  props: PageProps<"/occasions/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const occasion = occasions.find((o) => o.slug === slug);
  if (!occasion) return {};
  return {
    title: `${occasion.name.en} Gifts Oman`,
    description: `${occasion.blurb.en} — curated ${occasion.name.en.toLowerCase()} gifts, delivered across Oman by NORA.`,
  };
}

export default async function OccasionDetailPage(props: PageProps<"/occasions/[slug]">) {
  const { slug } = await props.params;
  const occasion = occasions.find((o) => o.slug === slug);
  if (!occasion) notFound();

  return <OccasionDetailClient occasion={occasion} />;
}
