'use client';

import { useState, useEffect } from "react";
import type { DashboardStats } from "@/types/dual";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-slate-400">Loading dashboard...</div>;
  if (!stats) return <div className="text-center py-12 text-slate-400">Failed to load stats</div>;

  const typeColors: Record<string, string> = {
    red: "bg-primary", white: "bg-slate-300", sparkling: "bg-accent",
    "rosé": "bg-pink-400", dessert: "bg-slate-400", fortified: "bg-slate-200",
  };

  const sortedTypes = [...stats.valueByType].sort((a, b) => b.value - a.value);
  const totalRegionCount = stats.topRegions.reduce((s, r) => s + r.count, 0);

  return (
    <div>
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-8 bg-surface border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Admin</span>
          <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
          <span className="text-primary font-semibold">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
            AD
          </div>
        </div>
      </header>

      <div className="p-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Wines", value: String(stats.totalWines), icon: "wine_bar", iconColor: "text-primary/60", iconBg: "bg-primary/5" },
            { label: "Total Value", value: `$${stats.totalValue.toLocaleString()}`, icon: "payments", iconColor: "text-green-600", iconBg: "bg-green-50" },
            { label: "Total Actions", value: String(stats.totalActions), icon: "history", iconColor: "text-blue-600", iconBg: "bg-blue-50" },
            { label: "Minted", value: String(stats.mintedThisMonth), icon: "verified", iconColor: "text-accent", iconBg: "bg-accent/5" },
            { label: "Active", value: String(stats.activeListings), icon: "sell", iconColor: "text-amber-600", iconBg: "bg-amber-50" },
            { label: "Sales", value: String(stats.recentSales), icon: "shopping_bag", iconColor: "text-purple-600", iconBg: "bg-purple-50" },
          ].map((stat: any) => (
            <div key={stat.label} className="bg-surface p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                <span className={`material-symbols-outlined ${stat.iconColor} ${stat.iconBg} p-1 rounded`}>{stat.icon}</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Regions */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Top Regions</h3>
              <p className="text-slate-500 text-sm">Inventory distribution by region</p>
            </div>
            <div className="space-y-4">
              {stats.topRegions.map((r: any) => {
                const pct = totalRegionCount > 0 ? (r.count / totalRegionCount) * 100 : 0;
                return (
                  <div key={r.region} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>{r.region}</span>
                      <span>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Value by Wine Type */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Value by Wine Type</h3>
              <p className="text-slate-500 text-sm">Financial breakdown by varietal category</p>
            </div>
            <div className="space-y-6">
              {/* Stacked bar */}
              <div className="w-full h-8 flex rounded-lg overflow-hidden border border-slate-100">
                {sortedTypes.map((item: any) => {
                  const pct = stats.totalValue > 0 ? (item.value / stats.totalValue) * 100 : 0;
                  return (
                    <div
                      key={item.type}
                      className={`${typeColors[item.type] ?? "bg-slate-200"} h-full`}
                      style={{ width: `${pct}%` }}
                      title={`${item.type}: $${item.value.toLocaleString()}`}
                    />
                  );
                })}
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sortedTypes.map((item: any) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${typeColors[item.type] ?? "bg-slate-200"}`} />
                    <div className="text-xs">
                      <p className="text-slate-500 font-medium capitalize">{item.type}</p>
                      <p className="font-bold text-slate-900">${item.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* DUAL Network Integration */}
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">hub</span>
            <h3 className="text-lg font-bold text-slate-900">DUAL Network Integration</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">API Status</p>
                <p className="text-slate-900 font-semibold italic text-sm">Demo Mode</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Blockchain</p>
                <p className="text-slate-900 font-semibold text-sm">Not Connected</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Webhooks</p>
                <p className="text-slate-900 font-semibold text-sm">SSE Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
