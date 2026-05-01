import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const invoices = await sql`
    SELECT i.*, c.name as client_name,
      COALESCE((SELECT SUM(total) FROM invoice_items WHERE invoice_id = i.id), 0) as total_amount
    FROM invoices i
    LEFT JOIN clients c ON c.id = i.client_id
    WHERE i.user_id = ${session.user.id}
    ORDER BY i.created_at DESC
  `;
  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { client_id, invoice_number, issue_date, due_date, currency, exchange_rate, notes, items } = body;

  const rows = await sql`
    INSERT INTO invoices (user_id, client_id, invoice_number, issue_date, due_date, currency, exchange_rate, notes, status)
    VALUES (${session.user.id}, ${client_id}, ${invoice_number}, ${issue_date}, ${due_date},
            ${currency || "EUR"}, ${exchange_rate}, ${notes}, 'issued')
    RETURNING *
  `;
  const invoice = rows[0];

  for (const item of items) {
    await sql`
      INSERT INTO invoice_items (invoice_id, description, unit, quantity, unit_price, total)
      VALUES (${invoice.id}, ${item.description}, ${item.unit || "BUC"}, ${item.quantity}, ${item.unit_price}, ${item.total})
    `;
  }

  return NextResponse.json(invoice);
}
