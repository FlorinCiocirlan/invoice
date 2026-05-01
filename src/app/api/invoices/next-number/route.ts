import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user's series config
  const userRows = await sql`SELECT invoice_series, invoice_start_number FROM users WHERE id = ${session.user.id}`;
  const user = userRows[0];
  const series = user?.invoice_series || "F";
  const startNumber = user?.invoice_start_number || 1;

  // Get last invoice for this user
  const rows = await sql`
    SELECT invoice_number FROM invoices WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC LIMIT 1
  `;

  if (!rows[0]) {
    const number = `${series} ${String(startNumber).padStart(4, "0")}`;
    return NextResponse.json({ number });
  }

  const last = rows[0].invoice_number;
  const match = last.match(/(\d+)$/);
  if (!match) {
    const number = `${series} ${String(startNumber).padStart(4, "0")}`;
    return NextResponse.json({ number });
  }

  const next = parseInt(match[1]) + 1;
  const padded = String(next).padStart(Math.max(4, String(next).length), "0");
  const number = `${series} ${padded}`;
  return NextResponse.json({ number });
}
