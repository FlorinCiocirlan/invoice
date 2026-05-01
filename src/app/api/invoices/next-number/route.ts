import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await sql`
    SELECT invoice_number FROM invoices WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC LIMIT 1
  `;
  if (!rows[0]) return NextResponse.json({ number: "F 0001" });
  const last = rows[0].invoice_number;
  const match = last.match(/(\d+)$/);
  if (!match) return NextResponse.json({ number: "F 0001" });
  const next = parseInt(match[1]) + 1;
  const number = `F ${String(next).padStart(4, "0")}`;
  return NextResponse.json({ number });
}
