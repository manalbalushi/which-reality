import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/store";
import { Occasion } from "@/lib/types";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/occasions/[id]">) {
  const { id } = await ctx.params;
  const body = (await req.json()) as Partial<Occasion>;
  const list = store.getOccasions();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  list[idx] = { ...list[idx], ...body, id };
  store.saveOccasions(list);
  return NextResponse.json(list[idx]);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/occasions/[id]">) {
  const { id } = await ctx.params;
  store.saveOccasions(store.getOccasions().filter((o) => o.id !== id));
  return NextResponse.json({ ok: true });
}
