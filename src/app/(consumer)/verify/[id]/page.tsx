'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { Wine } from '@/types/dual';

type VerifyStep = { label: string; status: 'done' | 'active' | 'pending' };

const BLOCKSCOUT_BASE = 'https://32f.blockv.io';
const DUAL_CONTRACT = '0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06';

const wineTypeEmoji: Record<string, string> = {
  red: '🍷',
  white: '🍾',
  sparkling: '🍾',
  'rosé': '🌸',
  dessert: '🍮',
  fortified: '🏰',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

function truncateHash(hash: string, len: number = 16) {
  if (!hash || hash.length <= len) return hash || '';
  return hash.slice(0, len / 2) + '...' + hash.slice(-(len / 2));
}

export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const wineId = params.id as string;

  const [wine, setWine] = useState<Wine | null>(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifySteps, setVerifySteps] = useState<VerifyStep[]>([]);
  const [tokenIdInput, setTokenIdInput] = useState(wineId || '');

  useEffect(() => {
    if (wineId) {
      fetchAndVerifyWine(wineId);
    } else {
      setLoading(false);
    }
  }, [wineId]);

  const fetchAndVerifyWine = async (id: string) => {
    setLoading(true);
    setVerifying(true);
    try {
      const res = await fetch(`/api/wines/${id}/verify`);
      if (res.ok) {
        const data = await res.json();
        setWine(data.wine);
        setVerified(data.verified);
        runVerificationAnimation();
      } else {
        setWine(null);
        setVerified(false);
        completeVerification(false);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setWine(null);
      setVerified(false);
      completeVerification(false);
    } finally {
      setLoading(false);
    }
  };

  const runVerificationAnimation = () => {
    const steps: VerifyStep[] = [
      { label: 'Token ID decoded', status: 'done' },
      { label: 'Querying DUAL gateway', status: 'active' },
      { label: 'Verifying content hash', status: 'pending' },
      { label: 'Checking provenance chain', status: 'pending' },
    ];
    setVerifySteps([...steps]);

    setTimeout(() => {
      steps[1].status = 'done';
      steps[2].status = 'active';
      setVerifySteps([...steps]);
    }, 800);

    setTimeout(() => {
      steps[2].status = 'done';
      steps[3].status = 'active';
      setVerifySteps([...steps]);
    }, 1500);

    setTimeout(() => {
      steps[3].status = 'done';
      setVerifySteps([...steps]);
      completeVerification(true);
    }, 2200);
  };

  const completeVerification = (done: boolean) => {
    setTimeout(() => {
      setVerifying(false);
    }, 500);
  };

  const handleVerifyClick = async () => {
    if (!tokenIdInput.trim()) return;
    await fetchAndVerifyWine(tokenIdInput.trim());
  };

  // ── INITIAL STATE (Input) ────────────────────────────────────────────
  if (loading && !wineId) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-white pt-32 px-4 pb-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-serif italic text-gold-dim">
              DUAL WINE VERIFICATION PROTOCOL
            </h1>
            <p className="text-white/40 text-sm">Enter a token ID to verify authenticity on-chain</p>
          </div>

          <div className="bg-burgundy-deep/30 border border-gold-dim/20 rounded-2xl p-8">
            <label className="block text-white/60 text-sm uppercase tracking-[0.1em] font-medium mb-3">
              Token ID
            </label>
            <input
              type="text"
              value={tokenIdInput}
              onChange={(e) => setTokenIdInput(e.target.value)}
              placeholder="Enter or scan wine token ID"
              className="w-full bg-[#0e0e0e] border border-gold-dim/20 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-gold-dim/50 transition"
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyClick()}
            />
          </div>

          <button
            onClick={handleVerifyClick}
            disabled={!tokenIdInput.trim()}
            className="w-full py-4 gold-gradient text-white font-bold rounded-xl shadow-lg shadow-gold-dim/30 active:scale-[0.98] transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">verified_user</span>
            VERIFY WINE
          </button>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <p className="text-white/50 text-sm">This is a public verification page. Anyone can verify a wine's authenticity using its token ID without owning it.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── VERIFYING STATE ───────────────────────────────────────────────────
  if (verifying) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center fixed inset-0 z-[100]">
        <div className="text-center px-8">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-burgundy-deep/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-burgundy-deep border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full border-4 border-gold-dim/20" />
            <div
              className="absolute inset-3 rounded-full border-4 border-t-transparent border-r-gold-dim border-b-transparent border-l-transparent animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-burgundy-deep">wine_bar</span>
            </div>
          </div>

          <h2 className="text-xl font-serif italic text-white mb-2">Verifying Authenticity</h2>
          <p className="text-white/35 text-sm mb-6">Checking DUAL Network provenance chain...</p>

          <div className="space-y-3 text-left max-w-xs mx-auto">
            {verifySteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {step.status === 'done' && (
                  <span className="material-symbols-outlined text-gold-dim text-xl">check_circle</span>
                )}
                {step.status === 'active' && (
                  <div className="w-5 h-5 rounded-full border-2 border-burgundy-deep border-t-transparent animate-spin" />
                )}
                {step.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-white/15" />
                )}
                <span
                  className={`text-sm ${
                    step.status === 'done' ? 'text-gold-dim' : step.status === 'active' ? 'text-white/70' : 'text-white/25'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT STATE ──────────────────────────────────────────────────────
  const isAuthentic = verified;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white pb-12 pt-24 md:pt-32 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Status banner */}
        <div
          className={`rounded-2xl p-8 text-center mb-8 ${
            isAuthentic
              ? 'bg-gold-dim/[0.06] border border-gold-dim/20'
              : 'bg-red-500/[0.06] border border-red-500/20'
          }`}
        >
          <div
            className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
              isAuthentic
                ? 'bg-gold-dim/10 border border-gold-dim/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}
          >
            <span className={`material-symbols-outlined text-6xl ${isAuthentic ? 'text-gold-dim' : 'text-red-400'}`}>
              {isAuthentic ? 'verified' : 'gpp_bad'}
            </span>
          </div>

          <h2 className={`text-3xl font-serif italic mb-2 ${isAuthentic ? 'text-gold-dim' : 'text-red-400'}`}>
            {isAuthentic ? 'VERIFIED AUTHENTIC' : 'UNVERIFIED'}
          </h2>
          <p className={`text-sm ${isAuthentic ? 'text-gold-dim/70' : 'text-red-400/70'}`}>
            {isAuthentic
              ? 'This wine token is verified authentic on the DUAL Network'
              : 'No verification record found for this token'}
          </p>
        </div>

        {/* Wine details */}
        {wine && (
          <div className="bg-burgundy-deep/20 border border-gold-dim/15 rounded-2xl overflow-hidden mb-8">
            <div className="p-6 border-b border-gold-dim/10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-burgundy-deep to-[#2d060f] flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{wineTypeEmoji[wine.wineData.type] || '🍷'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-serif italic text-white leading-tight">{wine.wineData.name}</h3>
                  <p className="text-sm text-white/35 mt-0.5">{wine.wineData.producer}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-block px-2.5 py-0.5 bg-burgundy-deep/40 text-burgundy-deep border border-burgundy-deep/50 rounded text-[11px] font-semibold capitalize">
                      {wine.wineData.type}
                    </span>
                    <span className="inline-block px-2.5 py-0.5 bg-gold-dim/10 text-gold-dim border border-gold-dim/20 rounded text-[11px] font-semibold">
                      {wine.wineData.vintage}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <p className="text-white/25 text-[10px] uppercase tracking-[0.2em] mb-1.5 font-semibold">Region</p>
                <p className="text-white/70 text-sm">{wine.wineData.region}</p>
              </div>
              <div>
                <p className="text-white/25 text-[10px] uppercase tracking-[0.2em] mb-1.5 font-semibold">Varietal</p>
                <p className="text-white/70 text-sm">{wine.wineData.varietal}</p>
              </div>
              <div>
                <p className="text-white/25 text-[10px] uppercase tracking-[0.2em] mb-1.5 font-semibold">Current Value</p>
                <p className="text-gold-dim font-serif italic text-sm">{formatCurrency(wine.wineData.currentValue)}</p>
              </div>
              <div>
                <p className="text-white/25 text-[10px] uppercase tracking-[0.2em] mb-1.5 font-semibold">Condition</p>
                <p className="text-white/70 text-sm capitalize">{wine.wineData.condition}</p>
              </div>
            </div>

            {/* On-Chain Data */}
            <div className="px-6 pb-6 border-t border-gold-dim/10 pt-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-gold-dim text-lg">link</span>
                <p className="text-white/70 font-semibold text-sm">On-Chain Verification</p>
              </div>

              <div className="bg-[#0e0e0e]/60 rounded-lg p-4 space-y-2 text-xs font-mono border border-gold-dim/10">
                {wine.objectId && (
                  <div className="flex justify-between">
                    <span className="text-white/25">Object ID</span>
                    <span className="text-white/50 truncate ml-4 max-w-[180px]">{truncateHash(wine.objectId, 20)}</span>
                  </div>
                )}
                {wine.contentHash && (
                  <div className="flex justify-between">
                    <span className="text-white/25">Content Hash</span>
                    <span className="text-white/50 truncate ml-4 max-w-[180px]">{truncateHash(wine.contentHash, 20)}</span>
                  </div>
                )}
                {wine.blockchainTxHash && (
                  <div className="flex justify-between">
                    <span className="text-white/25">Integrity Hash</span>
                    <span className="text-white/50 truncate ml-4 max-w-[180px]">{truncateHash(wine.blockchainTxHash, 20)}</span>
                  </div>
                )}
                {wine.ownerId && (
                  <div className="flex justify-between">
                    <span className="text-white/25">Owner</span>
                    <span className="text-white/50 truncate ml-4 max-w-[180px]">{truncateHash(wine.ownerId, 16)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/25">Status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold-dim/10 text-gold-dim border border-gold-dim/20">
                    {wine.status}
                  </span>
                </div>
              </div>

              {/* Blockscout links */}
              <div className="mt-4 space-y-2">
                {wine.blockchainTxHash && (
                  <a
                    href={`${BLOCKSCOUT_BASE}/address/${DUAL_CONTRACT}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold-dim/[0.06] border border-gold-dim/15 hover:border-gold-dim/30 transition text-xs text-gold-dim font-semibold"
                  >
                    <span className="material-symbols-outlined text-sm">explore</span>
                    View on Blockscout
                    <span className="material-symbols-outlined text-xs ml-auto">open_in_new</span>
                  </a>
                )}
              </div>
            </div>

            {/* Provenance */}
            {wine.provenance.length > 0 && (
              <div className="px-6 pb-6 border-t border-gold-dim/10 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-burgundy-deep text-lg">timeline</span>
                  <p className="text-white/70 font-semibold text-sm">Provenance Chain</p>
                  <span className="ml-auto text-[11px] text-gold-dim font-medium bg-gold-dim/10 px-2.5 py-0.5 rounded border border-gold-dim/20">
                    {wine.provenance.filter((e) => e.verified).length} verified
                  </span>
                </div>

                <div className="space-y-0">
                  {wine.provenance.map((event, i) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${event.verified ? 'bg-gold-dim' : 'bg-white/15'}`} />
                        {i < wine.provenance.length - 1 && (
                          <div className="w-px h-full bg-white/[0.06] min-h-[32px]" />
                        )}
                      </div>
                      <div className="pb-4 -mt-0.5">
                        <p className="text-sm text-white/60">{event.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-white/25">{event.description}</p>
                        <p className="text-[10px] text-white/15 mt-0.5">
                          {new Date(event.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificate of Authenticity */}
            {isAuthentic && (
              <div className="px-6 pb-6 border-t border-gold-dim/10 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-gold-dim text-lg">card_membership</span>
                  <p className="text-white/70 font-semibold text-sm">Certificate of Authenticity</p>
                </div>

                <div className="bg-[#1a1a1a] border-2 border-gold-dim/30 rounded-lg p-8 text-center space-y-4">
                  <p className="text-gold-dim font-serif italic text-lg">CERTIFICATE OF AUTHENTICITY</p>
                  <div className="space-y-2">
                    <p className="text-white/70 text-xs">This wine has been verified as authentic on the</p>
                    <p className="text-gold-dim font-bold text-sm">DUAL NETWORK ERC-721</p>
                    <p className="text-white/70 text-xs">Token ID: {truncateHash(wine.id, 20)}</p>
                  </div>
                  <div className="text-[11px] text-white/30 mt-4 pt-4 border-t border-gold-dim/20">
                    Verified on {new Date().toLocaleDateString()} • Blockchain verified
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {isAuthentic && wine && (
            <Link
              href={`/wallet/browse/${wine.id}`}
              className="w-full py-3.5 bg-gradient-to-r from-burgundy-deep to-[#4d0d22] text-white font-bold rounded-xl active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-burgundy-deep/20"
            >
              <span className="material-symbols-outlined text-lg">wine_bar</span>
              View Full Token Details
            </Link>
          )}

          <button
            onClick={() => {
              setTokenIdInput('');
              setWine(null);
              setVerified(false);
            }}
            className="w-full py-3.5 bg-gradient-to-r from-gold-dim to-[#b8860b] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold-dim/20 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">verified_user</span>
            Verify Another Wine
          </button>

          <Link
            href="/wallet"
            className="w-full py-3 border border-white/10 text-white/40 font-semibold rounded-xl hover:bg-white/[0.03] transition-all text-sm flex items-center justify-center gap-2"
          >
            Back to Cellar
          </Link>
        </div>

        <div className="mt-8 text-center text-xs text-white/30">
          <p>Powered by DUAL Network • ERC-721 Verified</p>
        </div>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
