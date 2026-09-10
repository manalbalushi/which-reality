import { NextRequest, NextResponse } from "next/server";
import { store, genId } from "@/lib/server/store";
import { Product } from "@/lib/types";

export async function GET() {
  return NextResponse.json(store.getProducts());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Product>;
  if (!body.name?.en || !body.price) {
    return NextResponse.json({ error: "name and price are required" }, { status: 400 });
  }
  const products = store.getProducts();
  const product: Product = {
    id: genId("p"),
    slug: (body.slug || body.name.en).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: { en: body.name.en, ar: body.name.ar || body.name.en },
    description: { en: body.description?.en || "", ar: body.description?.ar || body.description?.en || "" },
    price: Number(body.price),
    category: body.category || "beauty",
    occasions: body.occasions || [],
    styles: body.styles || [],
    swatch: body.swatch || { from: "#f3ece2", to: "#dfc6a6", accent: "#7a5a34", icon: "gift" },
    stock: Number(body.stock ?? 0),
    featured: !!body.featured,
  };
  store.saveProducts([...products, product]);
  return NextResponse.json(product, { status: 201 });
}
