import { NextRequest, NextResponse } from "next/server";
import { store, genId } from "@/lib/server/store";
import { Category } from "@/lib/types";

export async function GET() {
  return NextResponse.json(store.getCategories());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Category>;
  if (!body.name?.en) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const list = store.getCategories();
  const item: Category = {
    id: genId("cat"),
    slug: (body.slug || body.name.en).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: { en: body.name.en, ar: body.name.ar || body.name.en },
    icon: body.icon || "gift",
  };
  store.saveCategories([...list, item]);
  return NextResponse.json(item, { status: 201 });
}
