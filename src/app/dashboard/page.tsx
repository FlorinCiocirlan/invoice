import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, FileText } from "lucide-react";
import InvoiceActions from "@/components/InvoiceActions";

export default async function DashboardPage() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoices = await sql`
    SELECT i.*, c.name as client_name,
      COALESCE((SELECT SUM(total) FROM invoice_items WHERE invoice_id = i.id), 0) as total_amount
    FROM invoices i
    LEFT JOIN clients c ON c.id = i.client_id
    WHERE i.user_id = ${session!.user!.id}
    ORDER BY i.created_at DESC
  ` as any[];

  const total = invoices.reduce((s: number, i: any) => s + parseFloat(i.total_amount), 0);
  const thisMonth = invoices.filter((i: any) => {
    const d = new Date(i.issue_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturi</h1>
          <p className="text-gray-500 text-sm mt-1">{invoices.length} facturi emise</p>
        </div>
        <Link href="/dashboard/invoices/new" className="flex items-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus size={16} />
          Factură nouă
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total facturi</p>
          <p className="text-2xl font-bold mt-1">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Valoare totală</p>
          <p className="text-2xl font-bold mt-1">{total.toFixed(2)} EUR</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Luna aceasta</p>
          <p className="text-2xl font-bold mt-1">{thisMonth}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText size={48} className="mb-4 opacity-30" />
            <p className="font-medium">Nicio factură încă</p>
            <Link href="/dashboard/invoices/new" className="mt-4 text-gray-900 font-medium underline text-sm">Factură nouă →</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Nr.</th>
                <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Emisă</th>
                <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Scadentă</th>
                <th className="text-right p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-right p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4"><span className="font-mono text-sm font-semibold text-gray-900">{inv.invoice_number}</span></td>
                  <td className="p-4 text-sm text-gray-700">{inv.client_name || "—"}</td>
                  <td className="p-4 text-sm text-gray-600">{format(new Date(inv.issue_date), "dd.MM.yyyy")}</td>
                  <td className="p-4 text-sm text-gray-600">{format(new Date(inv.due_date), "dd.MM.yyyy")}</td>
                  <td className="p-4 text-right font-semibold text-sm">{parseFloat(inv.total_amount).toFixed(2)} {inv.currency}</td>
                  <td className="p-4"><InvoiceActions id={inv.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
