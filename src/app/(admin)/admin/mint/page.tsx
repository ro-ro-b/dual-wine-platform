'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Grape, CheckCircle } from "lucide-react";

export default function MintWinePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "", producer: "", region: "", country: "", vintage: new Date().getFullYear(),
    varietal: "", type: "red" as string, abv: 13.5, volume: "750ml", quantity: 1,
    condition: "pristine" as string, storage: "professional" as string,
    drinkingFrom: new Date().getFullYear(), drinkingTo: new Date().getFullYear() + 10,
    currentValue: 0, purchasePrice: 0, description: "",
    nose: "", palate: "", finish: "",
  });

  const update = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/wines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, producer: form.producer, region: form.region, country: form.country,
          vintage: form.vintage, varietal: form.varietal, type: form.type, abv: form.abv,
          volume: form.volume, quantity: form.quantity, condition: form.condition, storage: form.storage,
          drinkingWindow: { from: form.drinkingFrom, to: form.drinkingTo },
          ratings: [], certifications: [],
          currentValue: form.currentValue, purchasePrice: form.purchasePrice,
          description: form.description,
          tastingNotes: { nose: form.nose, palate: form.palate, finish: form.finish },
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/inventory"), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-stone-900 mb-2">Wine Minted Successfully!</h2>
        <p className="text-stone-500">Redirecting to inventory...</p>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1.5";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Mint New Wine Token</h1>
        <p className="text-stone-500">Create a new tokenised wine on the DUAL network</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-900 mb-4">Wine Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className={labelClass}>Wine Name *</label><input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="e.g. Château Margaux 2015" /></div>
              <div><label className={labelClass}>Producer *</label><input required value={form.producer} onChange={(e) => update("producer", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Varietal *</label><input required value={form.varietal} onChange={(e) => update("varietal", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Region *</label><input required value={form.region} onChange={(e) => update("region", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Country *</label><input required value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Vintage *</label><input type="number" required value={form.vintage} onChange={(e) => update("vintage", parseInt(e.target.value))} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Type *</label>
                <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputClass}>
                  {["red", "white", "sparkling", "rosé", "dessert", "fortified"].map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div><label className={labelClass}>ABV (%)</label><input type="number" step="0.1" value={form.abv} onChange={(e) => update("abv", parseFloat(e.target.value))} className={inputClass} /></div>
              <div><label className={labelClass}>Volume</label><input value={form.volume} onChange={(e) => update("volume", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Quantity</label><input type="number" min="1" value={form.quantity} onChange={(e) => update("quantity", parseInt(e.target.value))} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Condition</label>
                <select value={form.condition} onChange={(e) => update("condition", e.target.value)} className={inputClass}>
                  {["pristine", "excellent", "very_good", "good", "fair", "poor"].map((c) => (
                    <option key={c} value={c}>{c.replace("_", " ").charAt(0).toUpperCase() + c.replace("_", " ").slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2"><label className={labelClass}>Description</label><textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} className={inputClass} /></div>
            </div>
          </div>

          {/* Valuation */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-900 mb-4">Valuation & Storage</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Purchase Price ($)</label><input type="number" value={form.purchasePrice} onChange={(e) => update("purchasePrice", parseFloat(e.target.value))} className={inputClass} /></div>
              <div><label className={labelClass}>Current Value ($)</label><input type="number" value={form.currentValue} onChange={(e) => update("currentValue", parseFloat(e.target.value))} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Storage Type</label>
                <select value={form.storage} onChange={(e) => update("storage", e.target.value)} className={inputClass}>
                  {["professional", "home_cellar", "bonded_warehouse", "in_transit"].map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ").charAt(0).toUpperCase() + s.replace("_", " ").slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Drink From</label><input type="number" value={form.drinkingFrom} onChange={(e) => update("drinkingFrom", parseInt(e.target.value))} className={inputClass} /></div>
                <div><label className={labelClass}>Drink To</label><input type="number" value={form.drinkingTo} onChange={(e) => update("drinkingTo", parseInt(e.target.value))} className={inputClass} /></div>
              </div>
            </div>
          </div>

          {/* Tasting Notes */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-900 mb-4">Tasting Notes</h3>
            <div className="space-y-4">
              <div><label className={labelClass}>Nose</label><input value={form.nose} onChange={(e) => update("nose", e.target.value)} className={inputClass} placeholder="Aromas and scents..." /></div>
              <div><label className={labelClass}>Palate</label><input value={form.palate} onChange={(e) => update("palate", e.target.value)} className={inputClass} placeholder="Taste and texture..." /></div>
              <div><label className={labelClass}>Finish</label><input value={form.finish} onChange={(e) => update("finish", e.target.value)} className={inputClass} placeholder="Aftertaste and length..." /></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-lg gold-gradient text-wine-950 font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Grape className="w-5 h-5" />
            {submitting ? "Minting..." : "Mint Wine Token"}
          </button>
        </div>
      </form>
    </div>
  );
}
