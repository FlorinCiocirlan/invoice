import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { format } from "date-fns";
import { NextRequest } from "next/server";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function fmt(value: unknown) {
  return Number(value || 0).toLocaleString("ro-RO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function detail(label: string, value: unknown) {
  if (!value) return "";
  return `<p><span>${escapeHtml(label)}:</span> ${escapeHtml(value)}</p>`;
}

export async function GET(
  _request: NextRequest,
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
           u.name as user_name,
           u.cui as user_cui,
           u.reg_com as user_reg_com,
           u.address as user_address,
           u.city as user_city,
           u.county as user_county,
           u.email_contact,
           COALESCE(ba.bank_name, default_ba.bank_name, u.bank_name) as bank_name,
           COALESCE(ba.iban, default_ba.iban, u.iban) as iban,
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
  ` as any[];

  if (!rows[0]) return new Response("Not found", { status: 404 });

  const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${id}` as any[];
  const inv = { ...rows[0], items };

  const total = items.reduce((s: number, i: any) => s + Number(i.total), 0);
  const totalRON = inv.exchange_rate ? total * Number(inv.exchange_rate) : null;
  const issueDate = format(new Date(inv.issue_date), "dd.MM.yyyy");
  const dueDate = format(new Date(inv.due_date), "dd.MM.yyyy");
  const itemRows = items.map((item: any, index: number) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(item.description)}</td>
      <td class="center">${escapeHtml(item.unit)}</td>
      <td class="center">${fmt(item.quantity)}</td>
      <td class="right">${fmt(item.unit_price)}</td>
      <td class="right">${fmt(item.total)}</td>
      <td class="right strong">${fmt(item.total)}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Factura ${escapeHtml(inv.invoice_number)}</title>
<style>
* { box-sizing: border-box; }
body { margin: 0; background: #fff; color: #111827; font-family: Arial, sans-serif; padding: 40px; }
.invoice { max-width: 820px; margin: 0 auto; }
.notice { color: #9ca3af; font-size: 9px; line-height: 1.5; margin-bottom: 24px; }
.top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
h1 { margin: 0; font-size: 30px; letter-spacing: 0; }
.number { margin-top: 4px; color: #2563eb; font-size: 18px; font-weight: 700; }
.dates { display: grid; grid-template-columns: auto auto; gap: 6px 16px; font-size: 13px; text-align: right; }
.muted { color: #6b7280; }
.strong { font-weight: 700; }
.parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 30px; margin-bottom: 28px; }
.section-title { color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 12px; }
.name { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
.details { color: #4b5563; font-size: 12px; line-height: 1.45; }
.details p { margin: 2px 0; }
.details span { color: #374151; font-weight: 600; }
.bank { margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
th { border-bottom: 2px solid #d1d5db; color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 0 8px 9px 0; text-align: left; }
td { border-bottom: 1px solid #f3f4f6; padding: 9px 8px 9px 0; vertical-align: top; }
.center { text-align: center; }
.right { text-align: right; }
.totals { display: flex; justify-content: flex-end; margin-bottom: 24px; }
.totals-box { width: 270px; font-size: 13px; }
.line { display: flex; justify-content: space-between; padding: 7px 0; color: #4b5563; }
.grand { display: flex; justify-content: space-between; margin-top: 4px; padding: 9px 12px; background: #2563eb; color: white; font-weight: 700; }
.ron, .notes { color: #6b7280; font-size: 12px; margin: 0 0 24px; }
.footer { border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 10px; margin-top: 48px; padding-top: 16px; }
@media print {
  body { padding: 0; }
  .invoice { max-width: none; }
}
</style>
</head>
<body>
<main class="invoice">
  <p class="notice">Factura circula fara semnatura si stampila conform legislatiei in vigoare.</p>

  <section class="top">
    <div>
      <h1>FACTURA</h1>
      <div class="number">${escapeHtml(inv.invoice_number)}</div>
    </div>
    <div class="dates">
      <span class="muted">Data emitere:</span><span class="strong">${issueDate}</span>
      <span class="muted">Data scadenta:</span><span class="strong">${dueDate}</span>
    </div>
  </section>

  <section class="parties">
    <div>
      <div class="section-title">Furnizor</div>
      <div class="name">${escapeHtml(inv.user_name)}</div>
      <div class="details">
        ${detail("CUI", inv.user_cui)}
        ${detail("Reg. Com.", inv.user_reg_com)}
        <p><span>Tara:</span> ROMANIA</p>
        ${inv.user_county ? `<p>jud. ${escapeHtml(inv.user_county)}</p>` : ""}
        ${inv.user_city ? `<p>${escapeHtml(inv.user_city)}</p>` : ""}
        ${inv.user_address ? `<p>${escapeHtml(inv.user_address)}</p>` : ""}
        ${inv.email_contact ? `<p>${escapeHtml(inv.email_contact)}</p>` : ""}
        ${(inv.bank_name || inv.iban || inv.swift) ? `
          <div class="bank">
            ${detail("Banca", inv.bank_name)}
            ${detail("IBAN", inv.iban)}
            ${detail("SWIFT", inv.swift)}
          </div>
        ` : ""}
      </div>
    </div>
    <div>
      <div class="section-title">Client</div>
      <div class="name">${escapeHtml(inv.client_name)}</div>
      <div class="details">
        ${detail("CUI", inv.client_cui)}
        ${detail("Reg. Com.", inv.client_reg_com)}
        ${inv.client_country ? `<p>${escapeHtml(inv.client_country)}</p>` : ""}
        ${detail("Localitate", inv.client_city)}
        ${inv.client_address ? `<p>${escapeHtml(inv.client_address)}</p>` : ""}
      </div>
    </div>
  </section>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Articol</th>
        <th class="center">U.M.</th>
        <th class="center">Cant.</th>
        <th class="right">Pret unitar</th>
        <th class="right">Valoare</th>
        <th class="right">TOTAL</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <section class="totals">
    <div class="totals-box">
      <div class="line"><span>Total fara TVA:</span><strong>${fmt(total)} ${escapeHtml(inv.currency)}</strong></div>
      <div class="grand"><span>Total</span><span>${fmt(total)} ${escapeHtml(inv.currency)}</span></div>
    </div>
  </section>

  ${totalRON && inv.exchange_rate ? `<p class="ron">Valori in LEI (curs: ${escapeHtml(inv.exchange_rate)}): VALOARE ${fmt(totalRON)} RON, TVA 0 RON, TOTAL ${fmt(totalRON)} RON</p>` : ""}
  ${inv.notes ? `<p class="notes"><em>${escapeHtml(inv.notes)}</em></p>` : ""}
  <div class="footer">${escapeHtml(inv.invoice_number)} ${fmt(total)} ${escapeHtml(inv.currency)} scadenta la ${dueDate}</div>
</main>
</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
