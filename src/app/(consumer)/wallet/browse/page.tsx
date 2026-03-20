'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Wine } from "@/types/dual";

function truncateHash(hash: string, length: number = 8): string {
  if (!hash) return '';
  return hash.length > length ? `${hash.slice(0, length)}...` : hash;
}

export default function MarketplacePage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/wines")
      .then((r: any) => r.json())
      .then((data: any) => {
        setWines(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = wines
    .filter((w: any) => typeFilter === "all" || w.wineData.type === typeFilter)
    .filter(
      (w: any) =>
        !search ||
        w.wineData.name.toLowerCase().includes(search.toLowerCase()) ||
        w.wineData.producer.toLowerCase().includes(search.toLowerCase()) ||
        w.wineData.region.toLowerCase().includes(search.toLowerCase())
    );

  // Featured wines (top 4 by value)
  const featured = [...wines].sort((a: any, b: any) => b.wineData.currentValue - a.wineData.currentValue).slice(0, 4);

  const typeBadgeColors: Record<string, string> = {
    red: "bg-red-600/90",
    white: "bg-amber-500/90",
    sparkling: "bg-yellow-400/90 text-slate-900",
    "rosé": "bg-pink-500/90",
    dessert: "bg-orange-500/90",
    fortified: "bg-purple-600/90",
  };

  return (
    <div className="pt-1 pb-20 bg-background-light min-h-screen">
      {/* DUAL Network Header Banner */}
      <div className="sticky top-0 z-20 wine-gradient px-4 py-2.5 border-b border-gold-500/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gold-400 text-sm">verified</span>
            <span className="text-white font-semibold">DUAL Network</span>
            <span className="text-white/40">·</span>
            <span className="text-white/70">{wines.length} Wine Tokens</span>
            <span className="text-white/40">·</span>
            <span className="text-gold-300 font-medium">DUAL</span>
          </div>
          <a
            href="https://32f.blockv.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-400 hover:text-gold-300 transition"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
      </div>

      {/* Sticky Header */}
      <div className="sticky top-11 z-10 bg-white px-4 pb-4 pt-3 shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900">Wine Tokens</h1>
          <span className="text-xs text-slate-500">{filtered.length} tokens</span>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              type="text"
              placeholder="Search tokens..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-consumer/20 focus:border-primary-consumer"
            />
          </div>
          <button className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <span className="material-symbols-outlined text-slate-600">tune</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading wine tokens...</div>
      ) : (
        <>
          {/* Featured Carousel */}
          {featured.length > 0 && !search && typeFilter === "all" && (
            <div className="mb-6 px-4 mt-4">
              <div className="mb-3">
                <h2 className="text-sm font-bold text-slate-900">Premium Tokens</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {featured.map((wine: any) => (
                  <Link
                    key={wine.id}
                    href={`/wallet/browse/${wine.id}`}
                    className="flex-shrink-0 w-[220px] rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md hover:shadow-lg hover:border-primary-consumer/30 transition-all active:scale-[0.97]"
                  >
                    <div className="h-40 bg-gradient-to-b from-wine-50 to-white flex flex-col items-center justify-center relative p-4 border-b border-slate-100">
                      {wine.wineData.imageUrl ? (
                        <img
                          src={wine.wineData.imageUrl}
                          alt={wine.wineData.name}
                          className="h-28 w-auto object-contain"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-primary-consumer/20 text-6xl">wine_bar</span>
                      )}
                      <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${typeBadgeColors[wine.wineData.type] || "bg-slate-600"}`}>
                          {wine.wineData.type}
                        </span>
                        {wine.status === 'anchored' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-gold-700 bg-gold-50 border border-gold-200 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">verified</span>
                            ANCHORED
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-xs font-bold text-slate-900 flex-1">{wine.wineData.name}</h3>
                        {wine.objectId && (
                          <span className="text-[8px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                            #{truncateHash(wine.objectId, 6)}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mb-3">{wine.wineData.producer} · {wine.wineData.vintage}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary-consumer">${wine.wineData.currentValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Type Filter Pills */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide mt-2">
            {["all", "red", "white", "sparkling", "rosé", "dessert", "fortified"].map((t: any) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  typeFilter === t
                    ? "bg-primary-consumer text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Wine Grid (responsive) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-4 mt-2">
            {filtered.map((wine: any) => {
              const d = wine.wineData;
              return (
                <Link
                  key={wine.id}
                  href={`/wallet/browse/${wine.id}`}
                  className="rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-primary-consumer/30 shadow-sm hover:shadow-md active:scale-[0.97] transition-all"
                >
                  <div className="h-32 bg-gradient-to-b from-wine-50 to-white flex flex-col items-center justify-center relative p-3 border-b border-slate-100">
                    {d.imageUrl ? (
                      <img
                        src={d.imageUrl}
                        alt={d.name}
                        className="h-20 w-auto object-contain"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-primary-consumer/15 text-4xl">wine_bar</span>
                    )}
                    <div className="absolute top-1.5 left-1.5">
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white ${typeBadgeColors[d.type] || "bg-slate-600"}`}>
                        {d.type}
                      </span>
                    </div>
                    {wine.status === 'anchored' && (
                      <div className="absolute top-1.5 right-1.5">
                        <div className="w-5 h-5 rounded-full bg-gold-50 border border-gold-300 flex items-center justify-center">
                          <span className="material-symbols-outlined text-gold-600 text-xs">verified</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{d.name}</h3>
                    <p className="text-[9px] text-slate-500 truncate">{d.producer}</p>
                    {wine.contentHash && (
                      <p className="text-[7px] text-slate-400 font-mono mt-1 truncate">{truncateHash(wine.contentHash, 12)}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-primary-consumer">${d.currentValue.toLocaleString()}</span>
                      <span className="text-[9px] text-slate-400">{d.vintage}</span>
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
