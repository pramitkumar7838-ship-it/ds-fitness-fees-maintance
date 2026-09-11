"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "\uD83C\uDFE0" },
  { href: "/members", label: "Members", icon: "\uD83D\uDC65" },
  { href: "/attendance", label: "Attendance", icon: "\uD83D\uDEAA" },
  { href: "/fees", label: "Fees", icon: "\uD83D\uDCB0" },
  { href: "/reminders", label: "Reminders", icon: "\uD83D\uDD14" },
  { href: "/reports", label: "Reports", icon: "\uD83D\uDCCA" },
  { href: "/settings", label: "Settings", icon: "\u2699\uFE0F" },
];

export default function Sidebar({ adminName, gymName }: { adminName: string; gymName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-steel text-white min-h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-white/10">
        <p className="font-display text-xl font-semibold tracking-wide">{gymName}</p>
        <p className="text-white/50 text-xs mt-0.5">Fees Maintance</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-brand text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-sm font-semibold shrink-0">
            {adminName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{adminName}</p>
            <p className="text-xs text-white/50">Admin</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full mt-2 text-left px-2 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
