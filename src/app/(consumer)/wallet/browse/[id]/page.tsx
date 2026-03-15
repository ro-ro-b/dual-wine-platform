'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Wine, Action } from "@/types/dual";
import {
  ArrowLeft, Shield, Wine as WineIcon, TrendingUp, Clock, MapPin,
  Thermometer, Award, CheckCircle, ExternalLink, Grape, ShoppingCart
} from "lucide-react";

export default function WineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [wine, setWine] = useState<Wine | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"details" | "provenance" | "actions">("details");

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      fetch(`/api/wines/${params.id}`).then((r) => r.json()),
      fetch("/api/actions").then((r) => r.json()),
    ]).then(([wineData, allActions]) => {
      setWine(wineData);
      setActions(allActions.filter((a: Action) => a.wineId === params.id));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="text-center py-12 text-stone-400">Loading wine details...</div>;
  if (!wine) return <div className="text-center py-12 text-stone-400">Wine not found</div>;

  const d = wine.wineData;
  const roi = d.purchasePrice > 0 ? ((d.currentValue - d.purchasePrice) / d.purchasePrice * 100) : 0;

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Image + Quick Info */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-wine-800 to-wine-950 rounded-2xl p-8 flex items-center justify-center h-72 mb-4">
            <WineIcon className="w-24 h-24 text-wine-400/50" />
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-stone-900">${d.currentValue.toLocaleString()}</div>
                <div className="text-xs text-stone-500">Current valuation per unit</div>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${roi >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                <TrendingUp className="w-3.5 h-3.5" />
                {roi >= 0 ? "+" : ""}{roi.toFixed(1)}%
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Purchase Price</span><span className="font-medium">${d.purchasePrice.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Quantity</span><span className="font-medium">{d.quantity} bottles</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Total Value</span><span className="font-bold text-wine-700">${(d.currentValue * d.quantity).toLocaleString()}</span></div>
            </div>
            {wine.status === "listed" && (
              <button className="w-full mt-4 py-3 rounded-lg gold-gradient text-wine-950 font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Purchase
              </button>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 mb-1">{d.name}</h1>
              <p className="text-stone-500">{d.producer} · {d.region}, {d.country}</p>
            </div>
            {wine.anchoredAt && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                <Shield className="w-3.5 h-3.5" /> Blockchain Verified
              </div>
            )}
          </div>

          <p className="text-stone-600 mt-4 leading-relaxed">{d.description}</p>

          {/* Tabs */}
          <div className="flex gap-1 mt-8 mb-6 border-b border-stone-200">
            {(["details", "provenance", "actions"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                  tab === t ? "border-wine-600 text-wine-700" : "border-transparent text-stone-500 hover:text-stone-700"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === "details" && (
            <div className="space-y-6">
              {/* Wine Details Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-stone-200 p-4">
                  <h4 className="text-xs font-medium text-stone-400 uppercase mb-3">Wine Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-stone-500">Vintage</span><span className="font-medium">{d.vintage}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Varietal</span><span className="font-medium">{d.varietal}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Type</span><span className="font-medium capitalize">{d.type}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">ABV</span><span className="font-medium">{d.abv}%</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Volume</span><span className="font-medium">{d.volume}</span></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-stone-200 p-4">
                  <h4 className="text-xs font-medium text-stone-400 uppercase mb-3">Storage & Condition</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-stone-500">Condition</span><span className="font-medium capitalize">{d.condition.replace("_", " ")}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Storage</span><span className="font-medium capitalize">{d.storage.replace("_", " ")}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Drinking Window</span><span className="font-medium">{d.drinkingWindow.from}–{d.drinkingWindow.to}</span></div>
                  </div>
                </div>
              </div>

              {/* Tasting Notes */}
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <h4 className="text-xs font-medium text-stone-400 uppercase mb-3">Tasting Notes</h4>
                <div className="space-y-3 text-sm">
                  <div><span className="font-medium text-stone-700">Nose:</span> <span className="text-stone-600">{d.tastingNotes.nose}</span></div>
                  <div><span className="font-medium text-stone-700">Palate:</span> <span className="text-stone-600">{d.tastingNotes.palate}</span></div>
                  <div><span className="font-medium text-stone-700">Finish:</span> <span className="text-stone-600">{d.tastingNotes.finish}</span></div>
                </div>
              </div>

              {/* Ratings */}
              {d.ratings.length > 0 && (
                <div className="bg-white rounded-xl border border-stone-200 p-4">
                  <h4 className="text-xs font-medium text-stone-400 uppercase mb-3">Critic Ratings</h4>
                  <div className="flex gap-4">
                    {d.ratings.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gold-50 rounded-lg px-4 py-3">
                        <Award className="w-5 h-5 text-gold-600" />
                        <div>
                          <div className="font-bold text-gold-800">{r.score}</div>
                          <div className="text-xs text-gold-600">{r.critic} ({r.year})</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "provenance" && (
            <div className="space-y-4">
              {wine.provenance.length === 0 ? (
                <div className="text-center py-8 text-stone-400">No provenance records</div>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-stone-200" />
                  {wine.provenance.map((event, i) => (
                    <div key={event.id} className="relative pl-12 pb-6">
                      <div className={`absolute left-3 w-5 h-5 rounded-full border-2 ${event.verified ? "bg-green-50 border-green-500" : "bg-stone-50 border-stone-300"} flex items-center justify-center`}>
                        {event.verified && <CheckCircle className="w-3 h-3 text-green-600" />}
                      </div>
                      <div className="bg-white rounded-xl border border-stone-200 p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-stone-900">{event.type}</span>
                          <span className="text-xs text-stone-400">{new Date(event.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-stone-600 mb-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-xs text-stone-400">
                          <span>{event.actor}</span>
                          {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
                          {event.txHash && (
                            <span className="flex items-center gap-1 text-blue-500">
                              <ExternalLink className="w-3 h-3" />{event.txHash.slice(0, 10)}...
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

          {tab === "actions" && (
            <div className="space-y-3">
              {actions.length === 0 ? (
                <div className="text-center py-8 text-stone-400">No actions recorded</div>
              ) : (
                actions.map((action) => (
                  <div key={action.id} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-stone-900">{action.type}</div>
                      <div className="text-xs text-stone-500 mt-0.5">{new Date(action.createdAt).toLocaleString()}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      action.status === "completed" ? "bg-green-50 text-green-700" :
                      action.status === "failed" ? "bg-red-50 text-red-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {action.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
