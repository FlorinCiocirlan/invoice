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
    WHERE i.id = ${id} AND i.user_id = ${session.user.id}
  ` as any[];

  if (!rows[0]) return new Response("Not found", { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    /* Suppress browser-generated date/URL/page number headers and footers */
    @page {
      size: A4;
      margin: 1.5cm;
    }
    @media print {
      html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-bar { display: none !important; }
    }
    @media screen {
      body { padding: 40px; max-width: 800px; margin: 0 auto; }
    }

    .legal { font-size: 8px; color: #999; margin-bottom: 24px; line-height: 1.4; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .title { font-size: 32px; font-weight: bold; letter-spacing: -1px; }
    .series { color: #2563eb; font-size: 18px; font-weight: 600; margin-top: 2px; }
    .dates table { border-collapse: collapse; }
    .dates td { padding: 2px 8px; font-size: 11px; }
    .dates .label { color: #666; }
    .dates .value { font-weight: bold; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb; }
    .party-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 8px; }
    .party-name { font-weight: 700; font-size: 12px; margin-bottom: 6px; line-height: 1.3; }
    .party-detail { font-size: 10px; color: #555; line-height: 1.6; }
    table.items { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
    table.items thead tr { border-bottom: 2px solid #374151; }
    table.items th { text-align: left; padding: 6px 4px; font-size: 9px; text-transform: uppercase; color: #6b7280; font-weight: 600; }
    table.items th.right { text-align: right; }
    table.items th.center { text-align: center; }
    table.items td { padding: 8px 4px; border-bottom: 1px solid #f3f4f6; }
    table.items td.right { text-align: right; }
    table.items td.center { text-align: center; }
    table.items td.muted { color: #9ca3af; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 16px; }
    .totals-box { width: 240px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 11px; color: #555; }
    .total-final { display: flex; justify-content: space-between; padding: 8px 12px; background: #2563eb; color: white; font-weight: 700; font-size: 13px; border-radius: 2px; margin-top: 4px; }
    .ron-equiv { font-size: 10px; color: #6b7280; margin-bottom: 16px; }
    .payment { border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 8px; }
    .payment-title { font-size: 10px; font-weight: 700; text-decoration: underline; margin-bottom: 6px; }
    .payment-detail { font-size: 10px; color: #555; font-style: italic; line-height: 1.6; }
    .notes { font-size: 10px; color: #444; margin-top: 16px; font-style: italic; white-space: pre-line; }
    .doc-footer { margin-top: 48px; padding-top: 8px; border-top: 1px solid #f3f4f6; font-size: 9px; color: #9ca3af; }
    .print-bar { text-align: center; margin-bottom: 24px; }
    .print-btn { background: #111; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="print-btn" onclick="window.print()">&#128438; Printeaza / Salveaza PDF</button>
    <p style="margin-top:10px;font-size:11px;color:#888;">In dialogul de print: <strong>Mai multe setari &rarr; dezactiveaza &ldquo;Anteturi si subsoluri&rdquo;</strong></p>
  </div>
  <p class="legal">Factura circula fara semnatura si stampila cf. art.V, alin (2) din Ordonanta nr.17/2015 si art. 319 alin (29) din Legea nr. 227/2015 privind Codul fiscal.</p>
  <div class="header">
    <div>
      <div class="title">FACTURA</div>
      <div class="series">${inv.invoice_number}</div>
    </div>
    <div class="dates">
      <table><tbody>
        <tr><td class="label">Data emitere:</td><td class="value">${format(new Date(inv.issue_date), "dd.MM.yyyy")}</td></tr>
        <tr><td class="label">Data scadenta</td><td class="value">${format(new Date(inv.due_date), "dd.MM.yyyy")}</td></tr>
      </tbody></table>
    </div>
  </div>
  <div class="parties">
    <div>
      <div class="party-label">Furnizor</div>
      <div class="party-name">${inv.user_name}</div>
      <div class="party-detail">
        ${inv.user_cui ? `<div>CUI: ${inv.user_cui}</div>` : ""}
        ${inv.user_reg_com ? `<div>Reg. Com.: ${inv.user_reg_com}</div>` : ""}
        <div>Tara: ROMANIA</div>
        ${inv.user_county ? `<div>jud. ${inv.user_county}</div>` : ""}
        ${inv.user_address ? `<div>${inv.user_address}</div>` : ""}
        ${inv.bank_name ? `<div style="margin-top:6px">${inv.bank_name}</div>` : ""}
        ${inv.iban ? `<div>${inv.iban}</div>` : ""}
        ${inv.email_contact ? `<div>${inv.email_contact}</div>` : ""}
      </div>
    </div>
    <div>
      <div class="party-label">Client</div>
      <div class="party-name">${inv.client_name}</div>
      <div class="party-detail">
        ${inv.client_cui ? `<div>CUI: ${inv.client_cui}</div>` : ""}
        ${inv.client_reg_com ? `<div>Reg.Com.: ${inv.client_reg_com}</div>` : ""}
        ${inv.client_country ? `<div>${inv.client_country}</div>` : ""}
        ${inv.client_city ? `<div>Localitate: ${inv.client_city}</div>` : ""}
        ${inv.client_address ? `<div>${inv.client_address}</div>` : ""}
      </div>
    </div>
  </div>
  <table class="items">
    <thead><tr>
      <th style="width:24px">#</th>
      <th>Articol</th>
      <th class="center" style="width:60px">U.M.</th>
      <th class="center" style="width:60px">Cant.</th>
      <th class="right" style="width:90px">Pret unitar</th>
      <th class="right" style="width:90px">Valoare</th>
      <th class="right" style="width:90px">TOTAL</th>
    </tr></thead>
    <tbody>
      ${items.map((item: any, i: number) => `
        <tr>
          <td class="muted">${i + 1}</td>
          <td>${item.description}</td>
          <td class="center">${item.unit}</td>
          <td class="center">${Number(item.quantity)}</td>
          <td class="right">${fmt(Number(item.unit_price))}</td>
          <td class="right">${fmt(Number(item.total))}</td>
          <td class="right" style="font-weight:500">${fmt(Number(item.total))}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  <div class="totals">
    <div class="totals-box">
      <div class="total-row"><span>Total fara TVA:</span><span style="font-weight:500">${fmt(total)} ${inv.currency}</span></div>
      <div class="total-final"><span>Total</span><span>${fmt(total)} ${inv.currency}</span></div>
    </div>
  </div>
  ${totalRON && inv.exchange_rate ? `<p class="ron-equiv">Valori in LEI (curs: ${inv.exchange_rate}): VALOARE ${fmt(totalRON)} RON, TVA 0 RON, TOTAL ${fmt(totalRON)} RON</p>` : ""}
  ${inv.bank_name || inv.iban ? `
    <div class="payment">
      <div class="payment-title">Instructiuni de plata:</div>
      ${inv.bank_name ? `<div class="payment-detail">Banca / IBAN: ${inv.bank_name}</div>` : ""}
      ${inv.iban ? `<div class="payment-detail">Banca / IBAN: ${inv.iban}</div>` : ""}
    </div>
  ` : ""}
  ${inv.notes ? `<p class="notes">${inv.notes}</p>` : ""}
  <div class="doc-footer">${inv.invoice_number} ${fmt(total)} ${inv.currency} scadenta la ${format(new Date(inv.due_date), "dd.MM.yyyy")}</div>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
