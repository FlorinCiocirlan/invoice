"use client";
import { useState } from "react";
import { Button, Input, Label, Dialog, DialogHeader, DialogTitle, DialogContent } from "@/components/ui";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

interface Client { id: number; name: string; cui?: string; reg_com?: string; address?: string; city?: string; country?: string; email?: string }
const empty = (): Omit<Client, "id"> => ({ name: "", cui: "", reg_com: "", address: "", city: "", country: "ROMANIA", email: "" });

export default function ClientsManager({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  function openNew() { setEditing(null); setForm(empty()); setOpen(true); }
  function openEdit(c: Client) { setEditing(c); setForm({ name: c.name, cui: c.cui || "", reg_com: c.reg_com || "", address: c.address || "", city: c.city || "", country: c.country || "ROMANIA", email: c.email || "" }); setOpen(true); }

  async function save() {
    setSaving(true);
    if (editing) {
      const res = await fetch(`/api/clients/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      setClients(clients.map(c => c.id === editing.id ? data : c));
    } else {
      const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      setClients([...clients, data]);
    }
    setSaving(false); setOpen(false);
  }

  async function del(id: number) {
    if (!confirm("Ștergi clientul?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setClients(clients.filter(c => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clienți</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} clienți înregistrați</p>
        </div>
        <Button onClick={openNew}><Plus size={16} className="mr-2" />Client nou</Button>
      </div>
      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-20 text-gray-400">
          <Users size={48} className="mb-4 opacity-30" />
          <p className="font-medium">Niciun client</p>
          <button onClick={openNew} className="mt-4 text-gray-900 font-medium underline text-sm">Adaugă primul client →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {clients.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between hover:border-gray-300 transition-colors">
              <div>
                <p className="font-semibold text-gray-900">{c.name}</p>
                <div className="text-sm text-gray-500 mt-1 space-x-4">
                  {c.cui && <span>CUI: {c.cui}</span>}
                  {c.city && <span>{c.city}, {c.country}</span>}
                  {c.email && <span>{c.email}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><Pencil size={15} /></button>
                <button onClick={() => del(c.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>{editing ? "Editează client" : "Client nou"}</DialogTitle>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">✕</button>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div><Label>Denumire *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" placeholder="Scopeworker LLC" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>CUI / Tax ID</Label><Input value={form.cui} onChange={e => setForm({ ...form, cui: e.target.value })} className="mt-1" /></div>
            <div><Label>Reg. Com.</Label><Input value={form.reg_com} onChange={e => setForm({ ...form, reg_com: e.target.value })} className="mt-1" /></div>
          </div>
          <div><Label>Adresă</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Localitate</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="mt-1" /></div>
            <div><Label>Țară</Label><Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="mt-1" /></div>
          </div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Anulează</Button>
            <Button onClick={save} disabled={saving || !form.name}>{saving ? "Se salvează..." : "Salvează"}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
