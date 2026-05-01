"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FileText, Users, Settings, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Facturi", icon: FileText, exact: true },
  { href: "/dashboard/clients", label: "Clienți", icon: Users },
  { href: "/dashboard/settings", label: "Setări PFA", icon: Settings },
];

export default function DashboardNav({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">FacturaPFA</p>
        <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors", active ? "bg-white text-gray-900 font-medium" : "text-gray-300 hover:bg-gray-800 hover:text-white")}>
              <Icon size={16} />{label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link href="/dashboard/invoices/new" className="flex items-center gap-2 bg-white text-gray-900 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors w-full">
          <Plus size={16} />Factură nouă
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full">
          <LogOut size={16} />Ieșire
        </button>
      </div>
    </aside>
  );
}
