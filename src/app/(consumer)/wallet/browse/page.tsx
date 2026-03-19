'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Wine } from "@/types/dual";

export default function MarketplacePage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/wines")
      .then((r) => r.json())
      .then((data) => {
        setWines(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = wines
    .filter((w: any) => typeFilter === "all" || w.wineData.type === typeFilter)
    .filter(
      (w) =>
        !search ||
        w.wineData.name.toLowerCase().includes(search.toLowerCase()) ||
        w.wineData.producer.toLowerCase().includes(search.toLowerCase()) ||
        w.wineData.region.toLowerCase().includes(search.toLowerCase())
    );

  // Featured wines (top 4 by value)
  const featured = [...wines].sort((a, b) => b.wineData.currentValue - a.wineData.currentValue).slice(0, 4);

  const typeBadgeColors: Record<string, string> = {
    red: "bg-red-500/90",
    white: "bg-amber-400/90",
    sparkling: "bg-yellow-400/90",
    "rosé": "bg-pink-400/90",
    dessert: "bg-orange-400/90",
    fortified: "bg-purple-500/90",
  };

  return (
    <div className="pt-4 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white px-4 pb-4 pt-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900">Marketplace</h1>
          <span className="text-xs text-slate-500">{filtered.length} wines</span>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              type="text"
              placeholder="Search wines, producers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-consumer/20 focus:border-primary-consumer"
            />
          </div>
          <button className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600">tune</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading marketplace...</div>
      ) : (
        <>
          {/* Featured Carousel */}
          {featured.length > 0 && !search && typeFilter === "all" && (
            <div className="mb-6 px-4">
              <div className="mb-3">
                <h2 className="text-sm font-bold text-slate-900">Featured</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {featured.map((wine: any) => (
                  <Link
                    key={wine.id}
                    href={`/wallet/browse/${wine.id}`}
                    className="flex-shrink-0 w-[200px] rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm"
                  >
                    <div className="h-28 bg-gradient-to-br from-primary-consumer via-[#912448] to-[#4d0d22] flex items-center justify-center relative">
                      <span className="material-symbols-outlined text-white/20 text-5xl">wine_bar</span>
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${typeBadgeColors[wine.wineData.type] || "bg-slate-500"}`}>
                          {wine.wineData.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-bold text-slate-900 truncate">{wine.wineData.name}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">{wine.wineData.producer}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-primary-consumer">${wine.wineData.currentValue.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">{wine.wineData.vintage}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Type Filter Pills */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
            {["all", "red", "white", "sparkling", "rosé", "dessert", "fortified"].map((t: any) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  typeFilter === t
                    ? "bg-primary-consumer text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Wine Grid (2-column) */}
          <div className="grid grid-cols-2 gap-3 px-4 mt-2">
            {filtered.map((wine: any) => {
              const d = wine.wineData;
              const roi = d.purchasePrice > 0
                ? ((d.currentValue - d.purchasePrice) / d.purchasePrice) * 100
                : 0;
              return (
                <Link
                  key={wine.id}
                  href={`/wallet/browse/${wine.id}`}
                  className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.97] transition-transform"
                >
                  <div className="h-28 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center relative">
                    <span className="material-symbols-outlined text-primary-consumer/20 text-4xl">wine_bar</span>
                    <div className="absolute top-2 left-2">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white ${typeBadgeColors[d.type] || "bg-slate-500"}`}>
                        {d.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{d.name}</h3>
                    <p className="text-[10px] text-slate-500 truncate">{d.producer} · {d.vintage}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-primary-consumer">${d.currentValue.toLocaleString()}</span>
                      <span className={`text-[10px] font-semibold ${roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {roi >= 0 ? "+" : ""}{roi.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
