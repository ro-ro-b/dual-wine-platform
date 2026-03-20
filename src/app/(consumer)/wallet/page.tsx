'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Wine } from "@/types/dual";

const typeColors: Record<string, string> = {
  red: 'from-rose-500/20 to-rose-900/20',
  white: 'from-amber-400/20 to-amber-800/20',
  sparkling: 'from-violet-400/20 to-violet-800/20',
  'rosé': 'from-pink-400/20 to-pink-800/20',
  dessert: 'from-orange-400/20 to-orange-800/20',
  fortified: 'from-purple-400/20 to-purple-800/20',
};

export default function CellarPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchClaimedWines = async (): Promise<void> => {
      try {
        const walletRes = await fetch("/api/wallet");
        const walletData = await walletRes.json();
        const claimedIds: string[] = walletData.claimedIds || [];
        const winesRes = await fetch("/api/wines");
        const allWines: Wine[] = await winesRes.json();
        const claimedWines = allWines.filter((w: Wine) => claimedIds.includes(w.id));
        setWines(claimedWines);
        setLoading(false);
      } catch (err: unknown) {
        console.error("Failed to fetch wines:", err);
        setLoading(false);
      }
    };
    fetchClaimedWines();
  }, []);

  const filtered = filter === "all" ? wines : wines.filter((w: any) => w.wineData.type === filter);
  const totalValue = wines.reduce((sum, w) => sum + w.wineData.currentValue * w.wineData.quantity, 0);
  const totalBottles = wines.reduce((sum, w) => sum + w.wineData.quantity, 0);
  const avgRoi =
    wines.length > 0
      ? wines.reduce(
          (sum, w) =>
            sum +
            ((w.wineData.currentValue - w.wineData.purchasePrice) / w.wineData.purchasePrice) * 100,
          0
        ) / wines.length
      : 0;

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 pb-20 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between pt-8 md:pt-12 mb-10">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-semibold block mb-2">Private Collection</span>
          <h1 className="text-3xl md:text-5xl font-serif italic text-white leading-tight">My Cellar</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono">DUAL Network</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/60 text-sm font-bold">
            IB
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="relative rounded-2xl overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D0A15] via-[#4a1228] to-[#1a0510]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(197,160,89,0.3) 0%, transparent 50%)'
        }} />
        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#C5A059] text-sm">account_balance_wallet</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">Portfolio Value</span>
          </div>
          <div className="text-4xl md:text-5xl font-serif italic text-white mb-6">${totalValue.toLocaleString()}</div>
          <div className="flex gap-3 md:gap-4">
            {[
              { label: 'Bottles', value: totalBottles },
              { label: 'Wines', value: wines.length },
              { label: 'Avg ROI', value: `${avgRoi >= 0 ? '+' : ''}${avgRoi.toFixed(1)}%`, isRoi: true },
            ].map((stat) => (
              <div key={stat.label} className="flex-1 bg-white/[0.06] backdrop-blur-sm rounded-xl px-4 py-3 border border-white/[0.04]">
                <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">{stat.label}</div>
                <div className={`text-lg md:text-xl font-semibold mt-0.5 ${
                  (stat as any).isRoi ? (avgRoi >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white'
                }`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8" style={{ scrollbarWidth: 'none' }}>
        {["all", "red", "white", "sparkling", "rosé", "dessert", "fortified"].map((t: string) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold whitespace-nowrap transition-all ${
              filter === t
                ? "bg-[#791b3a] text-white border border-[#791b3a]"
                : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:border-white/10 hover:text-white/60"
            }`}
          >
            {t === "all" ? "All Wines" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Wine List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-5 animate-pulse">
              <div className="h-16 bg-white/[0.03] rounded-xl mb-4" />
              <div className="h-4 bg-white/[0.03] rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/[0.02] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl text-white/10">wine_bar</span>
          </div>
          <h3 className="text-xl font-serif italic text-white/60 mb-2">No wines yet</h3>
          <p className="text-sm text-white/30 mb-8 max-w-xs mx-auto">Scan a QR code on a wine bottle to claim your first token to the vault.</p>
          <Link
            href="/wallet/scan"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-white font-semibold rounded-lg text-sm hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all"
          >
            <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
            Scan &amp; Claim
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((wine: any) => {
            const d = wine.wineData;
            const roi = d.purchasePrice > 0
              ? ((d.currentValue - d.purchasePrice) / d.purchasePrice) * 100
              : 0;
            const gradient = typeColors[d.type] || typeColors.red;

            return (
              <Link
                key={wine.id}
                href={`/wallet/browse/${wine.id}`}
                className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#C5A059]/30 transition-all duration-300 overflow-hidden"
              >
                {/* Type gradient accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative p-5">
                  <div className="flex items-start gap-4">
                    {/* Wine icon */}
                    <div className="w-14 h-18 rounded-xl bg-gradient-to-b from-[#2D0A15] to-[#1a0510] flex items-center justify-center flex-shrink-0 border border-white/[0.06]">
                      <span className="material-symbols-outlined text-[#791b3a]/60 text-2xl">wine_bar</span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="text-sm font-serif italic text-white truncate">{d.name}</h3>
                        {wine.status === 'anchored' && (
                          <span className="material-symbols-outlined text-[#C5A059] text-sm">verified</span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/30 mb-2">{d.producer} · {d.vintage}</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                          wine.status === "anchored" ? "bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20" :
                          wine.status === "minted" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          "bg-white/5 text-white/40 border border-white/10"
                        }`}>{wine.status}</span>
                        <span className="text-[9px] text-white/20">{d.quantity} btl</span>
                      </div>
                    </div>
                    {/* Value */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-serif italic text-[#C5A059]">${d.currentValue.toLocaleString()}</div>
                      <div className={`text-[11px] font-semibold ${roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {roi >= 0 ? "+" : ""}{roi.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
