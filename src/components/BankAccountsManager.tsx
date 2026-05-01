"use client";
import { useState } from "react";
import { Button, Input, Label, Select, Dialog, DialogHeader, DialogTitle, DialogContent } from "@/components/ui";
import { Plus, Pencil, Trash2, Landmark, Star } from "lucide-react";

interface BankAccount {
  id: number;
  bank_name: string;
  iban: string;
  swift?: string;
  currency: string;
  is_default: boolean;
}

const empty = (): Omit<BankAccount, "id"> => ({
  bank_name: "", iban: "", swift: "", currency: "EUR", is_default: false,
});

export default function BankAccountsManager({ initialAccounts }: { initialAccounts: BankAccount[] }) {
  const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  function openNew() { setEditing(null); setForm(empty()); setOpen(true); }
  function openEdit(a: BankAccount) {
    setEditing(a);
    setForm({ bank_name: a.bank_name, iban: a.iban, swift: a.swift || "", currency: a.currency, is_default: a.is_default });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    if (editing) {
      const res = await fetch(`/api/bank-accounts/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setAccounts(prev => prev
        .map(a => ({ ...a, is_default: form.is_default ? (a.id === editing.id) : a.is_default }))
        .map(a => a.id === editing.id ? { ...a, ...data } : a)
      );
    } else {
      const res = await fetch("/api/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setAccounts(prev => {
        const updated = form.is_default ? prev.map(a => ({ ...a, is_default: false })) : prev;
        return [...updated, data];
      });
    }
    setSaving(false);
    setOpen(false);
  }

  async function del(id: number) {
    if (!confirm("Ștergi contul bancar?")) return;
    await fetch(`/api/bank-accounts/${id}`, { method: "DELETE" });
    setAccounts(prev => prev.filter(a => a.id !== id));
  }

  async function setDefault(account: BankAccount) {
    await fetch(`/api/bank-accounts/${account.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...account, is_default: true }),
    });
    setAccounts(prev => prev.map(a => ({ ...a, is_default: a.id === account.id })));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <Landmark size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conturi bancare</h1>
            <p className="text-gray-500 text-sm">{accounts.length} {accounts.length === 1 ? "cont" : "conturi"} înregistrate</p>
          </div>
        </div>
        <Button onClick={openNew}><Plus size={16} className="mr-2" />Cont nou</Button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-20 text-gray-400">
          <Landmark size={48} className="mb-4 opacity-20" />
          <p className="font-medium text-gray-500">Niciun cont bancar</p>
          <p className="text-sm mt-1">Adaugă IBAN-ul și SWIFT-ul băncii tale</p>
          <button onClick={openNew} className="mt-4 text-gray-900 font-medium underline text-sm">Adaugă primul cont →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map(a => (
            <div key={a.id} className={`bg-white rounded-xl border p-5 flex items-start justify-between transition-colors ${
              a.is_default ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-200 hover:border-gray-300"
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  a.is_default ? "bg-gray-900" : "bg-gray-100"
                }`}>
                  <Landmark size={16} className={a.is_default ? "text-white" : "text-gray-500"} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{a.bank_name}</p>
                    {a.is_default && (
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">
                        <Star size={10} fill="currentColor" />Implicit
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">{a.currency}</span>
                  </div>
                  <p className="text-sm font-mono text-gray-600 mt-1">{a.iban}</p>
                  {a.swift && <p className="text-xs text-gray-400 mt-0.5">SWIFT: <span className="font-mono">{a.swift}</span></p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!a.is_default && (
                  <button onClick={() => setDefault(a)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Setează implicit">
                    <Star size={14} />
                  </button>
                )}
                <button onClick={() => openEdit(a)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => del(a.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {accounts.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">Contul implicit</p>
          <p className="text-blue-600 text-xs">Contul marcat cu ★ apare automat pe facturile noi. Poți schimba contul per factură din formularul de creare.</p>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>{editing ? "Editează cont" : "Cont bancar nou"}</DialogTitle>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">✕</button>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div>
            <Label>Bancă *</Label>
            <Input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} className="mt-1" placeholder="BRD - Groupe Societe Generale" />
          </div>
          <div>
            <Label>IBAN *</Label>
            <Input value={form.iban} onChange={e => setForm({ ...form, iban: e.target.value.toUpperCase() })} className="mt-1 font-mono tracking-wider" placeholder="RO85 BRDE 426S V264 1810 4260" />
          </div>
          <div>
            <Label>SWIFT / BIC</Label>
            <Input value={form.swift} onChange={e => setForm({ ...form, swift: e.target.value.toUpperCase() })} className="mt-1 font-mono" placeholder="BRDEROBU" />
            <p className="text-xs text-gray-400 mt-1">Necesar pentru plăți internaționale</p>
          </div>
          <div>
            <Label>Monedă principală</Label>
            <Select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="mt-1">
              <option value="EUR">EUR — Euro</option>
              <option value="RON">RON — Lei</option>
              <option value="USD">USD — Dolar</option>
              <option value="GBP">GBP — Livră</option>
            </Select>
          </div>
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} className="w-4 h-4 accent-gray-900" />
            <div>
              <p className="text-sm font-medium text-gray-900">Cont implicit</p>
              <p className="text-xs text-gray-500">Apare automat pe facturile noi</p>
            </div>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Anulează</Button>
            <Button onClick={save} disabled={saving || !form.bank_name || !form.iban}>
              {saving ? "Se salvează..." : "Salvează"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
