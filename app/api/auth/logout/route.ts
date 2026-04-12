import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";
import { TENANT_COOKIE_NAME, tenantCookieOptions } from "@/lib/auth/tenant-cookie";

const clear = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 0,
};

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", clear);
  res.cookies.set(TENANT_COOKIE_NAME, "", { ...tenantCookieOptions(0), maxAge: 0 });
  return res;
}
