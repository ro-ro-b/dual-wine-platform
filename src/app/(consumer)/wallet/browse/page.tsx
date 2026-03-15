'use client';

import { useState, useEffect } from "react";
import type { Wine } from "@/types/dual";
import WineCard from "@/components/wine/WineCard";
import { Search, SlidersHorizontal } from "lucide-react";

export default function MarketplacePage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("value-desc");

  useEffect(() => {
    fetch("/api/wines")
      .then((r) => r.json())
      .then((data) => { setWines(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  let filtered = wines
    .filter((w) => typeFilter === "all" || w.wineData.type === typeFilter)
    .filter((w) =>
      !search ||
      w.wineData.name.toLowerCase().includes(search.toLowerCase()) ||
      w.wineData.producer.toLowerCase().includes(search.toLowerCase()) ||
      w.wineData.region.toLowerCase().includes(search.toLowerCase())
    );

  if (sortBy === "value-desc") filtered.sort((a, b) => b.wineData.currentValue - a.wineData.currentValue);
  else if (sortBy === "value-asc") filtered.sort((a, b) => a.wineData.currentValue - b.wineData.currentValue);
  else if (sortBy === "vintage") filtered.sort((a, b) => a.wineData.vintage - b.wineData.vintage);
  else if (sortBy === "rating") {
    filtered.sort((a, b) => (b.wineData.ratings[0]?.score ?? 0) - (a.wineData.ratings[0]?.score ?? 0));
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Wine Marketplace</h1>
        <p className="text-stone-500">Browse and acquire tokenised fine wines</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search wines, producers, regions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-wine-500/20"
          >
            <option value="all">All Types</option>
            <option value="red">Red</option>
            <option value="white">White</option>
            <option value="sparkling">Sparkling</option>
            <option value="rosé">Rosé</option>
            <option value="dessert">Dessert</option>
            <option value="fortified">Fortified</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-wine-500/20"
          >
            <option value="value-desc">Price: High to Low</option>
            <option value="value-asc">Price: Low to High</option>
            <option value="vintage">Oldest Vintage</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-stone-500 mb-4">{filtered.length} wines found</div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">Loading marketplace...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((wine) => (
            <WineCard key={wine.id} wine={wine} />
          ))}
        </div>
      )}
    </div>
  );
}
