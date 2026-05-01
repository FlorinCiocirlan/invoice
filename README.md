# FacturaPFA

Aplicație de facturare pentru PFA — Next.js 16 + Neon (PostgreSQL) + Vercel.

## Ce face aplicația

- Autentificare cu email/parolă (cont propriu)
- Facturi: creare, vizualizare, duplicare, ștergere; numerotare automată F 0001, F 0002...
- Clienți: bază de date cu toate datele fiscale
- Setări PFA: CUI, IBAN, adresă — apar pe fiecare factură
- Format identic cu F0051 — printabil direct ca PDF
- Duplicate cu 1 click — copiază toți itemii, schimbă numărul și data

## Setup local

```bash
npm install
cp .env.local.example .env.local
# completează .env.local cu DATABASE_URL și AUTH_SECRET
npm run dev
# apoi vizitează http://localhost:3000/api/init o singură dată
```

## Deploy Vercel

1. Push pe GitHub
2. New Project pe vercel.com → importă repo
3. Adaugă env vars: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`
4. Deploy → vizitează `/api/init` o dată pentru a crea tabelele

## Generare PDF

Pe pagina facturii → buton "Printează / PDF" → Ctrl+P → Save as PDF.
Navigația dispare automat la print.
