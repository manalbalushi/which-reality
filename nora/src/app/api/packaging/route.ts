import { NextRequest, NextResponse } from "next/server";
import { store, genId } from "@/lib/server/store";
import { Packaging } from "@/lib/types";

export async function GET() {
  return NextResponse.json(store.getPackaging());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Packaging>;
  if (!body.name?.en) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const list = store.getPackaging();
  const item: Packaging = {
    id: genId("pkg"),
    slug: (body.slug || body.name.en).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: { en: body.name.en, ar: body.name.ar || body.name.en },
    description: { en: body.description?.en || "", ar: body.description?.ar || body.description?.en || "" },
    price: Number(body.price ?? 0),
    swatch: body.swatch || { from: "#f3ece2", to: "#dfc6a6", accent: "#7a5a34", icon: "box" },
  };
  store.savePackaging([...list, item]);
  return NextResponse.json(item, { status: 201 });
}
