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
      <div className="text-center py-12 text-slate-400 text-sm">
        Loading portfolio...
      </div>
    );

  const totalValue = wines.reduce(
    (sum, w) => sum + w.wineData.currentValue * w.wineData.quantity,
    0
  );
  const totalCost = wines.reduce(
    (sum, w) => sum + w.wineData.purchasePrice * w.wineData.quantity,
    0
  );
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
      roi:
        ((w.wineData.currentValue - w.wineData.purchasePrice) /
          w.wineData.purchasePrice) *
        100,
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

  const sortedTypes = Object.entries(byType).sort(
    (a, b) => b[1].value - a[1].value
  );

  let cumulativePercent = 0;
  const donutSegments = sortedTypes.map(([type, data]) => {
    const pct = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
    const startAngle = cumulativePercent * 3.6;
    cumulativePercent += pct;
    return {
      type,
      pct,
      color: typeColors[type] || "#94a3b8",
      startAngle,
    };
  });

  return (
    <div className="px-4 pt-6 max-w-md mx-auto pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Portfolio</h1>
        <p className="text-xs text-slate-500">Investment performance</p>
      </div>

      {/* 2x2 Summary Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-primary-consumer rounded-2xl p-4 text-white">
          <div className="text-white/60 text-[10px] uppercase tracking-wider font-semibold">
            Total Value
          </div>
          <div className="text-xl font-bold mt-1">
            ${totalValue.toLocaleString()}
          </div>
        </div>
        <div className="bg-primary-consumer rounded-2xl p-4 text-white">
          <div className="text-white/60 text-[10px] uppercase tracking-wider font-semibold">
            Cost Basis
          </div>
          <div className="text-xl font-bold mt-1">
            ${totalCost.toLocaleString()}
          </div>
        </div>
        <div className="bg-primary-consumer rounded-2xl p-4 text-white">
          <div className="text-white/60 text-[10px] uppercase tracking-wider font-semibold">
            Gain / Loss
          </div>
          <div
            className={`text-xl font-bold mt-1 ${
              totalGain >= 0 ? "text-green-300" : "text-red-300"
            }`}
          >
            {totalGain >= 0 ? "+" : ""}${totalGain.toLocaleString()}
          </div>
        </div>
        <div className="bg-primary-consumer rounded-2xl p-4 text-white">
          <div className="text-white/60 text-[10px] uppercase tracking-wider font-semibold">
            Total ROI
          </div>
          <div
            className={`text-xl font-bold mt-1 ${
              totalRoi >= 0 ? "text-green-300" : "text-red-300"
            }`}
          >
            {totalRoi >= 0 ? "+" : ""}{totalRoi.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Allocation by Type */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Allocation by Type
        </h3>
        <div className="flex items-center gap-6">
          {/* Donut chart */}
          <div className="w-28 h-28 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              {(() => {
                let offset = 0;
                return sortedTypes.map(([type, data]) => {
                  const pct =
                    totalValue > 0 ? (data.value / totalValue) * 100 : 0;
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
          {/* Legend */}
          <div className="flex-1 space-y-2">
            {sortedTypes.map(([type, data]) => {
              const pct = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
              return (
                <div key={type} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: typeColors[type] || "#94a3b8",
                      }}
                    />
                    <span className="capitalize text-slate-700">{type}</span>
                  </div>
                  <span className="text-slate-500 font-medium">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Region Distribution */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-4">By Region</h3>
        <div className="space-y-3">
          {Object.entries(byRegion)
            .sort((a, b) => b[1].value - a[1].value)
            .map(([region, data]) => {
              const pct = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
              return (
                <div key={region}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      {region}
                    </span>
                    <span className="text-slate-500">
                      ${data.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-consumer"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Top Performers
        </h3>
        <div className="space-y-3">
          {topPerformers.map((wine, i) => (
            <div key={wine.id} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary-consumer/10 flex items-center justify-center text-xs font-bold text-primary-consumer">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {wine.wineData.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {wine.wineData.producer}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">
                  ${wine.wineData.currentValue.toLocaleString()}
                </div>
                <div
                  className={`text-[10px] font-semibold ${
                    wine.roi >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
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
