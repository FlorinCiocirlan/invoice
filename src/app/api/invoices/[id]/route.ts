import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rows = await sql`
    SELECT i.*, c.name as client_name, c.cui as client_cui, c.reg_com as client_reg_com,
           c.address as client_address, c.city as client_city, c.country as client_country
    FROM invoices i
    LEFT JOIN clients c ON c.id = i.client_id
    WHERE i.id = ${id} AND i.user_id = ${session.user.id}
  `;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${id}`;
  return NextResponse.json({ ...rows[0], items });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await sql`DELETE FROM invoices WHERE id=${id} AND user_id=${session.user.id}`;
  return NextResponse.json({ ok: true });
}
