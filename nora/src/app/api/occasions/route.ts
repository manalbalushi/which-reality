import { NextRequest, NextResponse } from "next/server";
import { store, genId } from "@/lib/server/store";
import { Occasion } from "@/lib/types";

export async function GET() {
  return NextResponse.json(store.getOccasions());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Occasion>;
  if (!body.name?.en) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const list = store.getOccasions();
  const item: Occasion = {
    id: genId("occ"),
    slug: (body.slug || body.name.en).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: { en: body.name.en, ar: body.name.ar || body.name.en },
    blurb: { en: body.blurb?.en || "", ar: body.blurb?.ar || body.blurb?.en || "" },
    swatch: body.swatch || { from: "#f4e7dd", to: "#e8cdb8", accent: "#8a5a3c", icon: "sparkle" },
  };
  store.saveOccasions([...list, item]);
  return NextResponse.json(item, { status: 201 });
}
