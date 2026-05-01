import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clients = await sql`SELECT * FROM clients WHERE user_id = ${session.user.id} ORDER BY name`;
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, cui, reg_com, address, city, country, email } = body;
  const rows = await sql`
    INSERT INTO clients (user_id, name, cui, reg_com, address, city, country, email)
    VALUES (${session.user.id}, ${name}, ${cui}, ${reg_com}, ${address}, ${city}, ${country || "ROMANIA"}, ${email})
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}
