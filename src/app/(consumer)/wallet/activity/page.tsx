'use client';

import { useState, useEffect } from "react";
import type { Action } from "@/types/dual";

const actionConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  MINT: { label: "Wine Tokenised", icon: "verified", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  LIST: { label: "Listed for Sale", icon: "sell", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  PURCHASE: { label: "Wine Purchased", icon: "shopping_bag", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  TRANSFER: { label: "Ownership Transferred", icon: "swap_horiz", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  REDEEM: { label: "Wine Redeemed", icon: "redeem", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  VERIFY: { label: "Authenticity Verified", icon: "verified_user", color: "text-[#C5A059]", bg: "bg-[#C5A059]/10 border-[#C5A059]/20" },
  STORE: { label: "Storage Updated", icon: "warehouse", color: "text-white/50", bg: "bg-white/5 border-white/10" },
  UPDATE_VALUATION: { label: "Valuation Updated", icon: "trending_up", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  BURN: { label: "Token Burned", icon: "local_fire_department", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
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
    <div className="min-h-screen px-4 md:px-8 lg:px-12 pb-20 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="pt-8 md:pt-12 mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-semibold block mb-2">Transaction History</span>
        <h1 className="text-3xl md:text-5xl font-serif italic text-white">Activity</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8">
        {(["all", "purchases", "transfers", "valuations"] as const).map((f: any) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold transition-all ${
              filter === f
                ? "bg-[#791b3a] text-white border border-[#791b3a]"
                : "bg-white/[0.03] text-white/30 border border-white/[0.06] hover:text-white/50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-white/[0.03]" />
              <div className="flex-1 bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                <div className="h-4 bg-white/[0.03] rounded w-1/3 mb-2" />
                <div className="h-3 bg-white/[0.02] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-white/10">history</span>
          </div>
          <p className="text-white/30 text-sm font-serif italic">No activity yet</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-6 bottom-6 w-px bg-white/[0.06]" />

          <div className="space-y-4">
            {filtered.map((action: any) => {
              const config = actionConfig[action.type] || {
                label: action.type,
                icon: "history",
                color: "text-white/40",
                bg: "bg-white/5 border-white/10",
              };

              return (
                <div key={action.id} className="grid grid-cols-[40px_1fr] gap-3 items-start">
                  {/* Icon */}
                  <div className="flex justify-center relative z-10">
                    <div className={`w-10 h-10 rounded-full ${config.bg} border flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-lg ${config.color}`}>{config.icon}</span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] hover:border-white/[0.08] transition">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-serif italic text-white/70">{config.label}</span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                          action.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : action.status === "failed"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : action.status === "processing"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {action.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/20 font-mono mb-1">
                      {action.wineId.slice(0, 16)}...
                    </div>
                    <div className="text-[10px] text-white/15">
                      {new Date(action.createdAt).toLocaleString()}
                    </div>
                    {action.params && Object.keys(action.params).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/[0.04]">
                        <div className="text-[9px] text-white/15 font-mono">
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
