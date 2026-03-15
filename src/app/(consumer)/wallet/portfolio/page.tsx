'use client';

import { useState, useEffect } from "react";
import type { Wine, WineType } from "@/types/dual";
import { TrendingUp, PieChart, BarChart3, DollarSign, Wine as WineIcon } from "lucide-react";

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

  if (loading) return <div className="text-center py-12 text-stone-400">Loading portfolio...</div>;

  const totalValue = wines.reduce((sum, w) => sum + w.wineData.currentValue * w.wineData.quantity, 0);
  const totalCost = wines.reduce((sum, w) => sum + w.wineData.purchasePrice * w.wineData.quantity, 0);
  const totalGain = totalValue - totalCost;
  const totalRoi = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  // Group by type
  const byType: Record<string, { count: number; value: number }> = {};
  wines.forEach((w) => {
    const t = w.wineData.type;
    if (!byType[t]) byType[t] = { count: 0, value: 0 };
    byType[t].count += w.wineData.quantity;
    byType[t].value += w.wineData.currentValue * w.wineData.quantity;
  });

  // Group by region
  const byRegion: Record<string, { count: number; value: number }> = {};
  wines.forEach((w) => {
    const r = w.wineData.region;
    if (!byRegion[r]) byRegion[r] = { count: 0, value: 0 };
    byRegion[r].count += w.wineData.quantity;
    byRegion[r].value += w.wineData.currentValue * w.wineData.quantity;
  });

  // Top performers
  const topPerformers = [...wines]
    .map((w) => ({ ...w, roi: ((w.wineData.currentValue - w.wineData.purchasePrice) / w.wineData.purchasePrice) * 100 }))
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5);

  const typeColors: Record<string, string> = {
    red: "bg-red-500", white: "bg-amber-400", sparkling: "bg-yellow-400",
    "rosé": "bg-pink-400", dessert: "bg-orange-400", fortified: "bg-purple-500",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Portfolio Analytics</h1>
        <p className="text-stone-500">Investment performance and allocation overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="text-sm text-stone-500 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-stone-900">${totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="text-sm text-stone-500 mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-stone-900">${totalCost.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="text-sm text-stone-500 mb-1">Total Gain</div>
          <div className={`text-2xl font-bold ${totalGain >= 0 ? "text-green-600" : "text-red-600"}`}>
            {totalGain >= 0 ? "+" : ""}${totalGain.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="text-sm text-stone-500 mb-1">Overall ROI</div>
          <div className={`text-2xl font-bold ${totalRoi >= 0 ? "text-green-600" : "text-red-600"}`}>
            {totalRoi >= 0 ? "+" : ""}{totalRoi.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Allocation by Type */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-wine-600" /> Allocation by Type
          </h3>
          <div className="space-y-3">
            {Object.entries(byType).sort((a, b) => b[1].value - a[1].value).map(([type, data]) => {
              const pct = totalValue > 0 ? (data.value / totalValue * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize font-medium text-stone-700">{type}</span>
                    <span className="text-stone-500">${data.value.toLocaleString()} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${typeColors[type] ?? "bg-stone-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Allocation by Region */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-wine-600" /> Allocation by Region
          </h3>
          <div className="space-y-3">
            {Object.entries(byRegion).sort((a, b) => b[1].value - a[1].value).map(([region, data]) => {
              const pct = totalValue > 0 ? (data.value / totalValue * 100) : 0;
              return (
                <div key={region}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-stone-700">{region}</span>
                    <span className="text-stone-500">${data.value.toLocaleString()} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-wine-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 lg:col-span-2">
          <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" /> Top Performers
          </h3>
          <div className="space-y-3">
            {topPerformers.map((wine, i) => (
              <div key={wine.id} className="flex items-center gap-4 p-3 rounded-lg bg-stone-50">
                <div className="w-8 h-8 rounded-full bg-wine-100 flex items-center justify-center text-sm font-bold text-wine-700">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-stone-900">{wine.wineData.name}</div>
                  <div className="text-xs text-stone-500">{wine.wineData.producer}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-stone-900">${wine.wineData.currentValue.toLocaleString()}</div>
                  <div className={`text-xs font-medium ${wine.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {wine.roi >= 0 ? "+" : ""}{wine.roi.toFixed(1)}% ROI
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
