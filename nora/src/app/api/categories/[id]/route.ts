import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/store";
import { Category } from "@/lib/types";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/categories/[id]">) {
  const { id } = await ctx.params;
  const body = (await req.json()) as Partial<Category>;
  const list = store.getCategories();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  list[idx] = { ...list[idx], ...body, id };
  store.saveCategories(list);
  return NextResponse.json(list[idx]);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/categories/[id]">) {
  const { id } = await ctx.params;
  store.saveCategories(store.getCategories().filter((c) => c.id !== id));
  return NextResponse.json({ ok: true });
}
