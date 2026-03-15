'use client';

import { useState, useEffect } from "react";
import type { DashboardStats } from "@/types/dual";
import { Wine, DollarSign, Activity, TrendingUp, ShoppingBag, BarChart3, Grape } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-stone-400">Loading dashboard...</div>;
  if (!stats) return <div className="text-center py-12 text-stone-400">Failed to load stats</div>;

  const typeColors: Record<string, string> = {
    red: "bg-red-500", white: "bg-amber-400", sparkling: "bg-yellow-400",
    "rosé": "bg-pink-400", dessert: "bg-orange-400", fortified: "bg-purple-500",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Admin Dashboard</h1>
        <p className="text-stone-500">Overview of your wine tokenisation platform</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <Wine className="w-5 h-5 text-wine-600 mb-2" />
          <div className="text-2xl font-bold text-stone-900">{stats.totalWines}</div>
          <div className="text-xs text-stone-500">Total Wines</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <DollarSign className="w-5 h-5 text-green-600 mb-2" />
          <div className="text-2xl font-bold text-stone-900">${stats.totalValue.toLocaleString()}</div>
          <div className="text-xs text-stone-500">Total Value</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <Activity className="w-5 h-5 text-blue-600 mb-2" />
          <div className="text-2xl font-bold text-stone-900">{stats.totalActions}</div>
          <div className="text-xs text-stone-500">Total Actions</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <Grape className="w-5 h-5 text-purple-600 mb-2" />
          <div className="text-2xl font-bold text-stone-900">{stats.mintedThisMonth}</div>
          <div className="text-xs text-stone-500">Minted This Month</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <ShoppingBag className="w-5 h-5 text-amber-600 mb-2" />
          <div className="text-2xl font-bold text-stone-900">{stats.activeListings}</div>
          <div className="text-xs text-stone-500">Active Listings</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
          <div className="text-2xl font-bold text-stone-900">{stats.recentSales}</div>
          <div className="text-xs text-stone-500">Recent Sales</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Regions */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-900 mb-4">Top Regions</h3>
          <div className="space-y-3">
            {stats.topRegions.map((r, i) => (
              <div key={r.region} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-wine-50 flex items-center justify-center text-sm font-bold text-wine-700">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-stone-700">{r.region}</span>
                    <span className="text-stone-500">{r.count} wines</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-wine-500 rounded-full" style={{ width: `${(r.count / stats.totalWines) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Value by Type */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-900 mb-4">Value by Wine Type</h3>
          <div className="space-y-3">
            {stats.valueByType.sort((a, b) => b.value - a.value).map((item) => {
              const pct = stats.totalValue > 0 ? (item.value / stats.totalValue * 100) : 0;
              return (
                <div key={item.type}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize font-medium text-stone-700">{item.type}</span>
                    <span className="text-stone-500">${item.value.toLocaleString()} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${typeColors[item.type] ?? "bg-stone-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DUAL Network Status */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 lg:col-span-2">
          <h3 className="font-semibold text-stone-900 mb-4">DUAL Network Integration</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-stone-50 rounded-lg p-4">
              <div className="text-sm font-medium text-stone-700 mb-1">API Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-stone-600">Demo Mode</span>
              </div>
              <p className="text-xs text-stone-400 mt-2">Configure DUAL_CONFIGURED=true to connect to the live network</p>
            </div>
            <div className="bg-stone-50 rounded-lg p-4">
              <div className="text-sm font-medium text-stone-700 mb-1">Blockchain</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm text-stone-600">Not Connected</span>
              </div>
              <p className="text-xs text-stone-400 mt-2">Requires DUAL API credentials</p>
            </div>
            <div className="bg-stone-50 rounded-lg p-4">
              <div className="text-sm font-medium text-stone-700 mb-1">Webhooks</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm text-stone-600">SSE Ready</span>
              </div>
              <p className="text-xs text-stone-400 mt-2">Real-time events will appear when connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
