import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import ClientsManager from "@/components/ClientsManager";

export default async function ClientsPage() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clients = await sql`SELECT * FROM clients WHERE user_id = ${session!.user!.id} ORDER BY name` as any[];
  return <ClientsManager initialClients={clients} />;
}
