import { NextRequest, NextResponse } from "next/server";
import { store, genId } from "@/lib/server/store";
import { Order } from "@/lib/types";

export async function GET() {
  const orders = store.getOrders();
  return NextResponse.json([...orders].reverse());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Omit<Order, "id" | "createdAt" | "status">;

  if (!body.customer?.fullName || !body.customer?.mobile || !body.items?.length) {
    return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
  }

  const order: Order = {
    ...body,
    id: genId("ord"),
    createdAt: new Date().toISOString(),
    status: "New",
  };

  const orders = store.getOrders();
  store.saveOrders([...orders, order]);

  return NextResponse.json(order, { status: 201 });
}
