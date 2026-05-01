import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { bank_name, iban, swift, currency, is_default } = body;

  if (is_default) {
    await sql`UPDATE bank_accounts SET is_default = false WHERE user_id = ${session.user.id}`;
  }

  const rows = await sql`
    UPDATE bank_accounts SET bank_name=${bank_name}, iban=${iban}, swift=${swift || null},
    currency=${currency || "EUR"}, is_default=${is_default || false}
    WHERE id=${id} AND user_id=${session.user.id} RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await sql`DELETE FROM bank_accounts WHERE id=${id} AND user_id=${session.user.id}`;
  return NextResponse.json({ ok: true });
}
