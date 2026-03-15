'use client';

import Link from "next/link";
import type { Wine } from "@/types/dual";
import { Wine as WineIcon, Shield, TrendingUp, Clock } from "lucide-react";

const typeColors: Record<string, string> = {
  red: "bg-red-100 text-red-700",
  white: "bg-amber-50 text-amber-700",
  sparkling: "bg-yellow-50 text-yellow-700",
  rosé: "bg-pink-50 text-pink-700",
  dessert: "bg-orange-50 text-orange-700",
  fortified: "bg-purple-50 text-purple-700",
};

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

export default function WineCard({ wine, showActions = false }: { wine: Wine; showActions?: boolean }) {
  const roi = wine.wineData.purchasePrice > 0
    ? ((wine.wineData.currentValue - wine.wineData.purchasePrice) / wine.wineData.purchasePrice * 100).toFixed(1)
    : "0";
  const roiPositive = parseFloat(roi) >= 0;

  return (
    <Link href={`/wallet/browse/${wine.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-wine-200 transition-all duration-200">
        {/* Image placeholder */}
        <div className="h-48 wine-gradient flex items-center justify-center relative">
          <WineIcon className="w-16 h-16 text-wine-300/50" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[wine.wineData.type] ?? "bg-stone-100 text-stone-600"}`}>
              {wine.wineData.type}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[wine.status] ?? "bg-stone-100 text-stone-600"}`}>
              {wine.status}
            </span>
          </div>
          {wine.anchoredAt && (
            <div className="absolute top-3 right-3">
              <Shield className="w-5 h-5 text-gold-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-stone-900 group-hover:text-wine-700 transition mb-1">
            {wine.wineData.name}
          </h3>
          <p className="text-sm text-stone-500 mb-3">
            {wine.wineData.producer} · {wine.wineData.region}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-lg font-bold text-stone-900">
                ${wine.wineData.currentValue.toLocaleString()}
              </div>
              <div className="text-xs text-stone-500">per unit · Qty: {wine.wineData.quantity}</div>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${roiPositive ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp className="w-3.5 h-3.5" />
              {roiPositive ? "+" : ""}{roi}%
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-stone-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {wine.wineData.vintage}
            </span>
            <span>{wine.wineData.varietal}</span>
            {wine.wineData.ratings[0] && (
              <span className="ml-auto font-medium text-gold-600">
                {wine.wineData.ratings[0].score}pts
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
