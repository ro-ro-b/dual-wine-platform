'use client';

import { useState, useEffect } from "react";
import type { Wine } from "@/types/dual";
import Link from "next/link";

function truncateHash(hash: string, length: number = 8): string {
  if (!hash) return '';
  return hash.length > length ? `${hash.slice(0, length)}...` : hash;
}

const statusColors: Record<string, string> = {
  draft: "bg-white/10 text-white/50",
  minted: "bg-gold-dim/15 text-gold-dim",
  anchoring: "bg-amber-500/15 text-amber-400",
  anchored: "bg-green-500/15 text-green-400",
  listed: "bg-purple-500/15 text-purple-400",
  sold: "bg-blue-500/15 text-blue-400",
  transferred: "bg-cyan-500/15 text-cyan-400",
  redeemed: "bg-white/10 text-white/50",
  burned: "bg-red-500/15 text-red-400",
};

export default function InventoryPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/wines")
      .then((r: any) => r.json())
      .then((data: any) => { setWines(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = wines
    .filter((w: any) => statusFilter === "all" || w.status === statusFilter)
    .filter((w: any) => !search || w.wineData.name.toLowerCase().includes(search.toLowerCase()) || w.id.includes(search));

  const anchoredCount = wines.filter((w: any) => w.status === 'anchored').length;
  const mintedCount = wines.filter((w: any) => w.status === 'minted').length;
  const totalValue = wines.reduce((sum: number, w: any) => sum + (w.wineData.currentValue || 0), 0);

  return (
    <section className="flex-1 overflow-y-auto px-6 py-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-burgundy-accent flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-gold-dim text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  inventory_2
                </span>
              </div>
              <span className="text-sm font-semibold text-gold-dim">Token Inventory</span>
            </div>
            <div className="pl-11">
              <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
                Wine Token Registry
              </h2>
              <p className="text-white/50 mt-1">
                Manage DUAL Network wine provenance tokens
              </p>
            </div>
          </div>
          <Link
            href="/admin/mint"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-burgundy-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-burgundy-accent/80 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Mint Token
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 pl-11">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Total Tokens</div>
            <div className="text-3xl font-bold text-white font-mono">{wines.length}</div>
            <div className="text-[10px] text-white/30 mt-2">All inventory</div>
          </div>
          <div className="bg-green-500/5 backdrop-blur-xl rounded-2xl p-5 border border-green-500/20">
            <div className="text-[10px] text-green-400/70 uppercase tracking-widest font-bold mb-2">Anchored</div>
            <div className="text-3xl font-bold text-green-400 font-mono">{anchoredCount}</div>
            <div className="text-[10px] text-green-400/40 mt-2">Verified on chain</div>
          </div>
          <div className="bg-gold-dim/5 backdrop-blur-xl rounded-2xl p-5 border border-gold-dim/20">
            <div className="text-[10px] text-gold-dim/70 uppercase tracking-widest font-bold mb-2">Minted</div>
            <div className="text-3xl font-bold text-gold-dim font-mono">{mintedCount}</div>
            <div className="text-[10px] text-gold-dim/40 mt-2">Ready to anchor</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Total Value</div>
            <div className="text-3xl font-bold text-white font-mono">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-[10px] text-white/30 mt-2">USD value</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 pl-11">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xl">search</span>
            <input
              type="text"
              placeholder="Search tokens by name or ID..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-dim/20 focus:border-gold-dim/30 backdrop-blur-xl"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white/70 focus:outline-none focus:ring-2 focus:ring-gold-dim/20 backdrop-blur-xl"
          >
            <option value="all" className="bg-vault-bg">All Statuses</option>
            <option value="minted" className="bg-vault-bg">Minted</option>
            <option value="anchored" className="bg-vault-bg">Anchored</option>
            <option value="listed" className="bg-vault-bg">Listed</option>
            <option value="sold" className="bg-vault-bg">Sold</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-gold-dim border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="pl-11">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Token</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Type</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Vintage</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Units</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Value</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Status</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Hash</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Links</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((wine: any) => (
                    <tr
                      key={wine.id}
                      className={`border-b border-white/5 transition group ${
                        wine.status === 'anchored'
                          ? 'bg-green-500/[0.03] hover:bg-green-500/[0.06]'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {wine.wineData.imageUrl && (
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <img
                                src={wine.wineData.imageUrl}
                                alt={wine.wineData.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-sm text-white">{wine.wineData.name}</div>
                            <div className="text-xs text-white/40">{wine.wineData.producer}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize text-white/60">{wine.wineData.type}</td>
                      <td className="px-6 py-4 text-sm text-white/60 font-mono">{wine.wineData.vintage}</td>
                      <td className="px-6 py-4 text-sm text-white/60 font-mono">{wine.wineData.quantity}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gold-dim font-mono">
                        ${wine.wineData.currentValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold capitalize tracking-wider ${statusColors[wine.status] ?? "bg-white/10 text-white/50"}`}>
                          {wine.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {wine.contentHash ? (
                          <code className="text-[10px] font-mono text-gold-dim/70 bg-white/5 px-2 py-1 rounded border border-white/10">
                            {truncateHash(wine.contentHash, 12)}
                          </code>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {wine.explorerLinks && (wine.explorerLinks.owner || wine.explorerLinks.contentHash || wine.explorerLinks.integrityHash) ? (
                          <div className="flex items-center gap-2">
                            {wine.explorerLinks.owner && (
                              <a
                                href={wine.explorerLinks.owner}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition"
                                title="View Owner on DUAL"
                              >
                                <span className="material-symbols-outlined text-green-400 text-sm">verified</span>
                              </a>
                            )}
                            {wine.explorerLinks.contentHash && (
                              <a
                                href={wine.explorerLinks.contentHash}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gold-dim/10 hover:bg-gold-dim/20 border border-gold-dim/20 transition"
                                title="View Content Hash on DUAL"
                              >
                                <span className="material-symbols-outlined text-gold-dim text-sm">description</span>
                              </a>
                            )}
                            {wine.explorerLinks.integrityHash && (
                              <a
                                href={wine.explorerLinks.integrityHash}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition"
                                title="View Integrity Hash on DUAL"
                              >
                                <span className="material-symbols-outlined text-purple-400 text-sm">shield</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/wallet/browse/${wine.id}`}
                          className="text-white/30 hover:text-gold-dim transition"
                        >
                          <span className="material-symbols-outlined text-lg">open_in_new</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-white/30 text-sm">No tokens match your criteria</div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
