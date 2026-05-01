import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import BankAccountsManager from "@/components/BankAccountsManager";

export default async function BankAccountsPage() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accounts = await sql`
    SELECT * FROM bank_accounts WHERE user_id = ${session!.user!.id}
    ORDER BY is_default DESC, created_at ASC
  ` as any[];
  return <BankAccountsManager initialAccounts={accounts} />;
}
