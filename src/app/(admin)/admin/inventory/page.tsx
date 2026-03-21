'use client';

import { useState, useEffect, useMemo } from "react";
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

type SortKey = 'name' | 'type' | 'vintage' | 'quantity' | 'value' | 'status';
type SortDir = 'asc' | 'desc';

/* ── Skeleton Rows ── */
function SkeletonTable() {
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden animate-fade-in">
      <div className="border-b border-white/10 px-6 py-4 flex gap-6">
        {[120, 60, 60, 40, 80, 70, 90, 60, 40].map((w, i) => (
          <div key={i} className="skeleton h-3 rounded" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 w-[180px]">
            <div className="skeleton w-8 h-8 rounded-lg" />
            <div className="space-y-1.5">
              <div className="skeleton w-24 h-3 rounded" />
              <div className="skeleton w-16 h-2 rounded" />
            </div>
          </div>
          <div className="skeleton w-12 h-3 rounded" />
          <div className="skeleton w-10 h-3 rounded" />
          <div className="skeleton w-8 h-3 rounded" />
          <div className="skeleton w-16 h-3 rounded" />
          <div className="skeleton w-16 h-5 rounded-full" />
          <div className="skeleton w-20 h-4 rounded" />
          <div className="flex gap-1.5">
            <div className="skeleton w-7 h-7 rounded-lg" />
            <div className="skeleton w-7 h-7 rounded-lg" />
          </div>
          <div className="skeleton w-5 h-5 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="text-center py-20 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-white/20 text-3xl">
          {hasFilter ? "filter_alt_off" : "inventory_2"}
        </span>
      </div>
      <h3 className="text-white/40 font-semibold mb-1">
        {hasFilter ? "No matching tokens" : "No tokens yet"}
      </h3>
      <p className="text-white/20 text-sm max-w-xs mx-auto">
        {hasFilter
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Start building your portfolio by minting your first wine token."}
      </p>
      {!hasFilter && (
        <Link
          href="/admin/mint"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2 rounded-xl bg-burgundy-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-burgundy-accent/80 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Mint First Token
        </Link>
      )}
    </div>
  );
}

/* ── Sort Header ── */
function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = currentSort === sortKey;
  return (
    <th
      className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest cursor-pointer select-none hover:text-white/50 transition-colors group"
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={`material-symbols-outlined text-[12px] transition-all ${active ? 'text-gold-dim/60' : 'text-transparent group-hover:text-white/20'}`}>
          {active && currentDir === 'desc' ? 'arrow_downward' : 'arrow_upward'}
        </span>
      </span>
    </th>
  );
}

/* ── Main Inventory Page ── */
export default function InventoryPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    fetch("/api/wines")
      .then((r: any) => r.json())
      .then((data: any) => { setWines(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let result = wines
      .filter((w: any) => statusFilter === "all" || w.status === statusFilter)
      .filter((w: any) => !search || w.wineData.name.toLowerCase().includes(search.toLowerCase()) || w.id.includes(search));

    result.sort((a: any, b: any) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'name': return dir * a.wineData.name.localeCompare(b.wineData.name);
        case 'type': return dir * (a.wineData.type || '').localeCompare(b.wineData.type || '');
        case 'vintage': return dir * ((a.wineData.vintage || 0) - (b.wineData.vintage || 0));
        case 'quantity': return dir * ((a.wineData.quantity || 0) - (b.wineData.quantity || 0));
        case 'value': return dir * ((a.wineData.currentValue || 0) - (b.wineData.currentValue || 0));
        case 'status': return dir * (a.status || '').localeCompare(b.status || '');
        default: return 0;
      }
    });

    return result;
  }, [wines, statusFilter, search, sortKey, sortDir]);

  const anchoredCount = wines.filter((w: any) => w.status === 'anchored').length;
  const mintedCount = wines.filter((w: any) => w.status === 'minted').length;
  const totalValue = wines.reduce((sum: number, w: any) => sum + (w.wineData.currentValue || 0), 0);

  const statuses = ['all', 'minted', 'anchored', 'listed', 'sold'];

  return (
    <section className="flex-1 overflow-y-auto px-6 py-10 lg:px-12">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* Page Title */}
        <div className="flex items-center justify-between animate-fade-in-up">
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
              <p className="text-white/40 mt-1 text-sm">
                {wines.length} tokens · ${totalValue.toLocaleString()} total value
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
        <div className="grid grid-cols-4 gap-3 pl-11 stagger-children">
          <div className="glass-card-hover p-4">
            <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1.5">Total Tokens</div>
            <div className="text-2xl font-bold text-white font-mono">{wines.length}</div>
          </div>
          <div className="glass-card-hover p-4 !border-green-500/15 !bg-green-500/[0.03]">
            <div className="text-[9px] text-green-400/50 uppercase tracking-widest font-bold mb-1.5">Anchored</div>
            <div className="text-2xl font-bold text-green-400 font-mono">{anchoredCount}</div>
          </div>
          <div className="glass-card-hover p-4 !border-gold-dim/15 !bg-gold-dim/[0.03]">
            <div className="text-[9px] text-gold-dim/50 uppercase tracking-widest font-bold mb-1.5">Minted</div>
            <div className="text-2xl font-bold text-gold-dim font-mono">{mintedCount}</div>
          </div>
          <div className="glass-card-hover p-4">
            <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1.5">Total Value</div>
            <div className="text-2xl font-bold text-white font-mono">${totalValue.toLocaleString()}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 pl-11 animate-fade-in" style={{ animationDelay: "150ms" }}>
          {/* Status chips */}
          <div className="flex gap-1.5">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  statusFilter === s
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-white/30 border border-transparent hover:text-white/50 hover:bg-white/5'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-lg">search</span>
            <input
              type="text"
              placeholder="Search tokens..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="w-64 pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-gold-dim/20 focus:border-gold-dim/30 backdrop-blur-xl transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="pl-11">
          {loading ? (
            <SkeletonTable />
          ) : filtered.length === 0 ? (
            <EmptyState hasFilter={search !== '' || statusFilter !== 'all'} />
          ) : (
            <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden animate-fade-in">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <SortHeader label="Token" sortKey="name" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Type" sortKey="type" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Vintage" sortKey="vintage" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Units" sortKey="quantity" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Value" sortKey="value" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Status" sortKey="status" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <th className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Hash</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Links</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((wine: any, idx: number) => (
                    <tr
                      key={wine.id}
                      className={`border-b border-white/[0.04] transition-all duration-200 group ${
                        wine.status === 'anchored'
                          ? 'bg-green-500/[0.02] hover:bg-green-500/[0.05]'
                          : 'hover:bg-white/[0.03]'
                      }`}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {wine.wineData.imageUrl ? (
                            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:border-white/20 transition-colors">
                              <img
                                src={wine.wineData.imageUrl}
                                alt={wine.wineData.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-white/15 text-sm">wine_bar</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-sm text-white group-hover:text-gold-dim/90 transition-colors">{wine.wineData.name}</div>
                            <div className="text-[11px] text-white/30">{wine.wineData.producer}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm capitalize text-white/50">{wine.wineData.type}</td>
                      <td className="px-6 py-3.5 text-sm text-white/50 font-mono">{wine.wineData.vintage}</td>
                      <td className="px-6 py-3.5 text-sm text-white/50 font-mono">{wine.wineData.quantity}</td>
                      <td className="px-6 py-3.5 text-sm font-semibold text-gold-dim/80 font-mono">
                        ${wine.wineData.currentValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold capitalize tracking-wider ${statusColors[wine.status] ?? "bg-white/10 text-white/50"}`}>
                          {wine.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {wine.contentHash ? (
                          <code className="text-[9px] font-mono text-white/30 bg-white/[0.03] px-2 py-1 rounded border border-white/[0.06] group-hover:text-gold-dim/50 transition-colors">
                            {truncateHash(wine.contentHash, 12)}
                          </code>
                        ) : (
                          <span className="text-white/15 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        {wine.explorerLinks && (wine.explorerLinks.owner || wine.explorerLinks.contentHash || wine.explorerLinks.integrityHash) ? (
                          <div className="flex items-center gap-1.5">
                            {wine.explorerLinks.owner && (
                              <a
                                href={wine.explorerLinks.owner}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-500/[0.07] hover:bg-green-500/15 border border-green-500/15 transition-all"
                                title="View Owner on DUAL"
                              >
                                <span className="material-symbols-outlined text-green-400/70 text-sm">verified</span>
                              </a>
                            )}
                            {wine.explorerLinks.contentHash && (
                              <a
                                href={wine.explorerLinks.contentHash}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gold-dim/[0.07] hover:bg-gold-dim/15 border border-gold-dim/15 transition-all"
                                title="View Content Hash on DUAL"
                              >
                                <span className="material-symbols-outlined text-gold-dim/70 text-sm">description</span>
                              </a>
                            )}
                            {wine.explorerLinks.integrityHash && (
                              <a
                                href={wine.explorerLinks.integrityHash}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-purple-500/[0.07] hover:bg-purple-500/15 border border-purple-500/15 transition-all"
                                title="View Integrity Hash on DUAL"
                              >
                                <span className="material-symbols-outlined text-purple-400/70 text-sm">shield</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/15 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <Link
                          href={`/wallet/browse/${wine.id}`}
                          className="text-white/20 hover:text-gold-dim transition-colors inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/5"
                        >
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Result count */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between mt-4 px-2 text-[10px] text-white/20 font-mono">
              <span>{filtered.length} of {wines.length} tokens</span>
              <span>Sorted by {sortKey} · {sortDir === 'asc' ? 'ascending' : 'descending'}</span>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
