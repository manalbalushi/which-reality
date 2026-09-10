import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/store";
import { Packaging } from "@/lib/types";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/packaging/[id]">) {
  const { id } = await ctx.params;
  const body = (await req.json()) as Partial<Packaging>;
  const list = store.getPackaging();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  list[idx] = { ...list[idx], ...body, id };
  store.savePackaging(list);
  return NextResponse.json(list[idx]);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/packaging/[id]">) {
  const { id } = await ctx.params;
  store.savePackaging(store.getPackaging().filter((p) => p.id !== id));
  return NextResponse.json({ ok: true });
}
