'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grape, LayoutDashboard, Package, PlusCircle, Webhook, FileCode, Building, Wine } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/mint", label: "Mint Wine", icon: PlusCircle },
  { href: "/admin/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/admin/templates", label: "Templates", icon: FileCode },
  { href: "/admin/organizations", label: "Organizations", icon: Building },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-wine-950 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
              <Grape className="w-5 h-5 text-wine-950" />
            </div>
            <div>
              <span className="font-bold text-lg">Wine Vault</span>
              <span className="ml-2 text-xs bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-wine-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <Link
            href="/wallet"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-wine-300 hover:bg-white/10 hover:text-white transition"
          >
            <Wine className="w-4 h-4" />
            Consumer
          </Link>
        </div>
      </div>
    </nav>
  );
}
