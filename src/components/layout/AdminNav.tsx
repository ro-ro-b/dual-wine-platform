'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const managementItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/inventory", label: "Inventory", icon: "inventory_2" },
  { href: "/admin/mint", label: "Mint Wine", icon: "database" },
];

const systemItems = [
  { href: "/admin/webhooks", label: "Webhooks", icon: "webhook" },
  { href: "/admin/templates", label: "Templates", icon: "description" },
  { href: "/admin/organizations", label: "Organizations", icon: "corporate_fare" },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: { href: string; label: string; icon: string }) => (
    <Link
      key={item.href}
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
        isActive(item.href)
          ? "bg-accent text-primary font-semibold shadow-inner"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="material-symbols-outlined">{item.icon}</span>
      <span className="text-sm">{item.label}</span>
    </Link>
  );

  return (
    <aside className="w-72 bg-primary flex flex-col h-screen sticky top-0 border-r border-primary/10 shadow-xl">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-accent rounded-lg p-2 flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-primary font-bold">grain</span>
        </div>
        <div>
          <h1 className="text-white text-lg font-bold leading-tight">DUAL</h1>
          <p className="text-accent/80 text-xs font-medium uppercase tracking-widest">Wine Vault</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="text-accent/40 text-[10px] font-bold uppercase tracking-widest px-3 mb-2">
          Management
        </div>
        {managementItems.map(renderNavItem)}

        <div className="pt-6 pb-2">
          <div className="text-accent/40 text-[10px] font-bold uppercase tracking-widest px-3 mb-2">
            System
          </div>
        </div>
        {systemItems.map(renderNavItem)}
      </nav>

      <div className="p-4 mt-auto">
        <Link
          href="/wallet"
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-accent">open_in_new</span>
            <span className="text-sm font-medium">Consumer App</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
