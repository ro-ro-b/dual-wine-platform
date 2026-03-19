'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { Wine } from '@/types/dual';

type ClaimPhase = 'verifying' | 'info' | 'claiming' | 'success' | 'already_claimed' | 'error';

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const objectId = params.objectId as string;

  const [phase, setPhase] = useState<ClaimPhase>('verifying');
  const [wine, setWine] = useState<Wine | null>(null);
  const [error, setError] = useState<string>('');

  // Phase 1: Verify token and check if already claimed
  useEffect(() => {
    const verify = async (): Promise<void> => {
      try {
        // Fetch wine data
        const wineRes = await fetch(`/api/wines/${objectId}`);
        if (!wineRes.ok) {
          setError('Wine token not found');
          setPhase('error');
          return;
        }

        const wineData: Wine = await wineRes.json();
        setWine(wineData);

        // Check if already claimed
        const walletRes = await fetch('/api/wallet');
        const walletData = await walletRes.json();
        const claimedIds: string[] = walletData.claimedIds || [];

        if (claimedIds.includes(objectId)) {
          setPhase('already_claimed');
        } else {
          // Show info phase after 2s verification animation
          setTimeout(() => setPhase('info'), 2000);
        }
      } catch (err: unknown) {
        setError('Failed to verify token');
        setPhase('error');
      }
    };

    verify();
  }, [objectId]);

  const handleClaim = async (): Promise<void> => {
    setPhase('claiming');

    try {
      const claimRes = await fetch('/api/wallet/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectId }),
      });

      if (!claimRes.ok) {
        throw new Error('Claim failed');
      }

      // Show success animation for 2s
      setTimeout(() => setPhase('success'), 1500);
    } catch (err: unknown) {
      setError('Failed to claim token');
      setPhase('error');
    }
  };

  // ─── VERIFYING ───────────────────────────────────────────
  if (phase === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-950 via-wine-900 to-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          {/* Verification spinner */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-wine-700/30" />
            <div className="absolute inset-0 rounded-full border-4 border-t-gold-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full border-4 border-gold-600/20" />
            <div
              className="absolute inset-3 rounded-full border-4 border-t-transparent border-r-gold-400 border-b-transparent border-l-transparent animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-gold-500">
                wine_bar
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Verifying token on DUAL Network...
          </h2>
          <p className="text-gold-200 text-sm">
            Authenticating wine provenance
          </p>
        </div>
      </div>
    );
  }

  // ─── INFO ────────────────────────────────────────────
  if (phase === 'info' && wine) {
    const wineData = wine.wineData;

    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-950 via-wine-900 to-black flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* Token info card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md p-8 mb-8 animate-fade-in">
            {/* Wine icon background */}
            <div className="w-20 h-20 rounded-2xl wine-gradient mx-auto mb-6 flex items-center justify-center shadow-lg shadow-wine-950/50">
              <span className="material-symbols-outlined text-5xl text-white">
                wine_bar
              </span>
            </div>

            {/* Wine details */}
            <h2 className="text-2xl font-bold text-white text-center mb-1">
              {wineData.name}
            </h2>
            <p className="text-gold-300 text-center text-sm mb-6">
              {wineData.producer} · {wineData.vintage}
            </p>

            {/* Status badge */}
            <div className="flex items-center justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-sm font-semibold text-gold-400">
                <span className="material-symbols-outlined text-lg">verified</span>
                ANCHORED
              </span>
            </div>

            {/* Token metadata */}
            <div className="bg-black/20 rounded-2xl p-4 space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Type</span>
                <span className="text-white font-semibold text-sm capitalize">
                  {wineData.type}
                </span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Region</span>
                <span className="text-white font-semibold text-sm">
                  {wineData.region}
                </span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Content Hash</span>
                <span className="text-white/40 font-mono text-xs">
                  {wine.contentHash ? wine.contentHash.slice(0, 12) + '...' : 'N/A'}
                </span>
              </div>
            </div>

            {/* Value highlight */}
            <div className="text-center mb-8">
              <p className="text-white/60 text-xs mb-1">Current Value</p>
              <p className="text-3xl font-bold gold-gradient bg-clip-text text-transparent">
                ${wineData.currentValue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Claim button */}
          <button
            onClick={handleClaim}
            className="w-full py-4 gold-gradient text-white font-bold text-lg rounded-2xl
              active:scale-[0.98] transition-all shadow-2xl shadow-gold-500/30
              hover:shadow-2xl hover:shadow-gold-500/50 flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-2xl">
              account_balance_wallet
            </span>
            Claim to Wallet
          </button>

          {/* DUAL branding footer */}
          <div className="mt-8 text-center">
            <p className="text-white/40 text-xs">
              Powered by{' '}
              <span className="text-gold-400 font-semibold">DUAL Network</span>
            </p>
            <p className="text-white/20 text-xs mt-2">
              Decentralized Universal Asset Ledger
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── CLAIMING ────────────────────────────────────────────
  if (phase === 'claiming') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-950 via-wine-900 to-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          {/* Processing spinner */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-gold-600/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-gold-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-gold-500 animate-pulse">
                check_circle
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Adding to your wallet...
          </h2>
          <p className="text-gold-200 text-sm">
            Storing claim on device
          </p>
        </div>
      </div>
    );
  }

  // ─── SUCCESS ────────────────────────────────────────────
  if (phase === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-950 via-wine-900 to-black flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full text-center">
          {/* Confetti explosion animation */}
          <div className="relative h-32 mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-24 h-24">
                {/* Center burst */}
                <div className="absolute inset-0 rounded-full wine-gradient animate-pulse opacity-50" />

                {/* Outer particles */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 gold-gradient rounded-full animate-burst"
                    style={{
                      transform: `rotate(${(i * 360) / 8}deg) translateY(-60px)`,
                      animation: `burst 0.8s ease-out forwards`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}

                {/* Center checkmark */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-gold-400 animate-scale-in">
                    check_circle
                  </span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            Token Claimed!
          </h2>
          <p className="text-gold-200 text-base mb-8">
            {wine?.wineData.name} is now in your wallet
          </p>

          {/* Success details */}
          <div className="bg-white/5 border border-gold-500/30 rounded-2xl p-6 mb-8">
            <p className="text-white/60 text-sm mb-2">Object ID</p>
            <p className="text-white font-mono text-xs break-all bg-black/20 rounded-lg p-3">
              {objectId}
            </p>
          </div>

          {/* Call to action */}
          <Link
            href="/wallet"
            className="w-full py-4 gold-gradient text-white font-bold text-lg rounded-2xl
              active:scale-[0.98] transition-all shadow-2xl shadow-gold-500/30
              hover:shadow-2xl hover:shadow-gold-500/50 flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-2xl">
              account_balance_wallet
            </span>
            View in Wallet
          </Link>

          {/* DUAL branding footer */}
          <div className="mt-8 text-center">
            <p className="text-white/40 text-xs">
              Powered by{' '}
              <span className="text-gold-400 font-semibold">DUAL Network</span>
            </p>
          </div>
        </div>

        {/* CSS animations */}
        <style jsx>{`
          @keyframes burst {
            0% {
              opacity: 1;
              transform: rotate(var(--burst-angle)) translateY(-60px) scale(1);
            }
            100% {
              opacity: 0;
              transform: rotate(var(--burst-angle)) translateY(-120px) scale(0.5);
            }
          }
          @keyframes scale-in {
            0% {
              transform: scale(0.5);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-scale-in {
            animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
          .animate-burst {
            --burst-angle: 0deg;
          }
        `}</style>
      </div>
    );
  }

  // ─── ALREADY CLAIMED ────────────────────────────────────────────
  if (phase === 'already_claimed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-950 via-wine-900 to-black flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full text-center">
          {/* Already in wallet icon */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-gold-500/10 border-4 border-gold-500/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-gold-500">
                check_circle
              </span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            Already in Your Wallet
          </h2>
          <p className="text-gold-200 text-base mb-8">
            This wine token has already been claimed by you
          </p>

          {/* Wine info if available */}
          {wine && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <p className="text-white font-semibold text-lg mb-2">
                {wine.wineData.name}
              </p>
              <p className="text-white/60 text-sm">
                {wine.wineData.producer} · {wine.wineData.vintage}
              </p>
            </div>
          )}

          {/* View button */}
          <Link
            href="/wallet"
            className="w-full py-4 gold-gradient text-white font-bold text-lg rounded-2xl
              active:scale-[0.98] transition-all shadow-2xl shadow-gold-500/30
              hover:shadow-2xl hover:shadow-gold-500/50 flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-2xl">
              account_balance_wallet
            </span>
            View Wallet
          </Link>

          {/* DUAL branding footer */}
          <div className="mt-8 text-center">
            <p className="text-white/40 text-xs">
              Powered by{' '}
              <span className="text-gold-400 font-semibold">DUAL Network</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── ERROR ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-950 via-wine-900 to-black flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-red-500/10 border-4 border-red-500/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-red-400">
              error
            </span>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">
          Claim Failed
        </h2>
        <p className="text-red-300 text-base mb-8">
          {error || 'An unexpected error occurred'}
        </p>

        {/* Retry button */}
        <button
          onClick={() => {
            setError('');
            setPhase('verifying');
            setWine(null);
          }}
          className="w-full py-4 gold-gradient text-white font-bold text-lg rounded-2xl
            active:scale-[0.98] transition-all shadow-2xl shadow-gold-500/30
            hover:shadow-2xl hover:shadow-gold-500/50 flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined text-2xl">
            refresh
          </span>
          Try Again
        </button>

        {/* Back home link */}
        <Link
          href="/"
          className="w-full py-3 mt-3 border border-white/20 text-white font-semibold text-sm rounded-2xl
            hover:bg-white/5 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">
            home
          </span>
          Back Home
        </Link>

        {/* DUAL branding footer */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-xs">
            Powered by{' '}
            <span className="text-gold-400 font-semibold">DUAL Network</span>
          </p>
        </div>
      </div>
    </div>
  );
}
