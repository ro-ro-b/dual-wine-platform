'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Wine, Action } from "@/types/dual";

export default function WineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [wine, setWine] = useState<Wine | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"details" | "provenance" | "tasting">("details");

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      fetch(`/api/wines/${params.id}`).then((r) => r.json()),
      fetch("/api/actions").then((r) => r.json()),
    ])
      .then(([wineData, allActions]) => {
        setWine(wineData);
        setActions(allActions.filter((a: Action) => a.wineId === params.id));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading)
    return (
      <div className="text-center py-12 text-slate-400 text-sm">Loading...</div>
    );
  if (!wine)
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        Wine not found
      </div>
    );

  const d = wine.wineData;
  const roi =
    d.purchasePrice > 0
      ? ((d.currentValue - d.purchasePrice) / d.purchasePrice) * 100
      : 0;

  return (
    <div className="relative pb-28">
      {/* Hero Section */}
      <div className="relative h-[45vh] bg-gradient-to-b from-primary-consumer via-[#912448] to-[#4d0d22] flex items-center justify-center">
        <span className="material-symbols-outlined text-white/10 text-[120px]">
          wine_bar
        </span>
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-white">
            arrow_back
          </span>
        </button>
        {/* Status badge */}
        {wine.anchoredAt && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-green-300 text-sm">
              verified
            </span>
            <span className="text-green-200 text-xs font-semibold">
              Verified
            </span>
          </div>
        )}
      </div>

      {/* Pull-up Card */}
      <div className="relative -mt-8 bg-white rounded-t-3xl px-4 pt-6 max-w-md mx-auto">
        {/* Wine Name & Producer */}
        <h1 className="text-xl font-bold text-slate-900 mb-1">{d.name}</h1>
        <p className="text-sm text-slate-500 mb-4">
          {d.producer} · {d.region}, {d.country} · {d.vintage}
        </p>

        {/* Value + ROI Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
              Current Value
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ${d.currentValue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">per unit</div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
              Return
            </div>
            <div
              className={`text-2xl font-bold ${
                roi >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {roi >= 0 ? "+" : ""}
              {roi.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              from ${d.purchasePrice.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Ratings */}
        {d.ratings && d.ratings.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {d.ratings.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-accent/10 rounded-xl px-3 py-2"
              >
                <span className="material-symbols-outlined text-accent text-lg">
                  emoji_events
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {r.score}
                  </div>
                  <div className="text-[10px] text-slate-500">{r.critic}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-4">
          {[
            { key: "details" as const, label: "Details" },
            { key: "provenance" as const, label: "Provenance" },
            { key: "tasting" as const, label: "Tasting Notes" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
                tab === t.key
                  ? "border-primary-consumer text-primary-consumer"
                  : "border-transparent text-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "details" && (
          <div className="space-y-4 pb-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Wine Information
              </h4>
              <div className="space-y-3 text-sm">
                {[
                  ["Vintage", String(d.vintage)],
                  ["Varietal", d.varietal],
                  ["Type", d.type.charAt(0).toUpperCase() + d.type.slice(1)],
                  ["ABV", `${d.abv}%`],
                  ["Volume", d.volume],
                  ["Quantity", `${d.quantity} bottles`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
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
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-900 capitalize">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {d.description && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  About
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {d.description}
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "provenance" && (
          <div className="pb-4">
            {wine.provenance.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No provenance records
              </div>
            ) : (
              <div className="relative pl-8">
                {/* Timeline line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" />
                {wine.provenance.map((event) => (
                  <div key={event.id} className="relative pb-6">
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        event.verified
                          ? "bg-green-50 border-green-500"
                          : "bg-slate-50 border-slate-300"
                      }`}
                    >
                      {event.verified && (
                        <span className="material-symbols-outlined text-green-600 text-xs">
                          check
                        </span>
                      )}
                    </div>
                    {/* Event card */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 ml-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-900">
                          {event.type}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                        <span>{event.actor}</span>
                        {event.location && (
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">
                              location_on
                            </span>
                            {event.location}
                          </span>
                        )}
                        {event.txHash && (
                          <span className="text-blue-500 font-mono">
                            {event.txHash.slice(0, 10)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            ].map((note) => (
              <div
                key={note.label}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-100"
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

      {/* Sticky Bottom Purchase Bar */}
      {wine.status === "listed" && (
        <div className="fixed bottom-[72px] left-0 right-0 z-40">
          <div className="max-w-md mx-auto px-4 pb-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 border border-slate-200 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-slate-900">
                  ${d.currentValue.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">
                  {d.quantity} available
                </div>
              </div>
              <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent to-yellow-500 text-slate-900 font-bold text-sm shadow-lg shadow-accent/30 active:scale-95 transition-transform">
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
