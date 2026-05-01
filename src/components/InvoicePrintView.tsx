"use client";
import { format } from "date-fns";
import { ArrowLeft, Printer, Copy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface InvoiceItem { description: string; unit: string; quantity: number; unit_price: number; total: number }
interface Invoice {
  id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  currency: string;
  exchange_rate?: number;
  notes?: string;
  client_id: number;
  client_name: string;
  client_cui?: string;
  client_reg_com?: string;
  client_address?: string;
  client_city?: string;
  client_country?: string;
  user_name: string;
  user_cui?: string;
  user_reg_com?: string;
  user_address?: string;
  user_city?: string;
  user_county?: string;
  bank_name?: string;
  iban?: string;
  email_contact?: string;
  items: InvoiceItem[];
}

function fmt(n: number) { return n.toLocaleString("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }

export default function InvoicePrintView({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const total = invoice.items.reduce((s, i) => s + Number(i.total), 0);
  const totalRON = invoice.exchange_rate ? total * invoice.exchange_rate : null;

  async function handleDuplicate() {
    const nextRes = await fetch("/api/invoices/next-number");
    const { number } = await nextRes.json();
    const today = new Date().toISOString().split("T")[0];
    const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    const cleanItems = invoice.items.map((item) => ({
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
    }));
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: invoice.client_id,
        invoice_number: number,
        issue_date: today,
        due_date: due,
        currency: invoice.currency,
        exchange_rate: invoice.exchange_rate,
        notes: invoice.notes,
        items: cleanItems,
      }),
    });
    const data = await res.json();
    if (res.ok) router.push(`/dashboard/invoices/${data.id}`);
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 no-print">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">{invoice.invoice_number}</h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            <Copy size={15} />
            Duplică
          </button>
          <button
            onClick={() => window.open(`/print/${invoice.id}`, '_blank')}
            className="flex items-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
          >
            <Printer size={15} />
            Printează / PDF
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 max-w-3xl mx-auto p-10">
        <p className="text-[9px] text-gray-400 mb-6 leading-relaxed">
          Factura circula fara semnatura si stampila cf. art.V, alin (2) din Ordonanta nr.17/2015 si art. 319 alin (29) din Legea nr. 227/2015 privind Codul fiscal.
        </p>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">FACTURA</h1>
            <p className="text-blue-600 font-semibold text-lg mt-0.5">{invoice.invoice_number}</p>
          </div>
          <div className="text-right text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-gray-500">Data emitere:</span>
              <span className="font-semibold">{format(new Date(invoice.issue_date), "dd.MM.yyyy")}</span>
              <span className="text-gray-500">Data scadenta</span>
              <span className="font-semibold">{format(new Date(invoice.due_date), "dd.MM.yyyy")}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Furnizor</p>
            <p className="font-bold text-gray-900 text-sm leading-snug mb-2">{invoice.user_name}</p>
            <div className="text-xs text-gray-600 space-y-0.5">
              {invoice.user_cui && <p>CUI: {invoice.user_cui}</p>}
              {invoice.user_reg_com && <p>Reg. Com.: {invoice.user_reg_com}</p>}
              <p>Tara: ROMANIA</p>
              {invoice.user_county && <p>jud. {invoice.user_county}</p>}
              {invoice.user_address && <p>{invoice.user_address}</p>}
              {invoice.bank_name && <p className="mt-1">{invoice.bank_name}</p>}
              {invoice.iban && <p>{invoice.iban}</p>}
              {invoice.email_contact && <p>{invoice.email_contact}</p>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Client</p>
            <p className="font-bold text-gray-900 text-sm leading-snug mb-2">{invoice.client_name}</p>
            <div className="text-xs text-gray-600 space-y-0.5">
              {invoice.client_cui && <p>CUI: {invoice.client_cui}</p>}
              {invoice.client_reg_com && <p>Reg.Com.: {invoice.client_reg_com}</p>}
              {invoice.client_country && <p>{invoice.client_country}</p>}
              {invoice.client_city && <p>Localitate: {invoice.client_city}</p>}
              {invoice.client_address && <p>{invoice.client_address}</p>}
            </div>
          </div>
        </div>
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase">#</th>
              <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase">Articol</th>
              <th className="text-center pb-2 text-xs font-semibold text-gray-500 uppercase">U.M.</th>
              <th className="text-center pb-2 text-xs font-semibold text-gray-500 uppercase">Cant.</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase">Pret unitar</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase">Valoare</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 pr-3 text-gray-400">{i + 1}</td>
                <td className="py-2 pr-3">{item.description}</td>
                <td className="py-2 text-center text-gray-600">{item.unit}</td>
                <td className="py-2 text-center">{Number(item.quantity)}</td>
                <td className="py-2 text-right">{fmt(Number(item.unit_price))}</td>
                <td className="py-2 text-right">{fmt(Number(item.total))}</td>
                <td className="py-2 text-right font-medium">{fmt(Number(item.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-1.5 text-sm text-gray-600">
              <span>Total fara TVA:</span>
              <span className="font-medium">{fmt(total)} {invoice.currency}</span>
            </div>
            <div className="flex justify-between py-2 bg-blue-600 text-white px-3 rounded-sm mt-1">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{fmt(total)} {invoice.currency}</span>
            </div>
          </div>
        </div>
        {totalRON && invoice.exchange_rate && (
          <p className="text-xs text-gray-500 mb-6">
            Valori in LEI (curs: {invoice.exchange_rate}): VALOARE {fmt(totalRON)} RON, TVA 0 RON, TOTAL {fmt(totalRON)} RON
          </p>
        )}
        {(invoice.bank_name || invoice.iban) && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-semibold underline mb-2">Instructiuni de plata:</p>
            {invoice.bank_name && <p className="text-xs italic text-gray-700">Banca / IBAN: {invoice.bank_name}</p>}
            {invoice.iban && <p className="text-xs italic text-gray-700">Banca / IBAN: {invoice.iban}</p>}
          </div>
        )}
        {invoice.notes && (
          <p className="text-xs text-gray-600 mt-4 italic">{invoice.notes}</p>
        )}
        <div className="mt-12 pt-4 border-t border-gray-100 flex justify-between text-[10px] text-gray-400">
          <span>{invoice.invoice_number} {fmt(total)} {invoice.currency} scadenta la {format(new Date(invoice.due_date), "dd.MM.yyyy")}</span>
        </div>
      </div>
    </div>
  );
}
