'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Wine, Action } from "@/types/dual";

const BLOCKSCOUT_BASE = 'https://32f.blockv.io';
const DUAL_CONTRACT = '0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06';

function truncateHash(hash: string, length: number = 16): string {
  if (!hash) return '';
  if (hash.length <= length) return hash;
  const half = Math.floor(length / 2);
  return `${hash.slice(0, half)}...${hash.slice(-half)}`;
}

function CopyButton({ text, label }: { text: string; label: string }): any {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-[#C5A059]/30 transition text-[11px] text-white/50 font-mono group"
    >
      <span className="group-hover:text-[#C5A059] transition">{label}</span>
      <span className="material-symbols-outlined text-xs">{copied ? 'check' : 'content_copy'}</span>
    </button>
  );
}

function BlockscoutLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#C5A059]/[0.06] border border-[#C5A059]/15 hover:border-[#C5A059]/30 hover:bg-[#C5A059]/[0.1] transition text-[11px] text-[#C5A059] font-semibold group"
    >
      <span className="material-symbols-outlined text-sm">{icon}</span>
      <span>{label}</span>
      <span className="material-symbols-outlined text-xs text-[#C5A059]/40 group-hover:text-[#C5A059] transition ml-auto">open_in_new</span>
    </a>
  );
}

const typeGradients: Record<string, string> = {
  red: 'from-[#2D0A15] via-[#4a1228] to-[#1a0510]',
  white: 'from-[#2a2a18] via-[#3d3820] to-[#1a1a10]',
  sparkling: 'from-[#1a1025] via-[#2d1a3d] to-[#0f0a18]',
  'rosé': 'from-[#2d1520] via-[#3d1a2a] to-[#1a0a12]',
  dessert: 'from-[#2a1a0a] via-[#3d2810] to-[#1a1005]',
  fortified: 'from-[#1a0a2d] via-[#281540] to-[#0f0520]',
};

export default function WineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [wine, setWine] = useState<Wine | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"details" | "blockchain" | "tasting">("details");
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/wines/${params.id}`)
      .then((r: any) => r.json())
      .then((wineData: any) => {
        if (wineData && !wineData.error) setWine(wineData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch("/api/actions")
      .then((r: any) => { if (r.ok) return r.json(); return []; })
      .then((allActions: any) => {
        if (Array.isArray(allActions)) {
          setActions(allActions.filter((a: Action) => a.wineId === params.id));
        }
      })
      .catch(() => {});
  }, [params.id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059] animate-spin mx-auto" />
          <p className="text-white/30 text-xs uppercase tracking-[0.3em]">Loading Token</p>
        </div>
      </div>
    );

  if (!wine)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-5xl text-white/10 mb-4 block">search_off</span>
          <p className="text-white/30 text-sm">Token not found</p>
          <Link href="/wallet/browse" className="text-[#C5A059] text-sm mt-2 inline-block hover:underline">Back to marketplace</Link>
        </div>
      </div>
    );

  const d = wine.wineData;
  const gradient = typeGradients[d.type] || typeGradients.red;
  const isVideo = !!d.videoUrl;

  // Build a proper display name from wine data when the stored name is a generic template default
  const genericNames = ['Wine Provenance Token', 'Token', 'Untitled'];
  const isGenericName = genericNames.includes(d.name);
  const displayName = isGenericName && d.producer
    ? `${d.producer}${d.vintage ? ` ${d.vintage}` : ''}`
    : d.name;
  const displaySubtitle = isGenericName
    ? [d.region, d.country, d.varietal].filter(Boolean).join(' · ')
    : `${d.producer} · ${d.region} · ${d.vintage}`;

  return (
    <div className="relative min-h-screen pb-20">
      {/* Hero Section */}
      <div className={`relative h-[50vh] md:h-[45vh] ${isVideo ? '' : `bg-gradient-to-br ${gradient}`} flex flex-col items-center justify-center overflow-hidden`}>
        {isVideo ? (
          <>
            <video
              src={d.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,15,15,0.2) 0%, rgba(15,15,15,0.7) 100%)' }} />
          </>
        ) : (
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: 'radial-gradient(circle at 50% 60%, rgba(197,160,89,0.4) 0%, transparent 50%)'
          }} />
        )}

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition border border-white/[0.08]"
        >
          <span className="material-symbols-outlined text-white/80">arrow_back</span>
        </button>

        {/* Status badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {wine.status === 'anchored' && (
            <div className="flex items-center gap-1.5 bg-[#C5A059]/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#C5A059]/30">
              <span className="material-symbols-outlined text-[#C5A059] text-sm">verified</span>
              <span className="text-[#C5A059] text-[9px] font-bold uppercase tracking-widest">Anchored</span>
            </div>
          )}
          {wine.objectId && (
            <div className="bg-white/[0.06] backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 font-mono text-[10px] text-white/40">
              #{truncateHash(wine.objectId, 8)}
            </div>
          )}
        </div>

        {/* Wine Icon */}
        <span className="material-symbols-outlined text-white/[0.06] text-[160px]">wine_bar</span>
      </div>

      {/* Content Card */}
      <div className="relative -mt-16 mx-4 md:mx-auto max-w-2xl">
        <div className="bg-[#141414] rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/50 p-6 md:p-8">
          {/* Wine Name */}
          <h1 className="text-2xl md:text-3xl font-serif italic text-white mb-1">{displayName}</h1>
          <p className="text-sm text-white/35 mb-6">
            {displaySubtitle}
          </p>

          {/* Verified badge */}
          {wine.status === 'anchored' && (
            <div className="bg-[#C5A059]/[0.06] rounded-xl p-4 mb-6 border border-[#C5A059]/15">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#C5A059] text-lg">verified</span>
                <span className="text-sm font-semibold text-[#C5A059]">Verified on Blockchain</span>
              </div>
              <p className="text-xs text-white/35 leading-relaxed mb-2">
                Cryptographically verified and anchored on the DUAL Network.
              </p>
              {wine.explorerLinks?.integrityHash && (
                <a href={wine.explorerLinks.integrityHash} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C5A059]/80 hover:text-[#C5A059] transition">
                  <span className="material-symbols-outlined text-sm">explore</span>
                  View on Blockscout
                  <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                </a>
              )}
            </div>
          )}

          {/* Value Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
              <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-2">Value</div>
              <div className="text-xl font-serif italic text-[#C5A059]">${d.currentValue.toLocaleString()}</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
              <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-2">Vintage</div>
              <div className="text-xl font-serif italic text-white">{d.vintage}</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
              <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-2">ABV</div>
              <div className="text-xl font-serif italic text-white">{d.abv}%</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
              <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-2">Quantity</div>
              <div className="text-xl font-serif italic text-white">{d.quantity}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-8 flex-wrap">
            <Link
              href={`/api/qr/${wine.objectId}`}
              target="_blank"
              className="flex-1 min-w-[120px] py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 font-semibold text-xs hover:bg-white/[0.06] transition flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">qr_code</span>
              QR Code
            </Link>
            <button
              onClick={() => setShowTransfer(true)}
              className="flex-1 min-w-[120px] py-3 rounded-xl bg-gradient-to-r from-[#791b3a] to-[#4d0d22] text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-[#791b3a]/20"
            >
              <span className="material-symbols-outlined text-base">swap_horiz</span>
              Transfer
            </button>
            <Link
              href={`/verify/${wine.id}`}
              className="flex-1 min-w-[120px] py-3 rounded-xl border border-[#C5A059]/30 bg-[#C5A059]/[0.06] text-[#C5A059] font-semibold text-xs hover:bg-[#C5A059]/[0.12] transition flex items-center justify-center gap-1.5 hover:border-[#C5A059]/50"
            >
              <span className="material-symbols-outlined text-base">verified_user</span>
              Third-Party Verify
            </Link>
            {wine.explorerLinks?.integrityHash && (
              <a
                href={wine.explorerLinks.integrityHash}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[120px] py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-[#d4af37]/20"
              >
                <span className="material-symbols-outlined text-base">explore</span>
                Explorer
              </a>
            )}
          </div>

          {/* Transfer Modal */}
          {showTransfer && (
            <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center">
              <div className="bg-[#1a1a1a] rounded-t-2xl md:rounded-2xl w-full max-w-md p-6 border border-white/[0.08] animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-serif italic text-white">Transfer Token</h3>
                  <button onClick={() => { setShowTransfer(false); setTransferResult(null); }} className="p-2 -mr-2 text-white/30 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {transferResult ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl text-[#C5A059]">check_circle</span>
                    </div>
                    <p className="text-white font-serif italic text-lg mb-1">Transfer Initiated</p>
                    <p className="text-white/30 text-sm mb-4">Submitted to the DUAL network</p>
                    <code className="block bg-white/[0.03] px-3 py-2 rounded-lg text-[10px] font-mono text-white/40 break-all mb-4 border border-white/[0.06]">{transferResult}</code>
                    <button
                      onClick={() => { setShowTransfer(false); setTransferResult(null); }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-white font-bold text-sm"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-white/[0.03] rounded-xl p-3 mb-4 flex items-center gap-3 border border-white/[0.06]">
                      <span className="material-symbols-outlined text-[#791b3a]">wine_bar</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{displayName}</p>
                        <p className="text-xs text-white/30">{displaySubtitle}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] mb-1.5">Recipient Wallet Address</label>
                      <input
                        type="text"
                        value={transferAddress}
                        onChange={e => setTransferAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm font-mono text-white placeholder:text-white/15 focus:outline-none focus:border-[#C5A059]/30"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (!transferAddress) return;
                        setTransferring(true);
                        try {
                          const res = await fetch('/api/transfer', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ objectId: wine.objectId, toAddress: transferAddress }),
                          });
                          const data = await res.json();
                          if (res.ok && data.success) {
                            setTransferResult(data.actionId || 'Transfer submitted');
                          } else {
                            alert(data.error || 'Transfer failed');
                          }
                        } catch {
                          alert('Network error');
                        } finally {
                          setTransferring(false);
                        }
                      }}
                      disabled={transferring || !transferAddress}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#791b3a] to-[#4d0d22] text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {transferring ? (
                        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-lg">send</span>
                      )}
                      {transferring ? 'Transferring...' : 'Confirm Transfer'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] mb-6">
            {[
              { key: "details" as const, label: "Details", icon: "info" },
              { key: "blockchain" as const, label: "On-Chain", icon: "link" },
              { key: "tasting" as const, label: "Tasting", icon: "restaurant" },
            ].map((t: any) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  tab === t.key
                    ? "border-[#C5A059] text-[#C5A059]"
                    : "border-transparent text-white/25 hover:text-white/40"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tab === "details" && (
            <div className="space-y-4">
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                <h4 className="text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] mb-3">Wine Information</h4>
                <div className="space-y-3 text-sm">
                  {[
                    ["Varietal", d.varietal],
                    ["Type", d.type.charAt(0).toUpperCase() + d.type.slice(1)],
                    ["ABV", `${d.abv}%`],
                    ["Volume", d.volume],
                    ["Quantity", `${d.quantity} unit${d.quantity !== 1 ? 's' : ''}`],
                  ].map((item: any) => (
                    <div key={item[0]} className="flex justify-between">
                      <span className="text-white/30">{item[0]}</span>
                      <span className="text-white/70">{item[1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                <h4 className="text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] mb-3">Storage &amp; Condition</h4>
                <div className="space-y-3 text-sm">
                  {[
                    ["Condition", d.condition.replace("_", " ")],
                    ["Storage", d.storage.replace("_", " ")],
                    ["Drinking Window", `${d.drinkingWindow.from}–${d.drinkingWindow.to}`],
                  ].map((item: any) => (
                    <div key={item[0]} className="flex justify-between">
                      <span className="text-white/30">{item[0]}</span>
                      <span className="text-white/70 capitalize">{item[1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {d.description && (
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <h4 className="text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] mb-2">About</h4>
                  <p className="text-sm text-white/40 leading-relaxed italic">{d.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Blockchain Tab */}
          {tab === "blockchain" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-xl p-4 border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">Live on DUAL Network</span>
                </div>
                <p className="text-white/25 text-xs">ERC-721 token on DUAL Token contract. Verifiable on Blockscout.</p>
              </div>

              <div className="space-y-2">
                {wine.explorerLinks?.integrityHash && (
                  <BlockscoutLink href={wine.explorerLinks.integrityHash} label="Token Instance" icon="token" />
                )}
                {wine.explorerLinks?.contentHash && (
                  <BlockscoutLink href={wine.explorerLinks.contentHash} label="Mint Transaction" icon="receipt_long" />
                )}
                {wine.explorerLinks?.owner && (
                  <BlockscoutLink href={wine.explorerLinks.owner} label="Owner Wallet" icon="account_balance_wallet" />
                )}
                <BlockscoutLink href={`${BLOCKSCOUT_BASE}/token/${DUAL_CONTRACT}`} label="DUAL Token Contract" icon="description" />
              </div>

              {wine.objectId && (
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <h4 className="text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] mb-3">Object ID</h4>
                  <code className="block bg-black/30 px-3 py-2 rounded border border-white/[0.04] text-[10px] font-mono text-white/50 break-all mb-2">{wine.objectId}</code>
                  <CopyButton text={wine.objectId} label="Copy ID" />
                </div>
              )}

              {wine.contentHash && (
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <h4 className="text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] mb-3">Content Hash</h4>
                  <code className="block bg-black/30 px-3 py-2 rounded border border-white/[0.04] text-[10px] font-mono text-white/50 break-all mb-2">{wine.contentHash}</code>
                  <CopyButton text={wine.contentHash} label="Copy Hash" />
                </div>
              )}

              {wine.blockchainTxHash && (
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <h4 className="text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] mb-3">Integrity Hash</h4>
                  <code className="block bg-black/30 px-3 py-2 rounded border border-white/[0.04] text-[10px] font-mono text-white/50 break-all mb-2">{wine.blockchainTxHash}</code>
                  <CopyButton text={wine.blockchainTxHash} label="Copy Hash" />
                </div>
              )}

              {wine.ownerId && (
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <h4 className="text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] mb-3">Owner Wallet</h4>
                  <code className="block bg-black/30 px-3 py-2 rounded border border-white/[0.04] text-[10px] font-mono text-white/35 break-all mb-2">{wine.ownerId}</code>
                  <div className="flex gap-2">
                    <CopyButton text={wine.ownerId} label="Copy" />
                    {wine.explorerLinks?.owner && (
                      <a href={wine.explorerLinks.owner} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#C5A059]/[0.06] border border-[#C5A059]/15 text-[11px] text-[#C5A059] font-semibold">
                        Blockscout <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Provenance */}
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                <h4 className="text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#791b3a]">timeline</span>
                  Provenance Chain
                </h4>
                <div className="space-y-0">
                  {wine.provenance.map((event, i) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          event.verified ? 'bg-[#C5A059]' : 'bg-white/15'
                        }`} />
                        {i < wine.provenance.length - 1 && (
                          <div className="w-px h-full bg-white/[0.06] min-h-[28px]" />
                        )}
                      </div>
                      <div className="pb-3 -mt-0.5">
                        <p className="text-sm text-white/60">{event.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-white/25">{event.description}</p>
                        <p className="text-[10px] text-white/15 mt-0.5">
                          {new Date(event.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "tasting" && (
            <div className="space-y-4">
              {[
                { label: "Nose", icon: "air", value: d.tastingNotes?.nose || "Not available" },
                { label: "Palate", icon: "restaurant", value: d.tastingNotes?.palate || "Not available" },
                { label: "Finish", icon: "timer", value: d.tastingNotes?.finish || "Not available" },
              ].map((note: any) => (
                <div key={note.label} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#C5A059] text-lg">{note.icon}</span>
                    <h4 className="text-sm font-serif italic text-white">{note.label}</h4>
                  </div>
                  <p className="text-sm text-white/35 leading-relaxed italic">{note.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide-up animation */}
      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
