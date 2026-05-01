import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  const user = session.user ?? { name: null, email: null };
  return (
    <div className="min-h-screen flex">
      <DashboardNav user={user} />
      <main className="flex-1 ml-60 p-8">{children}</main>
    </div>
  );
}
