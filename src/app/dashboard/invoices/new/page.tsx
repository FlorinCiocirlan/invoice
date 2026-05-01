import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import NewInvoiceForm from "@/components/NewInvoiceForm";

export default async function NewInvoicePage() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clients = await sql`SELECT * FROM clients WHERE user_id = ${session!.user!.id} ORDER BY name` as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = await sql`SELECT * FROM users WHERE id = ${session!.user!.id}` as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastInv = await sql`SELECT invoice_number FROM invoices WHERE user_id = ${session!.user!.id} ORDER BY created_at DESC LIMIT 1` as any[];
  let nextNumber = "F 0001";
  if (lastInv[0]) {
    const match = lastInv[0].invoice_number.match(/(\d+)$/);
    if (match) nextNumber = `F ${String(parseInt(match[1]) + 1).padStart(4, "0")}`;
  }
  return <NewInvoiceForm clients={clients} user={users[0]} nextNumber={nextNumber} />;
}
