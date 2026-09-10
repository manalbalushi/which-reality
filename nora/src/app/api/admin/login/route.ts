import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.NORA_ADMIN_PASSWORD || "nora-admin";

export async function POST(req: NextRequest) {
  const { password } = (await req.json()) as { password: string };
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("nora_admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
