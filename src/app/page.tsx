'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Wine } from "@/types/dual";

const BLOCKSCOUT_BASE = 'https://32f.blockv.io';
const BSMT_CONTRACT = '0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06';

function truncateHash(hash: string, len: number = 12) {
  if (!hash || hash.length <= len) return hash || '';
  return hash.slice(0, len / 2) + '...' + hash.slice(-(len / 2));
}

export default function LandingPage() {
  const router = useRouter();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/wines')
      .then(r => r.json())
      .then((data: Wine[]) => {
        if (Array.isArray(data)) setWines(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const totalValue = wines.reduce((sum, w) => sum + (w.wineData.currentValue || 0), 0);
  const anchoredCount = wines.filter(w => w.status === 'anchored').length;
  const regions = Array.from(new Set(wines.map(w => w.wineData.region).filter(Boolean)));
  const featured = [...wines].sort((a, b) => b.wineData.currentValue - a.wineData.currentValue).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">grain</span>
            </div>
            <span className="text-lg font-bold tracking-tight">DUAL</span>
            <span className="text-white/20 text-sm font-light">Wine Vault</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${BLOCKSCOUT_BASE}/token/${BSMT_CONTRACT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-gold-400 transition"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              BLOCKv EVM
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
            <button
              onClick={() => router.push("/wallet")}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-sm font-medium"
            >
              Wallet
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="px-4 py-2 rounded-xl gold-gradient hover:opacity-90 transition text-sm font-semibold shadow-lg shadow-gold-500/10"
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-wine-900/30 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm mb-8">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-white/60">Live on-chain</span>
              <span className="text-white/20">·</span>
              <span className="text-gold-400 font-semibold">{anchoredCount} tokens anchored</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Fine wine on the
              <br />
              <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 bg-clip-text text-transparent">
                blockchain
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
              Mint, verify, transfer, and trade wine tokens with full provenance — powered by DUAL Protocol on BLOCKv EVM.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/wallet/scan")}
                className="px-8 py-4 rounded-2xl gold-gradient text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-gold-500/20 hover:shadow-gold-500/30 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined">qr_code_scanner</span>
                Scan & Verify
              </button>
              <button
                onClick={() => router.push("/wallet/browse")}
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined">explore</span>
                Browse Tokens
              </button>
              <button
                onClick={() => router.push("/admin/mint")}
                className="px-8 py-4 rounded-2xl wine-gradient border border-wine-700/50 text-white font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Mint a Token
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE STATS ─── */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: loaded ? wines.length.toString() : '—', label: 'Wine Tokens', icon: 'wine_bar' },
              { value: loaded ? `$${totalValue.toLocaleString()}` : '—', label: 'Total Value Locked', icon: 'payments' },
              { value: loaded ? anchoredCount.toString() : '—', label: 'On-Chain Anchored', icon: 'verified' },
              { value: loaded ? regions.length.toString() : '—', label: 'Wine Regions', icon: 'public' },
            ].map((s) => (
              <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-gold-500/60 text-lg">{s.icon}</span>
                  <span className="text-xs text-white/30 uppercase tracking-wider font-semibold">{s.label}</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE TOKENS ─── */}
      {featured.length > 0 && (
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Live tokens</h2>
                <p className="text-white/30 text-sm mt-1">Real ERC-721 assets on BLOCKv EVM</p>
              </div>
              <Link href="/wallet/browse" className="text-gold-400 text-sm font-semibold hover:text-gold-300 transition flex items-center gap-1">
                View all
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {featured.map((wine) => {
                const d = wine.wineData;
                return (
                  <Link
                    key={wine.id}
                    href={`/wallet/browse/${wine.id}`}
                    className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-gold-500/30 hover:bg-white/[0.05] transition-all"
                  >
                    {/* Token header */}
                    <div className="h-48 bg-gradient-to-b from-wine-950/80 to-transparent flex items-center justify-center relative">
                      {d.imageUrl ? (
                        <img src={d.imageUrl} alt={d.name} className="h-32 w-auto object-contain drop-shadow-lg" />
                      ) : (
                        <span className="material-symbols-outlined text-white/[0.06] text-[100px] group-hover:text-white/[0.1] transition">wine_bar</span>
                      )}
                      {/* Status */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {wine.status === 'anchored' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-[10px] font-bold text-gold-400 uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[10px]">verified</span>
                            Anchored
                          </span>
                        )}
                      </div>
                      {/* Type */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 rounded-full bg-white/10 text-[10px] font-bold text-white/70 uppercase tracking-wider capitalize">
                          {d.type}
                        </span>
                      </div>
                    </div>

                    {/* Token info */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-white mb-1 group-hover:text-gold-300 transition">{d.name}</h3>
                      <p className="text-sm text-white/40 mb-4">{d.producer} · {d.region} · {d.vintage}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Value</p>
                          <p className="text-xl font-bold text-gold-400">${d.currentValue.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Varietal</p>
                          <p className="text-sm font-semibold text-white/70">{d.varietal}</p>
                        </div>
                      </div>

                      {/* On-chain data */}
                      <div className="bg-white/[0.03] rounded-xl p-3 space-y-1.5 border border-white/[0.04]">
                        {wine.objectId && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-white/25">Object ID</span>
                            <span className="font-mono text-white/40">{truncateHash(wine.objectId, 16)}</span>
                          </div>
                        )}
                        {wine.contentHash && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-white/25">Content Hash</span>
                            <span className="font-mono text-white/40">{truncateHash(wine.contentHash, 16)}</span>
                          </div>
                        )}
                        {wine.ownerId && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-white/25">Owner</span>
                            <span className="font-mono text-white/40">{truncateHash(wine.ownerId, 14)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── HOW IT WORKS ─── */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">The DUAL lifecycle</h2>
            <p className="text-white/30 text-base">From vineyard to verified — every step on-chain</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: 'add_circle',
                title: 'Mint',
                desc: 'Create an ERC-721 token representing a physical wine bottle with full metadata — producer, vintage, varietal, tasting notes.',
                color: 'from-wine-600 to-wine-800',
              },
              {
                step: '02',
                icon: 'qr_code_scanner',
                title: 'Verify',
                desc: 'Scan the bottle QR code to verify authenticity. Content hash and integrity hash are checked against the BLOCKv chain in real time.',
                color: 'from-gold-600 to-amber-700',
              },
              {
                step: '03',
                icon: 'swap_horiz',
                title: 'Transfer',
                desc: 'Transfer token ownership to any wallet address. The transfer executes on-chain via the BSMT contract — visible on Blockscout.',
                color: 'from-emerald-600 to-emerald-800',
              },
              {
                step: '04',
                icon: 'verified',
                title: 'Prove',
                desc: 'Every token has immutable provenance. Content hash, integrity hash, and owner wallet are all independently verifiable on Blockscout.',
                color: 'from-blue-600 to-indigo-800',
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-white text-xl">{item.icon}</span>
                  </div>
                  <div className="text-[10px] text-white/20 font-mono uppercase tracking-wider mb-2">{item.step}</div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06] rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Built on real infrastructure</h2>
                <p className="text-white/35 leading-relaxed mb-6">
                  Every token is a real ERC-721 asset on the BLOCKv EVM chain, minted through the DUAL Protocol gateway API. No simulations, no testnets — production smart contracts with Blockscout-verifiable transactions.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href={`${BLOCKSCOUT_BASE}/token/${BSMT_CONTRACT}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-semibold hover:border-gold-500/40 transition">
                    <span className="material-symbols-outlined text-sm">explore</span>
                    BSMT on Blockscout
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                  <a href={BLOCKSCOUT_BASE} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-semibold hover:border-white/20 transition">
                    <span className="material-symbols-outlined text-sm">link</span>
                    BLOCKv Explorer
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Protocol', value: 'DUAL (Decentralized Universal Asset Ledger)', icon: 'hub' },
                  { label: 'Chain', value: 'BLOCKv EVM', icon: 'dns' },
                  { label: 'Token Standard', value: 'ERC-721 (BSMT)', icon: 'token' },
                  { label: 'Contract', value: truncateHash(BSMT_CONTRACT, 20), icon: 'description', mono: true },
                  { label: 'Explorer', value: 'Blockscout', icon: 'explore' },
                  { label: 'API', value: 'Gateway REST + JWT Auth', icon: 'api' },
                ].map((item: any) => (
                  <div key={item.label} className="flex items-center gap-3 bg-white/[0.02] rounded-xl px-4 py-3 border border-white/[0.04]">
                    <span className="material-symbols-outlined text-white/20 text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-white/25 uppercase tracking-wider">{item.label}</span>
                      <p className={`text-sm text-white/60 truncate ${item.mono ? 'font-mono' : ''}`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="relative py-16">
            <div className="absolute inset-0 bg-gradient-to-r from-wine-900/20 via-gold-500/10 to-wine-900/20 rounded-3xl blur-xl" />
            <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-3xl px-8 py-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to tokenise?</h2>
              <p className="text-white/35 text-lg mb-8 max-w-lg mx-auto">
                Mint your first wine token, scan a bottle, or explore the marketplace.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push("/admin/mint")}
                  className="px-8 py-4 rounded-2xl gold-gradient text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-gold-500/20 active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Mint a Wine Token
                </button>
                <button
                  onClick={() => router.push("/wallet")}
                  className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                  Open Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded gold-gradient flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">grain</span>
            </div>
            <span className="text-sm text-white/30">DUAL Wine Vault — Powered by DUAL Protocol</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/20">
            <a href={BLOCKSCOUT_BASE} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition">Blockscout</a>
            <span>·</span>
            <a href={`${BLOCKSCOUT_BASE}/token/${BSMT_CONTRACT}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition">BSMT Contract</a>
            <span>·</span>
            <span>ERC-721 on BLOCKv EVM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
