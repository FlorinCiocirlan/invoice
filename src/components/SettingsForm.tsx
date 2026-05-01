"use client";
import { useState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { CheckCircle } from "lucide-react";

interface User { name: string; cui?: string; reg_com?: string; address?: string; city?: string; county?: string; bank_name?: string; iban?: string; email_contact?: string; }

export default function SettingsForm({ user }: { user: User }) {
  const [form, setForm] = useState({ name: user.name || "", cui: user.cui || "", reg_com: user.reg_com || "", address: user.address || "", city: user.city || "", county: user.county || "", bank_name: user.bank_name || "", iban: user.iban || "", email_contact: user.email_contact || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(k: keyof typeof form) { return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }); }

  async function save() {
    setSaving(true);
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Setări PFA</h1>
        <p className="text-gray-500 text-sm mt-1">Datele furnizorului care apar pe facturi</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Date PFA</h3>
          <div className="space-y-4">
            <div><Label>Denumire completă PFA *</Label><Input value={form.name} onChange={set("name")} className="mt-1" placeholder="POPESCU ION PERSOANA FIZICA AUTORIZATA" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>CUI</Label><Input value={form.cui} onChange={set("cui")} className="mt-1" placeholder="44748896" /></div>
              <div><Label>Reg. Com.</Label><Input value={form.reg_com} onChange={set("reg_com")} className="mt-1" placeholder="F39/455/17.08.2021" /></div>
            </div>
          </div>
        </section>
        <section className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Adresă</h3>
          <div className="space-y-4">
            <div><Label>Adresă completă</Label><Input value={form.address} onChange={set("address")} className="mt-1" placeholder="STR. EXEMPLU, NR. 10, AP. 1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Localitate</Label><Input value={form.city} onChange={set("city")} className="mt-1" placeholder="FOCSANI" /></div>
              <div><Label>Județ</Label><Input value={form.county} onChange={set("county")} className="mt-1" placeholder="Vrancea" /></div>
            </div>
          </div>
        </section>
        <section className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Date bancare</h3>
          <div className="space-y-4">
            <div><Label>Bancă</Label><Input value={form.bank_name} onChange={set("bank_name")} className="mt-1" placeholder="BRD - Groupe Societe Generale" /></div>
            <div><Label>IBAN</Label><Input value={form.iban} onChange={set("iban")} className="mt-1 font-mono" placeholder="RO85 BRDE 426S V264 1810 4260" /></div>
            <div><Label>Email contact</Label><Input type="email" value={form.email_contact} onChange={set("email_contact")} className="mt-1" placeholder="email@pfa.ro" /></div>
          </div>
        </section>
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          {saved && <span className="flex items-center gap-1.5 text-green-600 text-sm"><CheckCircle size={15} />Salvat cu succes!</span>}
          <div className="ml-auto"><Button onClick={save} disabled={saving}>{saving ? "Se salvează..." : "Salvează datele"}</Button></div>
        </div>
      </div>
    </div>
  );
}
