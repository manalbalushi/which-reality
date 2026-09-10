import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/store";
import { Product } from "@/lib/types";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  const { id } = await ctx.params;
  const body = (await req.json()) as Partial<Product>;
  const products = store.getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  products[idx] = { ...products[idx], ...body, id };
  store.saveProducts(products);
  return NextResponse.json(products[idx]);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  const { id } = await ctx.params;
  const products = store.getProducts();
  const next = products.filter((p) => p.id !== id);
  store.saveProducts(next);
  return NextResponse.json({ ok: true });
}
