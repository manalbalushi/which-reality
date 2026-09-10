import { NextRequest, NextResponse } from "next/server";
import { store, genId } from "@/lib/server/store";
import { CorporateRequest } from "@/lib/types";

export async function GET() {
  const list = store.getCorporateRequests();
  return NextResponse.json([...list].reverse());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Omit<CorporateRequest, "id" | "createdAt" | "status">;

  if (!body.companyName || !body.contactPerson || !body.email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const request: CorporateRequest = {
    ...body,
    id: genId("corp"),
    createdAt: new Date().toISOString(),
    status: "New",
  };

  store.saveCorporateRequests([...store.getCorporateRequests(), request]);
  return NextResponse.json(request, { status: 201 });
}
