import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import NewInvoiceForm, { type EditableInvoice } from "@/components/NewInvoiceForm";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;
  // DATE columns formatted as YYYY-MM-DD so they bind directly to <input type="date">
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await sql`
    SELECT id, client_id, invoice_number, currency, exchange_rate, notes,
           to_char(issue_date, 'YYYY-MM-DD') as issue_date,
           to_char(due_date, 'YYYY-MM-DD') as due_date
    FROM invoices
    WHERE id = ${id} AND user_id = ${userId}
  ` as any[];
  if (!rows[0]) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${id} ORDER BY id` as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clients = await sql`SELECT * FROM clients WHERE user_id = ${userId} ORDER BY name` as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = await sql`SELECT * FROM users WHERE id = ${userId}` as any[];

  const invoice: EditableInvoice = { ...rows[0], items };
  return <NewInvoiceForm clients={clients} user={users[0]} invoice={invoice} />;
}
