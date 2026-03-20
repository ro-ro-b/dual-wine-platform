'use client';

import { useState, useEffect } from "react";
import type { Wine } from "@/types/dual";

export default function PortfolioPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wines")
      .then((r) => r.json())
      .then((data) => {
        setWines(data.filter((w: Wine) => w.ownerId === "user-001"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059] animate-spin mx-auto" />
          <p className="text-white/30 text-xs uppercase tracking-[0.3em]">Loading Portfolio</p>
        </div>
      </div>
    );

  const totalValue = wines.reduce((sum, w) => sum + w.wineData.currentValue * w.wineData.quantity, 0);
  const totalCost = wines.reduce((sum, w) => sum + w.wineData.purchasePrice * w.wineData.quantity, 0);
  const totalGain = totalValue - totalCost;
  const totalRoi = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const byType: Record<string, { count: number; value: number }> = {};
  wines.forEach((w: any) => {
    const t = w.wineData.type;
    if (!byType[t]) byType[t] = { count: 0, value: 0 };
    byType[t].count += w.wineData.quantity;
    byType[t].value += w.wineData.currentValue * w.wineData.quantity;
  });

  const byRegion: Record<string, { count: number; value: number }> = {};
  wines.forEach((w: any) => {
    const r = w.wineData.region;
    if (!byRegion[r]) byRegion[r] = { count: 0, value: 0 };
    byRegion[r].count += w.wineData.quantity;
    byRegion[r].value += w.wineData.currentValue * w.wineData.quantity;
  });

  const topPerformers = [...wines]
    .map((w: any) => ({
      ...w,
      roi: ((w.wineData.currentValue - w.wineData.purchasePrice) / w.wineData.purchasePrice) * 100,
    }))
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5);

  const typeColors: Record<string, string> = {
    red: "#791b3a",
    white: "#d4af37",
    sparkling: "#eab308",
    "rosé": "#ec4899",
    dessert: "#f97316",
    fortified: "#8b5cf6",
  };

  const sortedTypes = Object.entries(byType).sort((a, b) => b[1].value - a[1].value);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 pb-20 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="pt-8 md:pt-12 mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-semibold block mb-2">Investment Analytics</span>
        <h1 className="text-3xl md:text-5xl font-serif italic text-white">Portfolio</h1>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { label: 'Total Value', value: `$${totalValue.toLocaleString()}`, accent: true },
          { label: 'Cost Basis', value: `$${totalCost.toLocaleString()}` },
          { label: 'Gain / Loss', value: `${totalGain >= 0 ? '+' : ''}$${totalGain.toLocaleString()}`, isGain: true },
          { label: 'Total ROI', value: `${totalRoi >= 0 ? '+' : ''}${totalRoi.toFixed(1)}%`, isGain: true },
        ].map((stat) => (
          <div key={stat.label} className="relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D0A15] to-[#1a0510]" />
            <div className="relative p-4 md:p-5">
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-2">{stat.label}</div>
              <div className={`text-xl md:text-2xl font-serif italic ${
                stat.accent ? 'text-[#C5A059]' :
                (stat as any).isGain ? (totalGain >= 0 ? 'text-emerald-400' : 'text-red-400') :
                'text-white'
              }`}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts — side by side on desktop */}
      <div className="md:grid md:grid-cols-2 md:gap-4 mb-6">
        {/* Allocation by Type */}
        <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.05] mb-4 md:mb-0">
          <h3 className="text-sm font-serif italic text-white mb-4">Allocation by Type</h3>
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                {(() => {
                  let offset = 0;
                  return sortedTypes.map(([type, data]) => {
                    const pct = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
                    const segment = (
                      <circle
                        key={type}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="transparent"
                        stroke={typeColors[type] || "#94a3b8"}
                        strokeWidth="3"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeDashoffset={`${-offset}`}
                        className="transition-all duration-500"
                      />
                    );
                    offset += pct;
                    return segment;
                  });
                })()}
              </svg>
            </div>
            <div className="flex-1 space-y-2.5">
              {sortedTypes.map(([type, data]) => {
                const pct = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
                return (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: typeColors[type] || "#94a3b8" }} />
                      <span className="capitalize text-white/50">{type}</span>
                    </div>
                    <span className="text-white/30 font-mono text-[11px]">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Region Distribution */}
        <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.05] mb-4 md:mb-0">
          <h3 className="text-sm font-serif italic text-white mb-4">By Region</h3>
          <div className="space-y-3">
            {Object.entries(byRegion)
              .sort((a, b) => b[1].value - a[1].value)
              .map(([region, data]) => {
                const pct = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
                return (
                  <div key={region}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-white/50">{region}</span>
                      <span className="text-white/30 font-mono text-[11px]">${data.value.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#791b3a] to-[#C5A059]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.05]">
        <h3 className="text-sm font-serif italic text-white mb-4">Top Performers</h3>
        <div className="space-y-3">
          {topPerformers.map((wine, i) => (
            <div key={wine.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition">
              <div className="w-7 h-7 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[10px] font-bold text-[#C5A059] font-mono">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-serif italic text-white/70 truncate">{wine.wineData.name}</div>
                <div className="text-[10px] text-white/25">{wine.wineData.producer}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-serif italic text-[#C5A059]">${wine.wineData.currentValue.toLocaleString()}</div>
                <div className={`text-[10px] font-semibold ${wine.roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {wine.roi >= 0 ? "+" : ""}{wine.roi.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
