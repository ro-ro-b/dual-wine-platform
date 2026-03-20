'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Wine, Action } from "@/types/dual";

const BLOCKSCOUT_BASE = 'https://32f.blockv.io';
const BSMT_CONTRACT = '0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06';

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
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-primary-consumer/30 hover:bg-slate-100 transition text-xs text-slate-600 font-mono group"
    >
      <span className="text-slate-500 group-hover:text-primary-consumer transition">{label}</span>
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
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-gold-50 to-gold-100/50 border border-gold-200 hover:border-gold-400 hover:shadow-sm transition text-xs text-gold-800 font-semibold group"
    >
      <span className="material-symbols-outlined text-sm text-gold-600">{icon}</span>
      <span>{label}</span>
      <span className="material-symbols-outlined text-xs text-gold-400 group-hover:text-gold-600 transition ml-auto">open_in_new</span>
    </a>
  );
}

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
      <div className="min-h-screen bg-background-light flex flex-col items-center justify-center gap-3">
        {/* Skeleton loading */}
        <div className="w-full max-w-md md:max-w-2xl px-4">
          <div className="h-[35vh] rounded-b-3xl bg-gradient-to-b from-wine-100 via-wine-50 to-background-light animate-pulse" />
          <div className="bg-white rounded-2xl -mt-8 mx-2 p-6 space-y-4 shadow-sm">
            <div className="h-6 bg-slate-200 rounded-lg w-2/3 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded-lg w-1/2 animate-pulse" />
            <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  if (!wine)
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">search_off</span>
          <p className="text-slate-400 text-sm">Token not found</p>
          <Link href="/wallet/browse" className="text-primary-consumer text-sm mt-2 inline-block">Back to marketplace</Link>
        </div>
      </div>
    );

  const d = wine.wineData;

  return (
    <div className="relative pb-28 bg-background-light min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[45vh] bg-gradient-to-b from-wine-100 via-wine-50 to-background-light flex flex-col items-center justify-center overflow-hidden">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition border border-slate-200 shadow-sm"
        >
          <span className="material-symbols-outlined text-slate-700">arrow_back</span>
        </button>

        {/* Status badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {wine.status === 'anchored' && (
            <div className="flex items-center gap-1.5 bg-gold-50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gold-300 shadow-sm">
              <span className="material-symbols-outlined text-gold-600 text-sm">verified</span>
              <span className="text-gold-700 text-xs font-bold uppercase tracking-wider">Anchored</span>
            </div>
          )}
          {wine.objectId && (
            <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 font-mono text-xs text-slate-500 shadow-sm">
              #{truncateHash(wine.objectId, 8)}
            </div>
          )}
        </div>

        {/* Wine Image/Icon */}
        <div className="flex items-center justify-center">
          {d.imageUrl ? (
            <img
              src={d.imageUrl}
              alt={d.name}
              className="h-40 w-auto object-contain drop-shadow-lg"
            />
          ) : (
            <span className="material-symbols-outlined text-primary-consumer/10 text-[140px]">wine_bar</span>
          )}
        </div>
      </div>

      {/* Pull-up Card */}
      <div className="relative -mt-12 bg-white rounded-t-3xl px-4 pt-6 md:px-8 max-w-md md:max-w-2xl mx-auto border-t border-slate-200 shadow-lg">
        {/* Wine Name & Producer */}
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{d.name}</h1>
        <p className="text-sm text-slate-500 mb-5">
          {d.producer} · {d.region} · {d.vintage}
        </p>

        {/* Premium Status Section */}
        {wine.status === 'anchored' && (
          <div className="bg-gradient-to-r from-gold-50 to-gold-100/50 rounded-2xl p-4 mb-6 border border-gold-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-gold-600 text-lg">verified</span>
              <span className="text-sm font-bold text-gold-800">Verified on Blockchain</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              This wine provenance token is cryptographically verified and anchored on the BLOCKv EVM chain
            </p>
            {/* Quick Blockscout link */}
            {wine.explorerLinks?.integrityHash && (
              <a
                href={wine.explorerLinks.integrityHash}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 hover:text-gold-900 transition"
              >
                <span className="material-symbols-outlined text-sm">explore</span>
                View on Blockscout
                <span className="material-symbols-outlined text-[11px]">open_in_new</span>
              </a>
            )}
          </div>
        )}

        {/* Value Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-wine-50 to-white rounded-2xl p-4 border border-wine-100 shadow-sm">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">
              Current Value
            </div>
            <div className="text-2xl font-bold text-primary-consumer">
              ${d.currentValue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">per unit</div>
          </div>
          <div className="bg-gradient-to-br from-gold-50 to-white rounded-2xl p-4 border border-gold-100 shadow-sm">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">
              Vintage
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {d.vintage}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">year</div>
          </div>
        </div>

        {/* Token Information */}
        {wine.objectId && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Token Identity
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">Object ID</span>
                <code className="text-[10px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                  {truncateHash(wine.objectId, 24)}
                </code>
              </div>
              {wine.contentHash && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">Content Hash</span>
                  <code className="text-[10px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                    {truncateHash(wine.contentHash, 16)}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Link
            href={`/api/qr/${wine.objectId}`}
            target="_blank"
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">qr_code</span>
            QR Code
          </Link>
          <button
            onClick={() => setShowTransfer(true)}
            className="flex-1 py-2.5 rounded-xl wine-gradient text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-base">swap_horiz</span>
            Transfer
          </button>
          {wine.explorerLinks?.integrityHash && (
            <a
              href={wine.explorerLinks.integrityHash}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl gold-gradient text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-base">explore</span>
              Explorer
            </a>
          )}
        </div>

        {/* Transfer Modal */}
        {showTransfer && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
            <div className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Transfer Token</h3>
                <button onClick={() => { setShowTransfer(false); setTransferResult(null); }} className="p-2 -mr-2 text-slate-400 hover:text-slate-700">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {transferResult ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-gold-600">check_circle</span>
                  </div>
                  <p className="text-slate-900 font-bold mb-1">Transfer Initiated</p>
                  <p className="text-slate-500 text-sm mb-4">The token transfer has been submitted to the DUAL network</p>
                  <code className="block bg-slate-50 px-3 py-2 rounded-lg text-[10px] font-mono text-slate-600 break-all mb-4">{transferResult}</code>
                  <button
                    onClick={() => { setShowTransfer(false); setTransferResult(null); }}
                    className="w-full py-3 rounded-xl gold-gradient text-white font-bold text-sm"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-wine-50 rounded-xl p-3 mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-wine-600">wine_bar</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{d.name}</p>
                      <p className="text-xs text-slate-500">{d.producer} · {d.vintage}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recipient Wallet Address</label>
                    <input
                      type="text"
                      value={transferAddress}
                      onChange={e => setTransferAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-consumer/10 bg-white"
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
                    className="w-full py-3 rounded-xl wine-gradient text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div className="flex border-b border-slate-200 mb-4">
          {[
            { key: "details" as const, label: "Details", icon: "info" },
            { key: "blockchain" as const, label: "On-Chain", icon: "link" },
            { key: "tasting" as const, label: "Tasting", icon: "restaurant" },
          ].map((t: any) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                tab === t.key
                  ? "border-primary-consumer text-primary-consumer"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "details" && (
          <div className="space-y-4 pb-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Wine Information
              </h4>
              <div className="space-y-3 text-sm">
                {[
                  ["Varietal", d.varietal],
                  ["Type", d.type.charAt(0).toUpperCase() + d.type.slice(1)],
                  ["ABV", `${d.abv}%`],
                  ["Volume", d.volume],
                  ["Quantity", `${d.quantity} unit${d.quantity !== 1 ? 's' : ''}`],
                ].map((item: any) => (
                  <div key={item[0]} className="flex justify-between">
                    <span className="text-slate-500">{item[0]}</span>
                    <span className="font-medium text-slate-900">{item[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Storage & Condition
              </h4>
              <div className="space-y-3 text-sm">
                {[
                  ["Condition", d.condition.replace("_", " ")],
                  ["Storage", d.storage.replace("_", " ")],
                  [
                    "Drinking Window",
                    `${d.drinkingWindow.from}–${d.drinkingWindow.to}`,
                  ],
                ].map((item: any) => (
                  <div key={item[0]} className="flex justify-between">
                    <span className="text-slate-500">{item[0]}</span>
                    <span className="font-medium text-slate-900 capitalize">
                      {item[1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {d.description && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  About
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {d.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Blockchain / On-Chain Tab */}
        {tab === "blockchain" && (
          <div className="space-y-4 pb-4">
            {/* Network banner */}
            <div className="bg-gradient-to-r from-slate-900 to-wine-950 rounded-2xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Live on BLOCKv EVM</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">
                ERC-721 token on BSMT contract. All data is verifiable on Blockscout explorer.
              </p>
            </div>

            {/* Quick Blockscout links */}
            <div className="space-y-2">
              {wine.explorerLinks?.integrityHash && (
                <BlockscoutLink href={wine.explorerLinks.integrityHash} label="Token Instance on Blockscout" icon="token" />
              )}
              {wine.explorerLinks?.contentHash && (
                <BlockscoutLink href={wine.explorerLinks.contentHash} label="Mint Transaction" icon="receipt_long" />
              )}
              {wine.explorerLinks?.owner && (
                <BlockscoutLink href={wine.explorerLinks.owner} label="Owner Wallet" icon="account_balance_wallet" />
              )}
              <BlockscoutLink href={`${BLOCKSCOUT_BASE}/token/${BSMT_CONTRACT}`} label="BSMT Contract" icon="description" />
            </div>

            {/* Hashes */}
            {wine.objectId && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Object ID</h4>
                <code className="block bg-white px-3 py-2 rounded border border-slate-200 text-[10px] font-mono text-slate-700 break-all mb-2">
                  {wine.objectId}
                </code>
                <CopyButton text={wine.objectId} label="Copy ID" />
              </div>
            )}

            {wine.contentHash && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Content Hash</h4>
                <code className="block bg-white px-3 py-2 rounded border border-slate-200 text-[10px] font-mono text-slate-700 break-all mb-2">
                  {wine.contentHash}
                </code>
                <CopyButton text={wine.contentHash} label="Copy Hash" />
              </div>
            )}

            {wine.blockchainTxHash && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Integrity Hash</h4>
                <code className="block bg-white px-3 py-2 rounded border border-slate-200 text-[10px] font-mono text-slate-700 break-all mb-2">
                  {wine.blockchainTxHash}
                </code>
                <CopyButton text={wine.blockchainTxHash} label="Copy Hash" />
              </div>
            )}

            {wine.ownerId && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Owner Wallet</h4>
                <code className="block bg-white px-3 py-2 rounded border border-slate-200 text-[10px] font-mono text-slate-500 break-all mb-2">
                  {wine.ownerId}
                </code>
                <div className="flex gap-2">
                  <CopyButton text={wine.ownerId} label="Copy" />
                  {wine.explorerLinks?.owner && (
                    <a
                      href={wine.explorerLinks.owner}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gold-50 border border-gold-200 hover:border-gold-400 transition text-xs text-gold-800 font-semibold"
                    >
                      <span>Blockscout</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Provenance Timeline */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-wine-600">timeline</span>
                Provenance Chain
              </h4>
              <div className="space-y-0">
                {wine.provenance.map((event, i) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        event.verified ? 'bg-gold-500' : 'bg-slate-300'
                      }`} />
                      {i < wine.provenance.length - 1 && (
                        <div className="w-px h-full bg-slate-200 min-h-[28px]" />
                      )}
                    </div>
                    <div className="pb-3 -mt-0.5">
                      <p className="text-sm font-medium text-slate-900">{event.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-500">{event.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(event.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {event.txHash && (
                        <p className="text-[10px] font-mono text-slate-400 mt-1">
                          Hash: {truncateHash(event.txHash, 20)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Token Timeline */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Token Timeline
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Created</span>
                  <span className="text-slate-700">{new Date(wine.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="text-slate-700">{new Date(wine.updatedAt).toLocaleDateString()}</span>
                </div>
                {wine.status === 'anchored' && (
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-gold-700 font-semibold">Status</span>
                    <span className="text-gold-700 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      ANCHORED
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "tasting" && (
          <div className="space-y-4 pb-4">
            {[
              {
                label: "Nose",
                icon: "air",
                value: d.tastingNotes?.nose || "Not available",
              },
              {
                label: "Palate",
                icon: "restaurant",
                value: d.tastingNotes?.palate || "Not available",
              },
              {
                label: "Finish",
                icon: "timer",
                value: d.tastingNotes?.finish || "Not available",
              },
            ].map((note: any) => (
              <div
                key={note.label}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary-consumer text-lg">
                    {note.icon}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {note.label}
                  </h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {note.value}
                </p>
              </div>
            ))}
          </div>
        )}
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
