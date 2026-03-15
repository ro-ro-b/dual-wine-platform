'use client';

import { useState, useEffect } from "react";
import type { Wine } from "@/types/dual";
import Link from "next/link";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  minted: "bg-blue-100 text-blue-700",
  anchoring: "bg-amber-100 text-amber-700",
  anchored: "bg-green-100 text-green-700",
  listed: "bg-purple-100 text-purple-700",
  sold: "bg-primary/10 text-primary",
  transferred: "bg-indigo-100 text-indigo-700",
  redeemed: "bg-slate-100 text-slate-600",
  burned: "bg-red-100 text-red-700",
};

export default function InventoryPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/wines")
      .then((r) => r.json())
      .then((data) => { setWines(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = wines
    .filter((w) => statusFilter === "all" || w.status === statusFilter)
    .filter((w) => !search || w.wineData.name.toLowerCase().includes(search.toLowerCase()) || w.id.includes(search));

  return (
    <div>
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-8 bg-surface border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Admin</span>
          <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
          <span className="text-primary font-semibold">Inventory</span>
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

      <div className="p-8">
        {/* Title + Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Wine Inventory</h1>
            <p className="text-sm text-slate-500">{wines.length} total wines</p>
          </div>
          <Link
            href="/admin/mint"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-white font-semibold text-sm shadow-sm hover:opacity-90 transition"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Mint Wine
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
          >
            <option value="all">All Statuses</option>
            <option value="minted">Minted</option>
            <option value="anchored">Anchored</option>
            <option value="listed">Listed</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading inventory...</div>
        ) : (
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wine</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vintage</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Value</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified</th>
                  <th className="text-left px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((wine) => (
                  <tr key={wine.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4">
                      <div className="font-medium text-sm text-slate-900">{wine.wineData.name}</div>
                      <div className="text-xs text-slate-500">{wine.wineData.producer}</div>
                    </td>
                    <td className="px-5 py-4 text-sm capitalize text-slate-600">{wine.wineData.type}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{wine.wineData.vintage}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{wine.wineData.quantity}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">${wine.wineData.currentValue.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[wine.status] ?? "bg-slate-100"}`}>
                        {wine.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {wine.anchoredAt ? (
                        <span className="material-symbols-outlined text-green-500 text-lg">verified</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/wallet/browse/${wine.id}`} className="text-primary/60 hover:text-primary transition">
                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">No wines match your criteria</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
