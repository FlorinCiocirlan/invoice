import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await sql`SELECT * FROM users WHERE id = ${session!.user!.id}` as any[];
  const user = rows[0];
  delete user.password;
  return <SettingsForm user={user} />;
}
