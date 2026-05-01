import { initDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await initDB();
    return NextResponse.json({ ok: true, message: "Database initialized" });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
