import { NextResponse } from "next/server";
import { getApprovedAdmin } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getApprovedAdmin();
  return NextResponse.json({ authenticated: Boolean(admin), email: admin?.email ?? null });
}
