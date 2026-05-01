import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { format } from "date-fns";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rows = await sql`
    SELECT i.*, c.name as client_name, c.cui as client_cui, c.reg_com as client_reg_com,
           c.address as client_address, c.city as client_city, c.country as client_country,
           u.name as user_name, u.cui as user_cui, u.reg_com as user_reg_com,
           u.address as user_address, u.city as user_city, u.county as user_county,
           COALESCE(ba.bank_name, u.bank_name) as bank_name,
           COALESCE(ba.iban, u.iban) as iban,
           u.email_contact
    FROM invoices i
    LEFT JOIN clients c ON c.id = i.client_id
    LEFT JOIN users u ON u.id = i.user_id
    LEFT JOIN LATERAL (
      SELECT bank_name, iban
      FROM bank_accounts
      WHERE user_id = i.user_id
      ORDER BY is_default DESC, created_at ASC
      LIMIT 1
    ) ba ON true
    WHERE i.id = ${id} AND i.user_id = ${session.user.id}
  ` as any[];

  if (!rows[0]) return new Response("Not found", { status: 404 });

  const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${id}` as any[];
  const inv = { ...rows[0], items };

  const total = items.reduce((s: number, i: any) => s + parseFloat(i.total), 0);
  const totalRON = inv.exchange_rate ? total * inv.exchange_rate : null;
  function fmt(n: number) { return n.toLocaleString("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }

  const html = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${inv.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111; background: white; }

    @page { size: A4; margin: 1.5cm; }
    @media print {
      html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-bar { display: none !important; }
    }
    @media screen { body { padding: 40px; max-width: 800px; margin: 0 auto; } }

    .payment { border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 8px; }
    .payment-title { font-size: 10px; font-weight: 700; text-decoration: underline; margin-bottom: 6px; }
    .payment-detail { font-size: 10px; color: #555; font-style: italic; line-height: 1.6; }
  </style>
</head>
<body>
  ${inv.bank_name || inv.iban ? `
    <div class="payment">
      <div class="payment-title">Instructiuni de plata:</div>
      ${inv.bank_name ? `<div class="payment-detail">Banca: ${inv.bank_name}</div>` : ""}
      ${inv.iban ? `<div class="payment-detail">IBAN: ${inv.iban}</div>` : ""}
    </div>
  ` : ""}
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
