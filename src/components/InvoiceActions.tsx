"use client";
import { useRouter } from "next/navigation";
import { Eye, Copy, Trash2 } from "lucide-react";

export default function InvoiceActions({ id }: { id: number }) {
  const router = useRouter();

  async function handleDuplicate() {
    const res = await fetch(`/api/invoices/${id}`);
    const inv = await res.json();
    const nextRes = await fetch("/api/invoices/next-number");
    const { number } = await nextRes.json();
    const today = new Date().toISOString().split("T")[0];
    const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: inv.client_id, invoice_number: number, issue_date: today, due_date: due, currency: inv.currency, exchange_rate: inv.exchange_rate, notes: inv.notes, items: inv.items }),
    });
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Ești sigur că vrei să ștergi factura?")) return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <a href={`/dashboard/invoices/${id}`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors" title="Vizualizează"><Eye size={15} /></a>
      <button onClick={handleDuplicate} className="p-1.5 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-700 transition-colors" title="Duplică"><Copy size={15} /></button>
      <button onClick={handleDelete} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors" title="Șterge"><Trash2 size={15} /></button>
    </div>
  );
}
