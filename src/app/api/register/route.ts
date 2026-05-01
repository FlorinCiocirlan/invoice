import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  const rows = await sql`
    INSERT INTO users (email, password, name) VALUES (${email}, ${hash}, ${name}) RETURNING id
  `;
  return NextResponse.json({ ok: true, id: rows[0].id });
}
