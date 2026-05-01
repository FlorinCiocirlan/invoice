import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { name, cui, reg_com, address, city, country, email } = body;
  const rows = await sql`
    UPDATE clients SET name=${name}, cui=${cui}, reg_com=${reg_com}, address=${address},
    city=${city}, country=${country}, email=${email}
    WHERE id=${id} AND user_id=${session.user.id} RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await sql`DELETE FROM clients WHERE id=${id} AND user_id=${session.user.id}`;
  return NextResponse.json({ ok: true });
}
