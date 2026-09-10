import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/store";
import { OrderStatus } from "@/lib/types";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  const order = store.getOrders().find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  const body = (await req.json()) as { status: OrderStatus };
  const orders = store.getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  orders[idx] = { ...orders[idx], status: body.status };
  store.saveOrders(orders);
  return NextResponse.json(orders[idx]);
}
