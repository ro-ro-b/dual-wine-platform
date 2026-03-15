'use client';

import { useState, useEffect } from "react";
import type { Wine } from "@/types/dual";
import Link from "next/link";
import { Package, Search, Shield, ExternalLink } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-stone-100 text-stone-600",
  minted: "bg-blue-100 text-blue-700",
  anchoring: "bg-amber-100 text-amber-700",
  anchored: "bg-green-100 text-green-700",
  listed: "bg-purple-100 text-purple-700",
  sold: "bg-wine-100 text-wine-700",
  redeemed: "bg-stone-100 text-stone-600",
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Wine Inventory</h1>
          <p className="text-stone-500">Manage all tokenised wines on the platform</p>
        </div>
        <Link
          href="/admin/mint"
          className="px-5 py-2.5 rounded-lg gold-gradient text-wine-950 font-semibold text-sm hover:opacity-90 transition"
        >
          + Mint New Wine
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none"
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
        <div className="text-center py-12 text-stone-400">Loading inventory...</div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Wine</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Vintage</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Qty</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Value</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Verified</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((wine) => (
                <tr key={wine.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                  <td className="px-5 py-4">
                    <div className="font-medium text-sm text-stone-900">{wine.wineData.name}</div>
                    <div className="text-xs text-stone-500">{wine.wineData.producer}</div>
                  </td>
                  <td className="px-5 py-4 text-sm capitalize text-stone-600">{wine.wineData.type}</td>
                  <td className="px-5 py-4 text-sm text-stone-600">{wine.wineData.vintage}</td>
                  <td className="px-5 py-4 text-sm text-stone-600">{wine.wineData.quantity}</td>
                  <td className="px-5 py-4 text-sm font-medium text-stone-900">${wine.wineData.currentValue.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[wine.status] ?? "bg-stone-100"}`}>
                      {wine.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {wine.anchoredAt ? <Shield className="w-4 h-4 text-green-500" /> : <span className="text-stone-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/wallet/browse/${wine.id}`} className="text-wine-600 hover:text-wine-800 transition">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-stone-400">No wines match your criteria</div>
          )}
        </div>
      )}
    </div>
  );
}
