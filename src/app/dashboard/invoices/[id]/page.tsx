import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import InvoicePrintView from "@/components/InvoicePrintView";

export default async function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await sql`
    SELECT i.*, c.name as client_name, c.cui as client_cui, c.reg_com as client_reg_com,
           c.address as client_address, c.city as client_city, c.country as client_country,
           u.name as user_name, u.cui as user_cui, u.reg_com as user_reg_com,
           u.address as user_address, u.city as user_city, u.county as user_county,
           u.bank_name, u.iban, u.email_contact
    FROM invoices i
    LEFT JOIN clients c ON c.id = i.client_id
    LEFT JOIN users u ON u.id = i.user_id
    WHERE i.id = ${id} AND i.user_id = ${session!.user!.id}
  ` as any[];
  if (!rows[0]) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${id}` as any[];
  const invoice = { ...rows[0], items };
  return <InvoicePrintView invoice={invoice} />;
}
