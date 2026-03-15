'use client';

import { useState, useEffect } from "react";
import type { Wine } from "@/types/dual";
import WineCard from "@/components/wine/WineCard";
import { Wine as WineIcon, TrendingUp, Package, DollarSign } from "lucide-react";

export default function CellarPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/wines")
      .then((r) => r.json())
      .then((data) => {
        // Consumer cellar: show user-001's wines
        setWines(data.filter((w: Wine) => w.ownerId === "user-001"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? wines : wines.filter((w) => w.wineData.type === filter);
  const totalValue = wines.reduce((sum, w) => sum + w.wineData.currentValue * w.wineData.quantity, 0);
  const totalBottles = wines.reduce((sum, w) => sum + w.wineData.quantity, 0);
  const avgRoi = wines.length > 0
    ? wines.reduce((sum, w) => sum + ((w.wineData.currentValue - w.wineData.purchasePrice) / w.wineData.purchasePrice) * 100, 0) / wines.length
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">My Cellar</h1>
        <p className="text-stone-500">Your tokenised wine collection</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-wine-50 flex items-center justify-center">
              <WineIcon className="w-5 h-5 text-wine-600" />
            </div>
            <span className="text-sm text-stone-500">Wines</span>
          </div>
          <div className="text-2xl font-bold text-stone-900">{wines.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-stone-500">Bottles</span>
          </div>
          <div className="text-2xl font-bold text-stone-900">{totalBottles}</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gold-600" />
            </div>
            <span className="text-sm text-stone-500">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-stone-900">${totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-stone-500">Avg ROI</span>
          </div>
          <div className={`text-2xl font-bold ${avgRoi >= 0 ? "text-green-600" : "text-red-600"}`}>
            {avgRoi >= 0 ? "+" : ""}{avgRoi.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {["all", "red", "white", "sparkling", "rosé", "dessert", "fortified"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === t ? "bg-wine-700 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Wine Grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-400">Loading cellar...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">No wines found</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((wine) => (
            <WineCard key={wine.id} wine={wine} />
          ))}
        </div>
      )}
    </div>
  );
}
