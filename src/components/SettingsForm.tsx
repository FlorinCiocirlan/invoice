"use client";
import { useState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { CheckCircle, Hash } from "lucide-react";

interface User {
  invoice_series?: string;
  invoice_start_number?: number;
}

export default function SettingsForm({ user }: { user: User }) {
  const [form, setForm] = useState({
    invoice_series: user.invoice_series || "F",
    invoice_start_number: user.invoice_start_number || 1,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const preview = `${form.invoice_series} ${String(form.invoice_start_number).padStart(4, "0")}`;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <Hash size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Setări facturi</h1>
            <p className="text-gray-500 text-sm">Serie și numerotare automată</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Serie &amp; Numerotare</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Serie (prefix)</Label>
              <Input value={form.invoice_series} onChange={e => setForm({ ...form, invoice_series: e.target.value })} className="mt-1 font-mono uppercase" placeholder="F" maxLength={5} />
              <p className="text-xs text-gray-400 mt-1">Ex: F, FC, FA, 2026</p>
            </div>
            <div>
              <Label>Număr de start</Label>
              <Input type="number" min={1} value={form.invoice_start_number} onChange={e => setForm({ ...form, invoice_start_number: parseInt(e.target.value) || 1 })} className="mt-1 font-mono" placeholder="1" />
              <p className="text-xs text-gray-400 mt-1">Prima factură pornește de la acest număr</p>
            </div>
          </div>
          <div className="mt-4 bg-gray-50 rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="text-xs text-gray-500">Prima factură va fi:</span>
            <span className="font-mono font-bold text-gray-900">{preview}</span>
          </div>
        </section>
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm"><CheckCircle size={15} />Salvat cu succes!</span>
          )}
          <div className="ml-auto">
            <Button onClick={save} disabled={saving}>{saving ? "Se salvează..." : "Salvează"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
