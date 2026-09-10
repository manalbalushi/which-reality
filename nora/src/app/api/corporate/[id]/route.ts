import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/store";
import { CorporateRequest } from "@/lib/types";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/corporate/[id]">) {
  const { id } = await ctx.params;
  const body = (await req.json()) as { status: CorporateRequest["status"] };
  const list = store.getCorporateRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  list[idx] = { ...list[idx], status: body.status };
  store.saveCorporateRequests(list);
  return NextResponse.json(list[idx]);
}
