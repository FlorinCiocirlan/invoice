"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Eroare la înregistrare"); setLoading(false); return; }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { setError("Email sau parolă greșită"); }
      else { router.push("/dashboard"); }
    } catch {
      setError("A apărut o eroare");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">FacturaPFA</h1>
          <p className="text-gray-500 mt-1 text-sm">Facturare simplă pentru PFA</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{mode === "login" ? "Autentificare" : "Cont nou"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <Label htmlFor="name">Nume complet / Denumire PFA</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1" placeholder="POPESCU ION PERSOANA FIZICA AUTORIZATA" />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" placeholder="email@exemplu.ro" />
              </div>
              <div>
                <Label htmlFor="password">Parolă</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1" placeholder="••••••••" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Se procesează..." : mode === "login" ? "Intră în cont" : "Creează cont"}
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              {mode === "login" ? "Nu ai cont?" : "Ai deja cont?"}{" "}
              <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-gray-900 font-medium underline">
                {mode === "login" ? "Înregistrează-te" : "Autentifică-te"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
