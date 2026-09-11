"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Home", icon: "\uD83C\uDFE0" },
  { href: "/members", label: "Members", icon: "\uD83D\uDC65" },
  { href: "/attendance", label: "Entry", icon: "\uD83D\uDEAA" },
  { href: "/fees", label: "Fees", icon: "\uD83D\uDCB0" },
  { href: "/settings", label: "More", icon: "\u2699\uFE0F" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-steel border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium ${
                active ? "text-brand" : "text-white/60"
              }`}
            >
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
