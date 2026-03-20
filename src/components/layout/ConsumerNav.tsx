'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/wallet", label: "Cellar", icon: "wine_bar" },
  { href: "/wallet/browse", label: "Market", icon: "storefront" },
  { href: "/wallet/scan", label: "SCAN", icon: "qr_code_scanner", isCenter: true },
  { href: "/wallet/portfolio", label: "Portfolio", icon: "analytics" },
  { href: "/wallet/activity", label: "Activity", icon: "history" },
];

export default function ConsumerNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto bg-white border-t border-slate-200 px-2 pb-safe">
        <div className="flex items-end justify-around py-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/wallet"
                ? pathname === "/wallet"
                : pathname.startsWith(item.href);

            if (item.isCenter) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center -mt-5"
                >
                  <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center shadow-lg shadow-gold-500/30">
                    <span className="material-symbols-outlined text-white text-2xl">
                      {item.icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-accent mt-1">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center py-1 px-3"
              >
                <span
                  className={`material-symbols-outlined text-xl ${
                    isActive ? "text-primary-consumer" : "text-slate-400"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] font-medium mt-0.5 ${
                    isActive ? "text-primary-consumer" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
