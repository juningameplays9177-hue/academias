import { NextResponse } from "next/server";
import { requireTenantProfessorContext } from "@/lib/tenancy/require-tenant-api";

export async function GET() {
  const ctx = await requireTenantProfessorContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, session, db } = ctx;
  const classes = db.classes.filter(
    (c) => c.academiaId === tenantId && c.professorId === session.sub,
  );
  return NextResponse.json({ classes });
}
