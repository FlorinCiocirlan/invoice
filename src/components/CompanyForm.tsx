"use client";
import { useState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { CheckCircle, Building2 } from "lucide-react";

interface User {
  name: string; cui?: string; reg_com?: string; address?: string;
  city?: string; county?: string; email_contact?: string;
}

export default function CompanyForm({ user }: { user: User }) {
  const [form, setForm] = useState({
    name: user.name || "",
    cui: user.cui || "",
    reg_com: user.reg_com || "",
    address: user.address || "",
    city: user.city || "",
    county: user.county || "",
    email_contact: user.email_contact || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  }

  async function save() {
    setSaving(true);
    await fetch("/api/company", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Date firmă</h1>
            <p className="text-gray-500 text-sm">Informații PFA — apar pe toate facturile</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Identificare fiscală</h3>
          <div className="space-y-4">
            <div>
              <Label>Denumire completă PFA *</Label>
              <Input value={form.name} onChange={set("name")} className="mt-1" placeholder="POPESCU ION PERSOANA FIZICA AUTORIZATA" />
              <p className="text-xs text-gray-400 mt-1">Exact cum apare în certificatul de înregistrare</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CUI</Label>
                <Input value={form.cui} onChange={set("cui")} className="mt-1 font-mono" placeholder="44748896" />
              </div>
              <div>
                <Label>Nr. Reg. Com.</Label>
                <Input value={form.reg_com} onChange={set("reg_com")} className="mt-1 font-mono" placeholder="F39/455/2021" />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 pt-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Sediu</h3>
          <div className="space-y-4">
            <div>
              <Label>Adresă completă</Label>
              <Input value={form.address} onChange={set("address")} className="mt-1" placeholder="STR. ARH. ION MINCU, NR.16, CAMERA NR.1, ET.8, AP.35" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Localitate</Label>
                <Input value={form.city} onChange={set("city")} className="mt-1" placeholder="FOCSANI" />
              </div>
              <div>
                <Label>Județ</Label>
                <Input value={form.county} onChange={set("county")} className="mt-1" placeholder="Vrancea" />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 pt-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Contact</h3>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email_contact} onChange={set("email_contact")} className="mt-1" placeholder="email@pfa.ro" />
          </div>
        </section>

        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm">
              <CheckCircle size={15} />
              Salvat cu succes!
            </span>
          )}
          <div className="ml-auto">
            <Button onClick={save} disabled={saving}>{saving ? "Se salvează..." : "Salvează"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
