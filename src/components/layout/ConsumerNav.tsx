'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/wallet", label: "Cellar", icon: "wine_bar" },
  { href: "/wallet/browse", label: "Market", icon: "storefront" },
  { href: "/wallet/scan", label: "Scan", icon: "qr_code_scanner", isCenter: true },
  { href: "/wallet/portfolio", label: "Portfolio", icon: "analytics" },
  { href: "/wallet/activity", label: "Activity", icon: "history" },
];

export default function ConsumerNav() {
  const pathname = usePathname();

  // Hide nav on the marketplace (it has its own full-screen nav)
  if (pathname.startsWith('/wallet/browse') && pathname !== '/wallet/browse/') {
    // Show on detail pages
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ backdropFilter: 'blur(12px)', background: 'rgba(15,15,15,0.7)' }}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between border-b border-white/5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-[#791b3a] to-[#d4af37]" />
          <span className="font-serif italic text-base md:text-lg text-white tracking-wide">DUAL Vault</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
          {navItems.map((item) => {
            const isActive =
              item.href === "/wallet"
                ? pathname === "/wallet"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 py-1 transition-colors ${
                  isActive
                    ? 'text-white border-b border-[#791b3a]'
                    : 'hover:text-white/70'
                }`}
              >
                <span className="material-symbols-outlined text-xs">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/wallet"
                ? pathname === "/wallet"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center px-2.5 py-1 transition-colors ${
                  item.isCenter ? '' : ''
                } ${isActive ? 'text-[#C5A059]' : 'text-white/30'}`}
              >
                {item.isCenter ? (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8860b] flex items-center justify-center shadow-lg shadow-[#d4af37]/20 -mt-1">
                    <span className="material-symbols-outlined text-white text-base">{item.icon}</span>
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                )}
                <span className={`text-[8px] mt-0.5 uppercase tracking-wider ${item.isCenter ? 'text-[#C5A059]' : ''}`}>
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
