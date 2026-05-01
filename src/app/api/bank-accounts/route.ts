import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accounts = await sql`
    SELECT * FROM bank_accounts WHERE user_id = ${session.user.id} ORDER BY is_default DESC, created_at ASC
  `;
  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { bank_name, iban, swift, currency, is_default } = body;

  if (is_default) {
    await sql`UPDATE bank_accounts SET is_default = false WHERE user_id = ${session.user.id}`;
  }

  const rows = await sql`
    INSERT INTO bank_accounts (user_id, bank_name, iban, swift, currency, is_default)
    VALUES (${session.user.id}, ${bank_name}, ${iban}, ${swift || null}, ${currency || "EUR"}, ${is_default || false})
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}
