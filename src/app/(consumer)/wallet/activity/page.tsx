'use client';

import { useState, useEffect } from "react";
import type { Action } from "@/types/dual";

const actionConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  MINT: { label: "Wine Tokenised", icon: "verified", color: "text-blue-600", bg: "bg-blue-100" },
  LIST: { label: "Listed for Sale", icon: "sell", color: "text-purple-600", bg: "bg-purple-100" },
  PURCHASE: { label: "Wine Purchased", icon: "shopping_bag", color: "text-green-600", bg: "bg-green-100" },
  TRANSFER: { label: "Ownership Transferred", icon: "swap_horiz", color: "text-indigo-600", bg: "bg-indigo-100" },
  REDEEM: { label: "Wine Redeemed", icon: "redeem", color: "text-amber-600", bg: "bg-amber-100" },
  VERIFY: { label: "Authenticity Verified", icon: "verified_user", color: "text-emerald-600", bg: "bg-emerald-100" },
  STORE: { label: "Storage Updated", icon: "warehouse", color: "text-slate-600", bg: "bg-slate-100" },
  UPDATE_VALUATION: { label: "Valuation Updated", icon: "trending_up", color: "text-orange-600", bg: "bg-orange-100" },
  BURN: { label: "Token Burned", icon: "local_fire_department", color: "text-red-600", bg: "bg-red-100" },
};

type FilterType = "all" | "purchases" | "transfers" | "valuations";

const filterMap: Record<FilterType, string[]> = {
  all: [],
  purchases: ["PURCHASE", "LIST"],
  transfers: ["TRANSFER"],
  valuations: ["UPDATE_VALUATION"],
};

export default function ActivityPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    fetch("/api/actions")
      .then((r) => r.json())
      .then((data) => {
        setActions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? actions : actions.filter((a: any) => filterMap[filter].includes(a.type));

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Activity</h1>
        <p className="text-xs text-slate-500">Recent events on your wines</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "purchases", "transfers", "valuations"] as const).map((f: any) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              filter === f
                ? "bg-primary-consumer text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading activity...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No activity yet</div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-200" />

          <div className="space-y-4">
            {filtered.map((action: any) => {
              const config = actionConfig[action.type] || {
                label: action.type,
                icon: "history",
                color: "text-slate-600",
                bg: "bg-slate-100",
              };

              return (
                <div key={action.id} className="grid grid-cols-[48px_1fr] gap-3 items-start">
                  {/* Icon */}
                  <div className="flex justify-center relative z-10">
                    <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-lg ${config.color}`}>{config.icon}</span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">{config.label}</span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          action.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : action.status === "failed"
                            ? "bg-red-50 text-red-700"
                            : action.status === "processing"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {action.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mb-1">
                      Wine: {action.wineId.slice(0, 12)}...
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(action.createdAt).toLocaleString()}
                    </div>
                    {action.params && Object.keys(action.params).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-50">
                        <div className="text-[10px] text-slate-400">
                          {Object.entries(action.params)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
