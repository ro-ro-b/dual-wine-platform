'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grape, Wine, ShoppingBag, TrendingUp, Activity, Settings } from "lucide-react";

const navItems = [
  { href: "/wallet", label: "My Cellar", icon: Wine },
  { href: "/wallet/browse", label: "Marketplace", icon: ShoppingBag },
  { href: "/wallet/portfolio", label: "Portfolio", icon: TrendingUp },
  { href: "/wallet/activity", label: "Activity", icon: Activity },
];

export default function ConsumerNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg wine-gradient flex items-center justify-center">
              <Grape className="w-5 h-5 text-gold-300" />
            </div>
            <span className="font-bold text-lg text-wine-900">Wine Vault</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/wallet" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-wine-50 text-wine-700"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition"
          >
            <Settings className="w-4 h-4" />
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
