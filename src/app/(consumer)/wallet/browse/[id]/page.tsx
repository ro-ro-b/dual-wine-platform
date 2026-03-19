'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Wine, Action } from "@/types/dual";

function truncateHash(hash: string, length: number = 16): string {
  if (!hash) return '';
  return hash.length > length ? `${hash.slice(0, length)}...` : hash;
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

export default function WineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [wine, setWine] = useState<Wine | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"details" | "blockchain" | "tasting">("details");

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
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center py-12 text-slate-400 text-sm">Loading...</div>
      </div>
    );
  if (!wine)
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center py-12 text-slate-400 text-sm">Token not found</div>
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
      <div className="relative -mt-12 bg-white rounded-t-3xl px-4 pt-6 max-w-md mx-auto border-t border-slate-200 shadow-lg">
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
            <p className="text-xs text-slate-600 leading-relaxed">
              This wine provenance token is cryptographically verified and anchored on the DUAL Network
            </p>
          </div>
        )}

        {/* Value Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-4">
          {[
            { key: "details" as const, label: "Details" },
            { key: "blockchain" as const, label: "Verification" },
            { key: "tasting" as const, label: "Tasting" },
          ].map((t: any) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
                tab === t.key
                  ? "border-primary-consumer text-primary-consumer"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
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

        {/* Blockchain Verification Tab */}
        {tab === "blockchain" && (
          <div className="space-y-4 pb-4">
            <div className="bg-gradient-to-r from-gold-50 to-gold-100/50 rounded-2xl p-4 border border-gold-200">
              <h4 className="text-xs font-bold text-gold-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">verified</span>
                Blockchain Verification
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                All token data is cryptographically verified on the DUAL Network and indexed on DUAL
              </p>
            </div>

            {wine.objectId && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Object ID
                </h4>
                <div className="space-y-2">
                  <code className="block bg-white px-3 py-2 rounded border border-slate-200 text-[10px] font-mono text-slate-700 break-all">
                    {wine.objectId}
                  </code>
                  {wine.objectId && <CopyButton text={wine.objectId} label="Copy ID" />}
                </div>
              </div>
            )}

            {wine.contentHash && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Content Hash
                </h4>
                <div className="space-y-2">
                  <code className="block bg-white px-3 py-2 rounded border border-slate-200 text-[10px] font-mono text-slate-700 break-all">
                    {wine.contentHash}
                  </code>
                  <div className="flex gap-2">
                    {wine.contentHash && <CopyButton text={wine.contentHash} label="Copy Hash" />}
                    {wine.explorerLinks?.contentHash && (
                      <a
                        href={wine.explorerLinks.contentHash}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gold-50 border border-gold-200 hover:border-gold-400 hover:bg-gold-100 transition text-xs text-gold-800 font-semibold"
                      >
                        <span>Verify on DUAL</span>
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {wine.blockchainTxHash && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Integrity Hash
                </h4>
                <div className="space-y-2">
                  <code className="block bg-white px-3 py-2 rounded border border-slate-200 text-[10px] font-mono text-slate-700 break-all">
                    {wine.blockchainTxHash}
                  </code>
                  <div className="flex gap-2">
                    {wine.blockchainTxHash && <CopyButton text={wine.blockchainTxHash} label="Copy Hash" />}
                    {wine.explorerLinks?.integrityHash && (
                      <a
                        href={wine.explorerLinks.integrityHash}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gold-50 border border-gold-200 hover:border-gold-400 hover:bg-gold-100 transition text-xs text-gold-800 font-semibold"
                      >
                        <span>View on DUAL</span>
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {wine.ownerId && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Owner Address
                </h4>
                <div className="space-y-2">
                  <code className="block bg-white px-3 py-2 rounded border border-slate-200 text-[10px] font-mono text-slate-500 break-all">
                    {wine.ownerId}
                  </code>
                  {wine.explorerLinks?.owner && (
                    <a
                      href={wine.explorerLinks.owner}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-slate-300 hover:bg-slate-200 transition text-xs text-slate-600 font-semibold"
                    >
                      <span>View Owner</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            )}

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
                    <span className="text-gold-700">Status</span>
                    <span className="text-gold-700 font-semibold">ANCHORED</span>
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
    </div>
  );
}
