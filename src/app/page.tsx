'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Wine } from "@/types/dual";

const BLOCKSCOUT_BASE = 'https://32f.blockv.io';
const DUAL_CONTRACT = '0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06';

function truncateHash(hash: string, len: number = 12) {
  if (!hash || hash.length <= len) return hash || '';
  return hash.slice(0, len / 2) + '...' + hash.slice(-(len / 2));
}

export default function LandingPage() {
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
    <div className="min-h-screen bg-[#0F0F0F] text-white overflow-hidden">

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]" style={{ backdropFilter: 'blur(12px)', background: 'rgba(15,15,15,0.8)' }}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C5A059] to-[#8B6914] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">grain</span>
            </div>
            <span className="text-lg font-serif italic tracking-tight">DUAL</span>
            <span className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-sans hidden sm:inline">Wine Vault</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${BLOCKSCOUT_BASE}/token/${DUAL_CONTRACT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[9px] uppercase tracking-[0.15em] text-white/30 hover:text-[#C5A059] transition"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              DUAL Network
              <span className="material-symbols-outlined text-[10px]">open_in_new</span>
            </a>
            <Link
              href="/wallet"
              className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] uppercase tracking-[0.15em] font-semibold text-white/50 hover:text-white/80 hover:border-white/10 transition"
            >
              Wallet
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#C5A059] to-[#8B6914] text-[10px] uppercase tracking-[0.15em] font-bold text-white shadow-lg shadow-[#C5A059]/10 hover:shadow-[#C5A059]/20 transition"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO — Full-bleed vineyard ─── */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* Vineyard background */}
        <div className="absolute inset-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjKOKIxiodQb8Z8C9XpN51wZtxxiq4GteOnc0JA98AQWgm-vtevWiePHuxtGDHWUUCa9oiUytqxGpmPl9t4Dg5HcdspiXScWLzcCo3rl8WH5KeKxboSkJ9VxS6wJqCNI3AFrEYQlM4JgHLP6yeRwPFrp5REAL3vu8GucuYUf27x6N2i_1ly2WzOxqKDJ_vT3eGvgx6-szdhxDUdhJIflEtD2d4FCS51s8vthIsYUaLE7FIedyzL40l3r2LKMQy_nrzd69A7Q1gj7Q"
            alt="Vineyard rows stretching toward misty hills"
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,15,15,0.35) 0%, rgba(15,15,15,0.75) 100%)' }} />
        </div>

        {/* Content pinned to bottom */}
        <div className="relative pb-16 md:pb-24 pt-32 px-6 md:px-12 lg:px-24">
          <div className="max-w-[1400px] mx-auto">
            <div className="max-w-4xl space-y-8">
              {/* Badges */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="px-3 py-1.5 bg-[#791b3a]/30 border border-[#791b3a]/50 rounded-full text-[9px] uppercase tracking-[0.2em] font-semibold" style={{ backdropFilter: 'blur(8px)' }}>
                  Tokenised Provenance
                </span>
                <div className="flex items-center gap-1.5 text-[#C5A059]">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-semibold">{anchoredCount} Verified Assets</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-serif italic text-white leading-[1.02]">
                Fine wine on the<br />
                <span className="bg-gradient-to-r from-[#C5A059] via-[#d4af37] to-[#8B6914] bg-clip-text text-transparent">
                  blockchain
                </span>
              </h1>

              <p className="text-lg md:text-xl font-light text-white/70 max-w-2xl leading-relaxed">
                Mint, verify, transfer, and trade wine tokens with full provenance — powered by DUAL Protocol on the DUAL Network.
              </p>

              {/* Stats bar + CTA */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/10 max-w-3xl">
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.2em] text-white/35 mb-1">Tokens</span>
                  <span className="text-lg font-serif italic text-white">{loaded ? wines.length : '—'}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.2em] text-white/35 mb-1">Total Value</span>
                  <span className="text-lg font-serif italic text-[#C5A059]">{loaded ? `$${totalValue.toLocaleString()}` : '—'}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.2em] text-white/35 mb-1">Regions</span>
                  <span className="text-lg font-serif italic text-white">{loaded ? regions.length : '—'}</span>
                </div>
                <div className="flex items-end">
                  <Link href="/wallet/browse" className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] font-semibold text-white group">
                    Explore Collection
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right-side editorial panel (desktop) */}
          <div className="absolute right-12 lg:right-24 top-1/2 -translate-y-1/2 hidden lg:block w-72 space-y-10">
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold border-l-2 border-[#C5A059] pl-4">On-Chain Provenance</h4>
              <p className="text-sm text-white/50 leading-relaxed italic font-light">Every token carries its full history — origin, custody, and authenticity — immutably recorded on the DUAL Network.</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold border-l-2 border-[#C5A059] pl-4">Investment Grade</h4>
              <p className="text-sm text-white/50 leading-relaxed italic font-light">Verified ERC-721 assets representing real bottles — transferable, tradeable, and independently verifiable on Blockscout.</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <span className="text-[7px] uppercase tracking-[0.5em]">Scroll</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ─── ACTION BUTTONS ─── */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/wallet/scan"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[#C5A059] to-[#8B6914] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#C5A059]/20 hover:shadow-[#C5A059]/30 active:scale-[0.98] transition-all uppercase tracking-[0.1em]"
            >
              <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
              Scan &amp; Verify
            </Link>
            <Link
              href="/wallet/browse"
              className="px-8 py-4 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/60 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/[0.06] hover:text-white/80 active:scale-[0.98] transition-all uppercase tracking-[0.1em]"
            >
              <span className="material-symbols-outlined text-lg">explore</span>
              Browse Tokens
            </Link>
            <Link
              href="/admin/mint"
              className="px-8 py-4 rounded-full bg-[#791b3a]/20 border border-[#791b3a]/30 text-white/60 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#791b3a]/30 hover:text-white/80 active:scale-[0.98] transition-all uppercase tracking-[0.1em]"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Mint a Token
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LIVE TOKENS ─── */}
      {featured.length > 0 && (
        <section className="px-6 md:px-12 pb-24">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-semibold block mb-2">Featured Collection</span>
                <h2 className="text-3xl md:text-4xl font-serif italic text-white">Live tokens</h2>
                <p className="text-white/25 text-sm mt-2 font-light">Real ERC-721 assets on the DUAL Network</p>
              </div>
              <Link href="/wallet/browse" className="text-[#C5A059] text-[10px] uppercase tracking-[0.15em] font-semibold hover:text-[#d4af37] transition flex items-center gap-1">
                View all
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {featured.map((wine) => {
                const d = wine.wineData;
                const roi = d.purchasePrice > 0 ? ((d.currentValue - d.purchasePrice) / d.purchasePrice) * 100 : 0;
                return (
                  <Link
                    key={wine.id}
                    href={`/wallet/browse/${wine.id}`}
                    className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#C5A059]/30 transition-all duration-300 overflow-hidden"
                  >
                    {/* Gradient accent on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#791b3a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Token header */}
                    <div className="relative h-44 bg-gradient-to-b from-[#2D0A15]/60 to-transparent flex items-center justify-center">
                      {d.imageUrl ? (
                        <img src={d.imageUrl} alt={d.name} className="h-28 w-auto object-contain drop-shadow-lg" />
                      ) : (
                        <span className="material-symbols-outlined text-[#791b3a]/20 text-[80px] group-hover:text-[#791b3a]/30 transition">wine_bar</span>
                      )}
                      {wine.status === 'anchored' && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 text-[8px] font-bold text-[#C5A059] uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[10px]">verified</span>
                            Anchored
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-white/[0.06] text-[8px] font-bold text-white/40 uppercase tracking-wider capitalize">
                          {d.type}
                        </span>
                      </div>
                    </div>

                    {/* Token info */}
                    <div className="relative p-5">
                      <h3 className="text-sm font-serif italic text-white/80 mb-1 group-hover:text-white transition">{d.name}</h3>
                      <p className="text-[11px] text-white/25 mb-4">{d.producer} · {d.region} · {d.vintage}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-0.5">Value</p>
                          <p className="text-xl font-serif italic text-[#C5A059]">${d.currentValue.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-0.5">ROI</p>
                          <p className={`text-sm font-semibold ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* On-chain data */}
                      <div className="bg-white/[0.02] rounded-xl p-3 space-y-1.5 border border-white/[0.04]">
                        {wine.objectId && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-white/20">Object ID</span>
                            <span className="font-mono text-white/30">{truncateHash(wine.objectId, 16)}</span>
                          </div>
                        )}
                        {wine.contentHash && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-white/20">Content Hash</span>
                            <span className="font-mono text-white/30">{truncateHash(wine.contentHash, 16)}</span>
                          </div>
                        )}
                        {wine.ownerId && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-white/20">Owner</span>
                            <span className="font-mono text-white/30">{truncateHash(wine.ownerId, 14)}</span>
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

      {/* ─── THE DUAL LIFECYCLE ─── */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-semibold block mb-3">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-4">The DUAL lifecycle</h2>
            <p className="text-white/25 text-base font-light">From vineyard to verified — every step on-chain</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                icon: 'add_circle',
                title: 'Mint',
                desc: 'Create an ERC-721 token representing a physical wine bottle with full metadata — producer, vintage, varietal, tasting notes.',
                accent: '#791b3a',
              },
              {
                step: '02',
                icon: 'qr_code_scanner',
                title: 'Verify',
                desc: 'Scan the bottle QR code to verify authenticity. Content hash and integrity hash are checked against the DUAL chain in real time.',
                accent: '#C5A059',
              },
              {
                step: '03',
                icon: 'swap_horiz',
                title: 'Transfer',
                desc: 'Transfer token ownership to any wallet address. The transfer executes on-chain via the DUAL Token contract — visible on Blockscout.',
                accent: '#059669',
              },
              {
                step: '04',
                icon: 'verified',
                title: 'Prove',
                desc: 'Every token has immutable provenance. Content hash, integrity hash, and owner wallet are all independently verifiable on Blockscout.',
                accent: '#3b82f6',
              },
            ].map((item) => (
              <div key={item.step} className="group relative">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:border-white/[0.08] transition-all h-full">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border"
                    style={{ backgroundColor: `${item.accent}15`, borderColor: `${item.accent}30` }}
                  >
                    <span className="material-symbols-outlined text-xl" style={{ color: item.accent }}>{item.icon}</span>
                  </div>
                  <div className="text-[9px] text-white/15 font-mono uppercase tracking-[0.2em] mb-2">{item.step}</div>
                  <h3 className="text-lg font-serif italic text-white/80 mb-2">{item.title}</h3>
                  <p className="text-[13px] text-white/25 leading-relaxed font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INFRASTRUCTURE ─── */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D0A15] via-[#1a0510] to-[#0F0F0F]" />
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(197,160,89,0.3) 0%, transparent 50%)'
            }} />

            <div className="relative p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-semibold block mb-3">Infrastructure</span>
                  <h2 className="text-3xl md:text-4xl font-serif italic text-white mb-4">Built on real infrastructure</h2>
                  <p className="text-white/25 leading-relaxed mb-8 font-light">
                    Every token is a real ERC-721 asset on the DUAL Network, minted through the DUAL Protocol gateway API. No simulations, no testnets — production smart contracts with Blockscout-verifiable transactions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a href={`${BLOCKSCOUT_BASE}/token/${DUAL_CONTRACT}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] text-[10px] uppercase tracking-[0.15em] font-semibold hover:border-[#C5A059]/40 transition">
                      <span className="material-symbols-outlined text-sm">explore</span>
                      DUAL Token on Blockscout
                      <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </a>
                    <a href={BLOCKSCOUT_BASE} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/40 text-[10px] uppercase tracking-[0.15em] font-semibold hover:border-white/10 hover:text-white/60 transition">
                      <span className="material-symbols-outlined text-sm">link</span>
                      DUAL Explorer
                      <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </a>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Protocol', value: 'DUAL (Decentralized Universal Asset Ledger)', icon: 'hub' },
                    { label: 'Chain', value: 'DUAL Network', icon: 'dns' },
                    { label: 'Token Standard', value: 'ERC-721 (DUAL Token)', icon: 'token' },
                    { label: 'Contract', value: truncateHash(DUAL_CONTRACT, 20), icon: 'description', mono: true },
                    { label: 'Explorer', value: 'Blockscout', icon: 'explore' },
                    { label: 'API', value: 'Gateway REST + JWT Auth', icon: 'api' },
                  ].map((item: any) => (
                    <div key={item.label} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.04]">
                      <span className="material-symbols-outlined text-white/15 text-lg">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-white/20 uppercase tracking-[0.2em]">{item.label}</span>
                        <p className={`text-sm text-white/50 truncate ${item.mono ? 'font-mono' : 'font-light'}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#791b3a]/10 via-[#C5A059]/5 to-[#791b3a]/10 rounded-3xl blur-xl" />
            <div className="relative bg-white/[0.02] border border-white/[0.05] rounded-3xl px-8 py-20">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-semibold block mb-4">Get Started</span>
              <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-4">Ready to tokenise?</h2>
              <p className="text-white/25 text-base mb-10 max-w-lg mx-auto font-light">
                Mint your first wine token, scan a bottle, or explore the marketplace.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/admin/mint"
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#C5A059] to-[#8B6914] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#C5A059]/20 active:scale-[0.98] transition-all uppercase tracking-[0.1em]"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Mint a Wine Token
                </Link>
                <Link
                  href="/wallet"
                  className="px-8 py-4 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/50 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/[0.06] hover:text-white/80 active:scale-[0.98] transition-all uppercase tracking-[0.1em]"
                >
                  <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                  Open Wallet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.05] py-8 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#C5A059] to-[#8B6914] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">grain</span>
            </div>
            <span className="text-[11px] text-white/20 font-light">DUAL Wine Vault — Powered by DUAL Protocol</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-white/15">
            <a href={BLOCKSCOUT_BASE} target="_blank" rel="noopener noreferrer" className="hover:text-[#C5A059] transition">Blockscout</a>
            <span className="text-white/5">·</span>
            <a href={`${BLOCKSCOUT_BASE}/token/${DUAL_CONTRACT}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#C5A059] transition">DUAL Token Contract</a>
            <span className="text-white/5">·</span>
            <span>ERC-721 on DUAL Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
