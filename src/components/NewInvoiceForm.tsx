"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Client { id: number; name: string; cui?: string; reg_com?: string; address?: string; city?: string; country?: string; }
interface User { name: string; cui?: string; reg_com?: string; address?: string; city?: string; county?: string; bank_name?: string; iban?: string; }
interface Item { description: string; unit: string; quantity: string; unit_price: string; total: string }
const emptyItem = (): Item => ({ description: "", unit: "BUC", quantity: "1", unit_price: "0", total: "0" });

export default function NewInvoiceForm({ clients, user, nextNumber }: { clients: Client[]; user: User; nextNumber: string }) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const due30 = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  const [invoiceNumber, setInvoiceNumber] = useState(nextNumber);
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(due30);
  const [currency, setCurrency] = useState("EUR");
  const [exchangeRate, setExchangeRate] = useState("5.0989");
  const [clientId, setClientId] = useState(clients[0]?.id?.toString() || "");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [saving, setSaving] = useState(false);

  const selectedClient = clients.find(c => c.id.toString() === clientId);

  function updateItem(idx: number, field: keyof Item, val: string) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    if (field === "quantity" || field === "unit_price") {
      const q = parseFloat(updated[idx].quantity) || 0;
      const p = parseFloat(updated[idx].unit_price) || 0;
      updated[idx].total = (q * p).toFixed(2);
    }
    setItems(updated);
  }

  const totalAmount = items.reduce((s, i) => s + parseFloat(i.total || "0"), 0);
  const totalRON = totalAmount * parseFloat(exchangeRate || "1");

  async function handleSave() {
    if (!clientId) { alert("Selectează un client"); return; }
    setSaving(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: parseInt(clientId), invoice_number: invoiceNumber, issue_date: issueDate, due_date: dueDate, currency, exchange_rate: parseFloat(exchangeRate), notes, items: items.map(i => ({ description: i.description, unit: i.unit, quantity: parseFloat(i.quantity), unit_price: parseFloat(i.unit_price), total: parseFloat(i.total) })) }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) router.push(`/dashboard/invoices/${data.id}`);
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8 no-print">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-900 transition-colors"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Factură nouă</h1>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6 no-print">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Detalii factură</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Număr factură</Label><Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="mt-1 font-mono" /></div>
            <div><Label>Monedă</Label><Select value={currency} onChange={e => setCurrency(e.target.value)} className="mt-1"><option>EUR</option><option>RON</option><option>USD</option></Select></div>
            <div><Label>Data emiterii</Label><Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="mt-1" /></div>
            <div><Label>Data scadenței</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1" /></div>
            <div><Label>Curs valutar (RON)</Label><Input value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} className="mt-1" placeholder="5.0989" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Client</h3>
          <Select value={clientId} onChange={e => setClientId(e.target.value)}>
            <option value="">— Selectează client —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          {selectedClient && (
            <div className="text-sm text-gray-600 space-y-1">
              {selectedClient.cui && <p>CUI: {selectedClient.cui}</p>}
              {selectedClient.address && <p>{selectedClient.address}</p>}
              {selectedClient.city && <p>{selectedClient.city}, {selectedClient.country}</p>}
            </div>
          )}
          <Link href="/dashboard/clients" className="text-xs text-gray-500 underline">Gestionează clienți →</Link>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 no-print">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Descriere</th>
              <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-20">U.M.</th>
              <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-24">Cant.</th>
              <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-32">Preț unitar</th>
              <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-32">Total</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b last:border-0">
                <td className="p-2"><Input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Servicii consultanță software" className="border-0 shadow-none focus:ring-1" /></td>
                <td className="p-2"><Input value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)} className="border-0 shadow-none text-center focus:ring-1" /></td>
                <td className="p-2"><Input type="number" value={item.quantity} onChange={e => updateItem(idx, "quantity", e.target.value)} className="border-0 shadow-none text-center focus:ring-1" /></td>
                <td className="p-2"><Input type="number" value={item.unit_price} onChange={e => updateItem(idx, "unit_price", e.target.value)} className="border-0 shadow-none text-right focus:ring-1" /></td>
                <td className="p-2"><Input readOnly value={item.total} className="border-0 shadow-none text-right bg-gray-50 font-semibold" /></td>
                <td className="p-2">{items.length > 1 && <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
          <button onClick={() => setItems([...items, emptyItem()])} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"><Plus size={14} /> Adaugă linie</button>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total fără TVA</p>
            <p className="text-xl font-bold">{totalAmount.toFixed(2)} {currency}</p>
            {currency !== "RON" && <p className="text-xs text-gray-400">{totalRON.toFixed(2)} RON (curs {exchangeRate})</p>}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 no-print">
        <Label>Note / Instrucțiuni de plată</Label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-2" rows={3} placeholder="Instrucțiuni de plată, mențiuni etc." />
      </div>
      <div className="flex justify-end gap-3 no-print">
        <Link href="/dashboard"><Button variant="outline">Anulează</Button></Link>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Se salvează..." : "Salvează factura"}</Button>
      </div>
    </div>
  );
}
