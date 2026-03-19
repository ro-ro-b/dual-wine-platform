'use client';

import { useState, useEffect } from 'react';
import type { Wine } from '@/types/dual';

export default function DemoPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [resetting, setResetting] = useState<boolean>(false);

  useEffect(() => {
    const fetchWines = async (): Promise<void> => {
      try {
        const res = await fetch('/api/wines');
        const data: Wine[] = await res.json();
        setWines(data);
      } catch (err: unknown) {
        console.error('Failed to fetch wines:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWines();
  }, []);

  const handleResetAll = async (): Promise<void> => {
    setResetting(true);
    try {
      await fetch('/api/wallet', { method: 'DELETE' });
      // Brief feedback
      setTimeout(() => setResetting(false), 500);
    } catch (err: unknown) {
      console.error('Failed to reset wallet:', err);
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-slate-900/95 to-transparent backdrop-blur-md border-b border-white/5 px-6 py-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gold-400 to-wine-400 bg-clip-text text-transparent">
                DUAL Wine Provenance
              </h1>
              <p className="text-white/60 text-sm md:text-base mt-1">
                Live Demo — Scan QR codes to claim wine tokens
              </p>
            </div>
            <button
              onClick={handleResetAll}
              disabled={resetting}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                resetting
                  ? 'bg-white/10 text-white/40'
                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {resetting ? 'hourglass_empty' : 'refresh'}
              </span>
              {resetting ? 'Resetting...' : 'Reset All Claims'}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-gold-500/10 border border-gold-500/20 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-gold-400 text-xl flex-shrink-0 mt-0.5">
              info
            </span>
            <div>
              <p className="text-white font-semibold text-sm mb-1">
                How it works:
              </p>
              <p className="text-white/70 text-sm">
                Scan any QR code below with your phone camera to claim that wine token to your wallet. Each token is anchored on the DUAL Network and verified by Blockscout.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-6 md:px-8 py-8 max-w-7xl mx-auto">
        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-white/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-gold-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>
              <p className="text-white/60">Loading wine tokens...</p>
            </div>
          </div>
        ) : wines.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-white/20 block mb-4">
              wine_bar
            </span>
            <p className="text-white/60">No wine tokens available</p>
          </div>
        ) : (
          <>
            {/* Wine grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {wines.map((wine: Wine) => (
                <div
                  key={wine.id}
                  className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-gold-500/40 transition-all hover:bg-white/10 hover:shadow-2xl hover:shadow-gold-500/10"
                >
                  {/* QR Code */}
                  <div className="bg-white/5 aspect-square flex items-center justify-center p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-wine-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img
                      src={`/api/qr/${wine.id}`}
                      alt={`QR code for ${wine.wineData.name}`}
                      className="w-full h-full object-contain p-2 bg-white rounded-lg"
                      loading="lazy"
                    />
                  </div>

                  {/* Wine Info */}
                  <div className="p-4 border-t border-white/5">
                    {/* Name and status badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-white line-clamp-2 flex-1">
                        {wine.wineData.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-400 text-[10px] font-semibold whitespace-nowrap flex-shrink-0">
                        <span className="material-symbols-outlined text-xs">
                          verified
                        </span>
                        ANCHORED
                      </span>
                    </div>

                    {/* Producer and vintage */}
                    <p className="text-white/60 text-xs mb-3 line-clamp-1">
                      {wine.wineData.producer} · {wine.wineData.vintage}
                    </p>

                    {/* Token ID and hash */}
                    <div className="bg-black/20 rounded-lg p-2.5 space-y-1.5 text-[10px]">
                      <div>
                        <p className="text-white/40 mb-0.5">Token ID</p>
                        <p className="text-white/80 font-mono truncate">
                          {wine.id.slice(0, 16)}...
                        </p>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div>
                        <p className="text-white/40 mb-0.5">Content Hash</p>
                        <p className="text-white/80 font-mono truncate">
                          {wine.contentHash ? wine.contentHash.slice(0, 16) + '...' : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Type badge */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-block px-2.5 py-1 bg-wine-500/20 border border-wine-500/40 rounded-lg text-white/80 text-[10px] font-semibold capitalize">
                        {wine.wineData.type}
                      </span>
                      <span className="inline-block px-2.5 py-1 bg-gold-500/10 border border-gold-500/20 rounded-lg text-gold-400 text-[10px] font-semibold">
                        ${wine.wineData.currentValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats bar */}
            <div className="bg-gradient-to-r from-white/5 via-gold-500/5 to-white/5 border border-white/10 rounded-2xl p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-white/60 text-sm mb-1">Total Tokens</p>
                  <p className="text-3xl font-bold text-white">{wines.length}</p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-px h-8 bg-white/10" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Network</p>
                  <p className="text-lg font-bold text-gold-400">DUAL</p>
                </div>
              </div>
            </div>

            {/* Footer branding */}
            <div className="mt-8 text-center pb-8">
              <p className="text-white/40 text-sm">
                Blockchain verified via{' '}
                <span className="text-white/60 font-semibold">Blockscout</span>
              </p>
              <p className="text-white/20 text-xs mt-2">
                Decentralized Universal Asset Ledger
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
