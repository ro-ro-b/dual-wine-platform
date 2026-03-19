'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Wine } from "@/types/dual";

export default function CellarPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchClaimedWines = async (): Promise<void> => {
      try {
        // Get claimed IDs from wallet
        const walletRes = await fetch("/api/wallet");
        const walletData = await walletRes.json();
        const claimedIds: string[] = walletData.claimedIds || [];

        // Fetch all wines
        const winesRes = await fetch("/api/wines");
        const allWines: Wine[] = await winesRes.json();

        // Filter to only claimed wines
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
    <div className="px-4 pt-6 pb-20 bg-background-light min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Cellar</h1>
          <p className="text-xs text-slate-500">Your tokenised collection</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600 text-xl">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-primary-consumer/10 flex items-center justify-center text-primary-consumer font-bold text-sm border border-primary-consumer/20">
            IB
          </div>
        </div>
      </div>

      {/* Portfolio Summary Card */}
      <div className="rounded-2xl p-5 mb-6 text-white bg-gradient-to-br from-primary-consumer via-[#912448] to-[#4d0d22] shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-accent text-sm">account_balance_wallet</span>
          <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Portfolio Value</span>
        </div>
        <div className="text-3xl font-bold mb-4">${totalValue.toLocaleString()}</div>
        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
            <div className="text-white/60 text-[10px] uppercase tracking-wider">Bottles</div>
            <div className="text-lg font-bold">{totalBottles}</div>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
            <div className="text-white/60 text-[10px] uppercase tracking-wider">Wines</div>
            <div className="text-lg font-bold">{wines.length}</div>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
            <div className="text-white/60 text-[10px] uppercase tracking-wider">Avg ROI</div>
            <div className={`text-lg font-bold ${avgRoi >= 0 ? "text-green-300" : "text-red-300"}`}>
              {avgRoi >= 0 ? "+" : ""}{avgRoi.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {["all", "red", "white", "sparkling", "rosé", "dessert", "fortified"].map((t: any) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === t
                ? "bg-primary-consumer text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {t === "all" ? "All Wines" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Wine List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading cellar...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-slate-300 block mb-4">wine_bar</span>
          <p className="text-slate-500 text-sm mb-4">No wines in your cellar yet</p>
          <Link
            href="/wallet/scan"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-consumer text-white font-semibold rounded-lg hover:bg-primary-consumer/90 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
            Scan a QR code to claim a wine
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((wine: any) => {
            const d = wine.wineData;
            const roi = d.purchasePrice > 0
              ? ((d.currentValue - d.purchasePrice) / d.purchasePrice) * 100
              : 0;
            return (
              <Link
                key={wine.id}
                href={`/wallet/browse/${wine.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm active:scale-[0.98] transition-transform"
              >
                {/* Wine thumbnail */}
                <div className="w-16 h-20 rounded-xl bg-gradient-to-b from-primary-consumer/10 to-primary-consumer/5 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary-consumer/40 text-3xl">wine_bar</span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{d.name}</h3>
                    {wine.anchoredAt && (
                      <span className="material-symbols-outlined text-gold-600 text-sm">verified</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{d.producer} · {d.vintage}</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      wine.status === "anchored" ? "bg-gold-50 text-gold-700 border border-gold-200" :
                      wine.status === "listed" ? "bg-purple-50 text-purple-700" :
                      wine.status === "minted" ? "bg-blue-50 text-blue-700" :
                      "bg-slate-50 text-slate-600"
                    }`}>{wine.status}</span>
                    <span className="text-[10px] text-slate-400">{d.quantity} btl</span>
                  </div>
                </div>
                {/* Value */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-slate-900">${d.currentValue.toLocaleString()}</div>
                  <div className={`text-xs font-semibold ${roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {roi >= 0 ? "+" : ""}{roi.toFixed(1)}%
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
