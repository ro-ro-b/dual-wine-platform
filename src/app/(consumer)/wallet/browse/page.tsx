'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Wine } from "@/types/dual";

function truncateHash(hash: string, length: number = 8): string {
  if (!hash) return '';
  return hash.length > length ? `${hash.slice(0, length)}...` : hash;
}

// Curated background gradients per wine type — evokes terroir
const typeGradients: Record<string, string> = {
  red: 'from-[#2D0A15] via-[#4a1228] to-[#1a0510]',
  white: 'from-[#2a2a18] via-[#3d3820] to-[#1a1a10]',
  sparkling: 'from-[#1a1025] via-[#2d1a3d] to-[#0f0a18]',
  'rosé': 'from-[#2d1520] via-[#3d1a2a] to-[#1a0a12]',
  dessert: 'from-[#2a1a0a] via-[#3d2810] to-[#1a1005]',
  fortified: 'from-[#1a0a2d] via-[#281540] to-[#0f0520]',
};

// Accent colors per wine type
const typeAccents: Record<string, string> = {
  red: 'text-rose-300',
  white: 'text-amber-300',
  sparkling: 'text-violet-300',
  'rosé': 'text-pink-300',
  dessert: 'text-orange-300',
  fortified: 'text-purple-300',
};

// Terroir descriptions
const typeTerroir: Record<string, string> = {
  red: 'Gravelly soils provide the drainage and mineral complexity that defines the character of great reds.',
  white: 'Limestone and chalk impart a crystalline purity, elevating fruit into something transcendent.',
  sparkling: 'Cool climate vineyards where acidity is preserved, creating the backbone for elegant effervescence.',
  'rosé': 'Sun-kissed Mediterranean slopes where warmth and restraint exist in perfect balance.',
  dessert: 'Late harvest conditions concentrate sugars naturally, yielding wines of extraordinary depth.',
  fortified: 'Schist and granite terraces where vines struggle and produce intensely concentrated fruit.',
};

export default function MarketplacePage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/wines")
      .then((r: any) => r.json())
      .then((data: any) => {
        // Sort by value descending for editorial impact
        const sorted = [...data].sort((a: any, b: any) => b.wineData.currentValue - a.wineData.currentValue);
        setWines(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Track active section via scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const sectionHeight = container.clientHeight;
      const index = Math.round(scrollTop / sectionHeight);
      setActiveIndex(index);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [wines]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: index * container.clientHeight, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059] animate-spin mx-auto" />
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-sans">Loading Collection</p>
        </div>
      </div>
    );
  }

  // Total sections = wines + final CTA
  const totalSections = wines.length + 1;

  return (
    <div className="fixed inset-0 z-[60] bg-[#0F0F0F] text-white">
      {/* Glass Nav */}
      <nav className="fixed top-0 left-0 w-full z-50" style={{ backdropFilter: 'blur(12px)', background: 'rgba(15,15,15,0.6)' }}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 h-16 md:h-20 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#791b3a] to-[#d4af37]" />
            <span className="font-serif italic text-lg md:text-xl tracking-wide">DUAL Vault</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-[10px] uppercase tracking-[0.2em] font-medium text-white/50">
            <Link href="/" className="hover:text-[#791b3a] transition-colors">Origins</Link>
            <span className="text-white border-b border-[#791b3a]">Marketplace</span>
            <Link href="/wallet" className="hover:text-[#791b3a] transition-colors">Cellar</Link>
            <Link href="/wallet/portfolio" className="hover:text-[#791b3a] transition-colors">Portfolio</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/wallet/scan" className="material-symbols-outlined text-white/60 hover:text-white transition-colors text-xl">qr_code_scanner</Link>
            <div className="h-8 w-px bg-white/10 hidden md:block" />
            <Link href="/wallet" className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              Wallet
            </Link>
          </div>
        </div>
      </nav>

      {/* Snap Scroll Container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
      >
        {wines.map((wine, i) => {
          const d = wine.wineData;
          const gradient = typeGradients[d.type] || typeGradients.red;
          const accentColor = typeAccents[d.type] || 'text-[#C5A059]';
          const terroir = typeTerroir[d.type] || typeTerroir.red;
          const isAnchored = wine.status === 'anchored';

          // Build proper display name when stored name is a generic template default
          const genericNames = ['Wine Provenance Token', 'Token', 'Untitled'];
          const isGenericName = genericNames.includes(d.name);
          const displayName = isGenericName && d.producer
            ? `${d.producer}${d.vintage ? ` ${d.vintage}` : ''}`
            : d.name;
          const isVideo = !!d.videoUrl;

          return (
            <section
              key={wine.id}
              className="h-screen relative overflow-hidden flex-shrink-0"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Background — video or gradient */}
              {isVideo ? (
                <>
                  <div className="absolute inset-0">
                    <video
                      src={d.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {/* Dark gradient overlay for readability */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,15,15,0.3) 0%, rgba(15,15,15,0.75) 70%, rgba(15,15,15,0.9) 100%)' }} />
                  </div>
                </>
              ) : (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                  {/* Decorative vineyard pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                      radial-gradient(circle at 80% 20%, rgba(197,160,89,0.05) 0%, transparent 40%)`
                  }} />
                </>
              )}

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end pb-20 md:pb-24 px-6 md:px-12 lg:px-24">
                <div className="max-w-4xl space-y-6 md:space-y-8">
                  {/* Badges */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {isVideo ? (
                      <span className="px-3 py-1 bg-[#C5A059]/20 backdrop-blur-md border border-[#C5A059]/40 rounded-full text-[9px] md:text-[10px] uppercase tracking-widest font-sans text-[#C5A059] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[12px]">play_circle</span>
                        Video NFT · Genesis
                      </span>
                    ) : (
                      <>
                        <span className="px-3 py-1 bg-[#791b3a]/30 backdrop-blur-md border border-[#791b3a]/50 rounded-full text-[9px] md:text-[10px] uppercase tracking-widest font-sans">
                          {d.type.charAt(0).toUpperCase() + d.type.slice(1)} · {d.varietal}
                        </span>
                        <span className="px-3 py-1 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] rounded-full text-[9px] md:text-[10px] uppercase tracking-widest font-sans text-white/50">
                          {d.condition.replace('_', ' ')} · {d.storage.replace('_', ' ')}
                        </span>
                      </>
                    )}
                    {isAnchored && (
                      <div className="flex items-center gap-1 text-[#C5A059]">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-sans">On-Chain Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Wine Name — editorial serif */}
                  <div className="space-y-2">
                    <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif italic text-white leading-[0.95]">
                      {displayName}
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-sans font-light text-white/70 max-w-2xl">
                      {isGenericName
                        ? `A ${d.vintage} ${d.varietal} from ${d.region}, ${d.country}.`
                        : (d.description || `A ${d.vintage} ${d.varietal} from ${d.producer} — ${d.region}, ${d.country}.`)}
                    </p>
                  </div>

                  {/* Primary metadata row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 pt-6 md:pt-8 border-t border-white/10 max-w-3xl">
                    <div>
                      <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/35 mb-1">Producer</span>
                      <span className="text-xs md:text-sm font-sans">{d.producer}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/35 mb-1">Region</span>
                      <span className="text-xs md:text-sm font-sans">{d.region}, {d.country}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/35 mb-1">Vintage</span>
                      <span className="text-xs md:text-sm font-sans">{d.vintage}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/35 mb-1">ABV · Volume</span>
                      <span className="text-xs md:text-sm font-sans">{d.abv}% · {d.volume}</span>
                    </div>
                  </div>

                  {/* Value + ROI + Drinking Window row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 md:gap-8 max-w-4xl">
                    <div>
                      <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/35 mb-1">Current Value</span>
                      <span className="text-lg md:text-xl font-serif italic text-[#C5A059]">${d.currentValue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/35 mb-1">Purchase Price</span>
                      <span className="text-xs md:text-sm font-sans text-white/60">${d.purchasePrice.toLocaleString()}</span>
                    </div>
                    {(() => {
                      const roi = d.purchasePrice > 0 ? ((d.currentValue - d.purchasePrice) / d.purchasePrice) * 100 : 0;
                      return (
                        <div>
                          <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/35 mb-1">ROI</span>
                          <span className={`text-sm md:text-base font-semibold ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })()}
                    <div>
                      <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/35 mb-1">Drink Window</span>
                      <span className="text-xs md:text-sm font-sans">{d.drinkingWindow?.from}–{d.drinkingWindow?.to}</span>
                    </div>
                    <div className="flex items-end">
                      <Link
                        href={`/wallet/browse/${wine.id}`}
                        className="flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-semibold text-white group hover:text-[#C5A059] transition-colors"
                      >
                        Full Details
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </Link>
                    </div>
                  </div>

                  {/* On-chain data strip */}
                  {(wine.objectId || wine.contentHash || wine.blockchainTxHash) && (
                    <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-4 border-t border-white/[0.06] max-w-4xl">
                      {wine.objectId && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] uppercase tracking-[0.15em] text-white/20">Object ID</span>
                          <span className="text-[10px] font-mono text-white/30">{truncateHash(wine.objectId, 18)}</span>
                        </div>
                      )}
                      {wine.contentHash && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] uppercase tracking-[0.15em] text-white/20">Content Hash</span>
                          <span className="text-[10px] font-mono text-white/30">{truncateHash(wine.contentHash, 18)}</span>
                        </div>
                      )}
                      {wine.blockchainTxHash && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] uppercase tracking-[0.15em] text-white/20">Tx Hash</span>
                          <a
                            href={`https://32f.blockv.io/tx/${wine.blockchainTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-[#C5A059]/60 hover:text-[#C5A059] transition"
                          >
                            {truncateHash(wine.blockchainTxHash, 18)}
                          </a>
                        </div>
                      )}
                      {wine.ownerId && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] uppercase tracking-[0.15em] text-white/20">Owner</span>
                          <span className="text-[10px] font-mono text-white/30">{truncateHash(wine.ownerId, 14)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right-side editorial panel (desktop only) */}
              <div className="absolute right-8 lg:right-12 top-1/2 -translate-y-1/2 hidden lg:block w-64 xl:w-72 space-y-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold border-l-2 border-[#C5A059] pl-4">
                    {isVideo ? 'About This Token' : 'Terroir Insight'}
                  </h4>
                  <p className="text-sm text-white/50 leading-relaxed italic">
                    &ldquo;{isVideo ? 'An AI-generated cinematic showcase — the first video asset minted on the DUAL Network. A proof of concept for rich media tokenisation.' : terroir}&rdquo;
                  </p>
                </div>
                {d.tastingNotes?.nose && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold border-l-2 border-[#C5A059] pl-4">
                      On the Nose
                    </h4>
                    <p className="text-sm text-white/50 leading-relaxed italic">
                      &ldquo;{d.tastingNotes.nose}&rdquo;
                    </p>
                  </div>
                )}
                {d.tastingNotes?.palate && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold border-l-2 border-[#C5A059] pl-4">
                      Palate
                    </h4>
                    <p className="text-sm text-white/50 leading-relaxed italic">
                      &ldquo;{d.tastingNotes.palate}&rdquo;
                    </p>
                  </div>
                )}
                {d.tastingNotes?.finish && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold border-l-2 border-[#C5A059] pl-4">
                      Finish
                    </h4>
                    <p className="text-sm text-white/50 leading-relaxed italic">
                      &ldquo;{d.tastingNotes.finish}&rdquo;
                    </p>
                  </div>
                )}
                {d.ratings && d.ratings.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold border-l-2 border-[#C5A059] pl-4">
                      Critic Ratings
                    </h4>
                    <div className="space-y-1.5">
                      {d.ratings.map((r, ri) => (
                        <div key={ri} className="flex justify-between text-[11px]">
                          <span className="text-white/40">{r.critic}</span>
                          <span className="font-semibold text-white/60">{r.score}<span className="text-white/25">/100</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {wine.contentHash && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold border-l-2 border-[#C5A059] pl-4">
                      Token Identity
                    </h4>
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-white/30 font-mono">{truncateHash(wine.contentHash, 22)}</p>
                      {wine.objectId && (
                        <p className="text-[10px] text-white/25 font-mono">OBJ: {truncateHash(wine.objectId, 18)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Section number */}
              <div className="absolute bottom-10 md:bottom-12 right-6 md:right-12 font-serif italic text-3xl md:text-4xl text-white/[0.06]">
                {String(i + 1).padStart(2, '0')} / {String(wines.length).padStart(2, '0')}
              </div>

              {/* Scroll indicator (first section only) */}
              {i === 0 && (
                <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 animate-pulse">
                  <span className="text-[7px] md:text-[8px] uppercase tracking-[0.5em]">Scroll</span>
                  <div className="w-px h-8 md:h-12 bg-gradient-to-b from-white/30 to-transparent" />
                </div>
              )}
            </section>
          );
        })}

        {/* Final CTA Section */}
        <section
          className="h-screen bg-[#0F0F0F] flex items-center justify-center flex-shrink-0"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="text-center space-y-8 max-w-lg px-8">
            <div className="w-16 h-16 mx-auto border border-[#C5A059]/40 rounded-full flex items-center justify-center text-[#C5A059] mb-6">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif italic text-white">Continue Your Journey</h2>
            <p className="text-sm text-white/35 font-sans tracking-wide leading-relaxed">
              Access the complete DUAL Wine Vault collection — {wines.length} verified investment-grade wine tokens, each anchored on the DUAL Network.
            </p>
            <div className="pt-6 grid grid-cols-1 gap-3 max-w-xs mx-auto">
              <Link
                href="/wallet"
                className="bg-[#791b3a] hover:bg-[#791b3a]/80 transition-all py-4 px-10 text-[10px] uppercase tracking-[0.3em] font-bold text-center"
              >
                View Your Cellar
              </Link>
              <Link
                href="/wallet/scan"
                className="border border-white/10 hover:bg-white/5 transition-all py-4 px-10 text-[10px] uppercase tracking-[0.3em] font-bold text-white/50 text-center"
              >
                Scan &amp; Verify a Bottle
              </Link>
              <a
                href="https://32f.blockv.io"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/10 hover:bg-white/5 transition-all py-4 px-10 text-[10px] uppercase tracking-[0.3em] font-bold text-white/50 text-center flex items-center justify-center gap-2"
              >
                Blockchain Explorer
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Pagination dots (desktop) */}
      <div className="fixed right-6 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 md:gap-5 z-40 hidden md:flex">
        {Array.from({ length: totalSections }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeIndex === i
                ? 'bg-[#791b3a] ring-4 ring-[#791b3a]/20 scale-125'
                : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
