'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Intelligence", icon: "auto_awesome", filled: true },
  { href: "/admin/inventory", label: "Inventory", icon: "inventory_2", filled: false },
  { href: "/admin/mint", label: "Mint", icon: "database", filled: false },
  { href: "/admin/webhooks", label: "Webhooks", icon: "settings_input_component", filled: false },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[72px] h-screen bg-burgundy-deep flex flex-col items-center py-6 border-r border-white/10 z-50 sticky top-0">
      {/* Logo */}
      <div className="mb-10">
        <div className="w-10 h-10 rounded-full bg-gold-primary flex items-center justify-center font-extrabold text-burgundy-deep text-sm shadow-lg shadow-gold-primary/20 animate-glow-pulse">
          V
        </div>
      </div>

      {/* Nav icons */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200"
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute -left-[14px] w-[3px] h-6 rounded-r-full bg-gold-dim transition-all" />
              )}

              {/* Icon background */}
              <span
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                  active
                    ? "text-gold-dim bg-white/10"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 500" } : undefined}
                >
                  {item.icon}
                </span>
              </span>

              {/* Tooltip */}
              <span className="nav-tooltip z-50">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto flex flex-col items-center gap-3">
        {/* Divider */}
        <div className="w-8 h-px bg-white/10 mb-1" />

        {/* Consumer app link */}
        <Link
          href="/wallet"
          title="Consumer App"
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
          <span className="nav-tooltip z-50">Consumer App</span>
        </Link>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full border border-gold-dim/30 bg-burgundy-accent flex items-center justify-center text-gold-dim/80 text-[10px] font-bold tracking-wide cursor-pointer hover:border-gold-dim/60 transition-colors">
          AD
        </div>
      </div>
    </aside>
  );
}
