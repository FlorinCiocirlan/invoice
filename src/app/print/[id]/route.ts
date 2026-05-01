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
    SELECT i.*, c.name as client_name,
           u.name as user_name,
           u.cui as user_cui,
           u.reg_com as user_reg_com,
           u.address as user_address,
           u.city as user_city,
           u.county as user_county,
           COALESCE(ba.bank_name, default_ba.bank_name) as bank_name,
           COALESCE(ba.iban, default_ba.iban) as iban,
           COALESCE(ba.swift, default_ba.swift) as swift
    FROM invoices i
    LEFT JOIN clients c ON c.id = i.client_id
    LEFT JOIN users u ON u.id = i.user_id
    LEFT JOIN bank_accounts ba ON ba.id = i.bank_account_id
    LEFT JOIN LATERAL (
      SELECT bank_name, iban, swift
      FROM bank_accounts
      WHERE user_id = i.user_id
      ORDER BY is_default DESC
      LIMIT 1
    ) default_ba ON true
    WHERE i.id = ${id} AND i.user_id = ${session.user.id}
  `;

  if (!rows[0]) return new Response("Not found", { status: 404 });

  const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${id}`;
  const inv = { ...rows[0], items };

  const total = items.reduce((s: number, i: any) => s + Number(i.total), 0);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
body { font-family: Arial; padding:40px; }
.header { display:flex; justify-content:space-between; }
.bank { margin-top:20px; padding:10px; border:1px solid #ddd; }
</style>
</head>
<body>
<h1>FACTURA ${inv.invoice_number}</h1>
<div class="bank">
<strong>Cont bancar</strong><br/>
${inv.bank_name || ''}<br/>
${inv.iban || ''}<br/>
${inv.swift || ''}
</div>
</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
