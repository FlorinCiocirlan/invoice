import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await sql`SELECT * FROM users WHERE id = ${session.user.id}`;
  const user = rows[0];
  if (user) delete user.password;
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, cui, reg_com, address, city, county, bank_name, iban, email_contact, invoice_series, invoice_start_number } = body;
  const rows = await sql`
    UPDATE users SET name=${name}, cui=${cui}, reg_com=${reg_com}, address=${address},
    city=${city}, county=${county}, bank_name=${bank_name}, iban=${iban}, email_contact=${email_contact},
    invoice_series=${invoice_series || 'F'}, invoice_start_number=${invoice_start_number || 1}
    WHERE id=${session.user.id} RETURNING *
  `;
  const user = rows[0];
  if (user) delete user.password;
  return NextResponse.json(user);
}
