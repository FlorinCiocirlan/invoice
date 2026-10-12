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
  const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${id} ORDER BY id`;
  return NextResponse.json({ ...rows[0], items });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const userId = session.user.id;
  const { client_id, invoice_number, issue_date, due_date, currency, exchange_rate, notes, items } = await req.json();

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Factura trebuie să aibă cel puțin o linie" }, { status: 400 });
  }

  const owned = await sql`SELECT id FROM invoices WHERE id = ${id} AND user_id = ${userId}`;
  if (!owned[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (client_id) {
    const client = await sql`SELECT id FROM clients WHERE id = ${client_id} AND user_id = ${userId}`;
    if (!client[0]) return NextResponse.json({ error: "Client invalid" }, { status: 400 });
  }

  // Header update + full replace of line items in one transaction, so a failed
  // insert never leaves the invoice with partial or missing lines.
  const [updated] = await sql.transaction([
    sql`
      UPDATE invoices SET
        client_id = ${client_id}, invoice_number = ${invoice_number},
        issue_date = ${issue_date}, due_date = ${due_date},
        currency = ${currency || "EUR"}, exchange_rate = ${exchange_rate}, notes = ${notes}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `,
    sql`DELETE FROM invoice_items WHERE invoice_id = ${id}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...items.map((item: any) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      const total = Math.round(quantity * unitPrice * 100) / 100;
      return sql`
        INSERT INTO invoice_items (invoice_id, description, unit, quantity, unit_price, total)
        VALUES (${id}, ${item.description}, ${item.unit || "BUC"}, ${quantity}, ${unitPrice}, ${total})
      `;
    }),
  ]);

  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await sql`DELETE FROM invoices WHERE id=${id} AND user_id=${session.user.id}`;
  return NextResponse.json({ ok: true });
}
