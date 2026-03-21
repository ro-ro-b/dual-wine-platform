'use client';

import AdminNav from "@/components/layout/AdminNav";
import { usePathname } from "next/navigation";

const pageNames: Record<string, string> = {
  "/admin": "Intelligence",
  "/admin/inventory": "Inventory",
  "/admin/mint": "Mint Token",
  "/admin/webhooks": "Webhooks",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageName = Object.entries(pageNames).find(([k]) =>
    k === "/admin" ? pathname === "/admin" : pathname.startsWith(k)
  )?.[1] ?? "";

  return (
    <div className="flex h-screen bg-vault-bg text-gray-200 overflow-hidden">
      <AdminNav />
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Ambient background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-burgundy-accent/[0.04] blur-3xl animate-ambient" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gold-dim/[0.03] blur-3xl animate-ambient" style={{ animationDelay: "-7s" }} />
        </div>

        {/* Top header bar */}
        <header className="h-12 flex items-center justify-between px-8 border-b border-white/[0.06] bg-vault-bg/60 backdrop-blur-2xl z-10 flex-shrink-0 relative">
          <div className="flex items-center gap-5">
            <span className="text-[9px] tracking-[0.3em] font-bold text-white/20 uppercase">
              Vault Intelligence
            </span>
            <span className="text-white/10">·</span>
            <span className="text-[10px] font-semibold text-white/50 tracking-wide">
              {pageName}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-green-500/10 rounded-full ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] text-green-500/80 font-mono uppercase tracking-widest">
                Live
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 flex items-center justify-center text-white/25 hover:text-white/60 rounded-lg hover:bg-white/5 transition-all duration-200">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto vault-scroll relative z-[1]">
          {children}
        </div>

        {/* Status ticker */}
        <div className="bg-black/50 border-t border-white/[0.04] h-7 flex items-center overflow-hidden text-[8px] font-mono text-white/15 uppercase tracking-[0.25em] flex-shrink-0 relative z-[1]">
          <div className="flex items-center gap-10 animate-ticker whitespace-nowrap px-8">
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gold-dim/60" /> DUAL Network · Connected
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-green-400/60" /> Oracle: Active
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-purple-400/60" /> Gemini AI: Ready
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-blue-400/60" /> Blockscout: Synced
            </span>
            <span className="text-white/10">·</span>
            <span>DUAL Token Contract · 0x41Cf...aFF06</span>
            {/* Duplicate for seamless scroll */}
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gold-dim/60" /> DUAL Network · Connected
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-green-400/60" /> Oracle: Active
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-purple-400/60" /> Gemini AI: Ready
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-blue-400/60" /> Blockscout: Synced
            </span>
            <span className="text-white/10">·</span>
            <span>DUAL Token Contract · 0x41Cf...aFF06</span>
          </div>
        </div>
      </main>
    </div>
  );
}
