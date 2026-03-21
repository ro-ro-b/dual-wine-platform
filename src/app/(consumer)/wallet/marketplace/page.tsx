'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Wine } from '@/types/dual';

interface ListedWine extends Wine {
  listedPrice?: number;
  originalPrice?: number;
  priceHistory?: { date: string; price: number }[];
}

interface PurchaseModal {
  wine: ListedWine | null;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
}

const wineTypeEmoji: Record<string, string> = {
  red: '🍷',
  white: '🍾',
  sparkling: '🍾',
  'rosé': '🌸',
  dessert: '🍮',
  fortified: '🏰',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

function generatePriceHistory(): { date: string; price: number }[] {
  const history = [];
  const basePrice = Math.random() * 2000 + 1000;
  for (let i = 0; i < 8; i++) {
    const daysAgo = 7 * (7 - i);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const variation = (Math.random() - 0.5) * 400;
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(basePrice + variation, 500),
    });
  }
  return history;
}

export default function MarketplacePage() {
  const [wines, setWines] = useState<ListedWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('price-asc');
  const [purchaseModal, setPurchaseModal] = useState<PurchaseModal>({
    wine: null,
    isOpen: false,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const res = await fetch('/api/wines');
        const allWines = await res.json();

        // Filter to listed wines and add mock data
        const listedWines: ListedWine[] = allWines
          .filter((w: any) => w.status === 'anchored' || w.status === 'listed')
          .slice(0, 8)
          .map((w: any, idx: number) => ({
            ...w,
            listedPrice: Math.random() * 2000 + 1500,
            originalPrice: w.wineData.currentValue,
            priceHistory: generatePriceHistory(),
          }));

        setWines(listedWines);
      } catch (err) {
        console.error('Failed to fetch wines:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWines();
  }, []);

  const filteredWines = wines
    .filter((w) => filterType === 'all' || w.wineData.type === filterType)
    .sort((a, b) => {
      const priceA = a.listedPrice || 0;
      const priceB = b.listedPrice || 0;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'name') return a.wineData.name.localeCompare(b.wineData.name);
      return 0;
    });

  const totalListings = wines.length;
  const totalVolume = wines.reduce((sum, w) => sum + (w.listedPrice || 0), 0);
  const avgPrice = totalListings > 0 ? totalVolume / totalListings : 0;

  const handleBuyClick = (wine: ListedWine) => {
    setPurchaseModal({
      wine,
      isOpen: true,
      loading: false,
      error: null,
    });
  };

  const handleConfirmPurchase = async () => {
    if (!purchaseModal.wine) return;

    setPurchaseModal((p) => ({ ...p, loading: true, error: null }));

    try {
      const res = await fetch(`/api/wines/${purchaseModal.wine.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer: 'buyer-wallet-address',
          price: purchaseModal.wine.listedPrice,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPurchaseModal({
          wine: data.wine,
          isOpen: false,
          loading: false,
          error: null,
        });
        // Refresh wines
        const updatedRes = await fetch('/api/wines');
        const updatedWines = await updatedRes.json();
        const newWines: ListedWine[] = updatedWines
          .filter((w: any) => w.status === 'anchored' || w.status === 'listed')
          .slice(0, 8)
          .map((w: any) => ({
            ...w,
            listedPrice: Math.random() * 2000 + 1500,
            originalPrice: w.wineData.currentValue,
            priceHistory: generatePriceHistory(),
          }));
        setWines(newWines);
      } else {
        const errorData = await res.json();
        setPurchaseModal((p) => ({
          ...p,
          error: errorData.error || 'Purchase failed',
        }));
      }
    } catch (err: any) {
      setPurchaseModal((p) => ({
        ...p,
        error: err.message || 'An error occurred',
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center pt-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-gold-dim/30 border-t-gold-dim animate-spin mx-auto" />
          <p className="text-white/40 text-xs uppercase tracking-[0.3em]">Loading Marketplace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white pb-12 pt-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif italic text-gold-dim mb-2">SECONDARY MARKET</h1>
          <p className="text-white/40 text-sm mb-8">Buy and sell authenticated wine tokens from collectors</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-burgundy-deep/20 border border-gold-dim/15 rounded-xl p-4">
              <p className="text-white/50 text-xs uppercase tracking-[0.1em] mb-1.5">Total Listings</p>
              <p className="text-2xl font-bold text-gold-dim">{totalListings}</p>
            </div>
            <div className="bg-burgundy-deep/20 border border-gold-dim/15 rounded-xl p-4">
              <p className="text-white/50 text-xs uppercase tracking-[0.1em] mb-1.5">Volume Traded</p>
              <p className="text-2xl font-bold text-gold-dim">{formatCurrency(totalVolume)}</p>
            </div>
            <div className="bg-burgundy-deep/20 border border-gold-dim/15 rounded-xl p-4">
              <p className="text-white/50 text-xs uppercase tracking-[0.1em] mb-1.5">Avg Price</p>
              <p className="text-2xl font-bold text-gold-dim">{formatCurrency(avgPrice)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.1em] text-white/40 block mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-burgundy-deep/30 border border-gold-dim/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-dim/50 transition w-full md:w-48"
              >
                <option value="all">All Types</option>
                <option value="red">Red</option>
                <option value="white">White</option>
                <option value="sparkling">Sparkling</option>
                <option value="rosé">Rosé</option>
                <option value="dessert">Dessert</option>
                <option value="fortified">Fortified</option>
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.1em] text-white/40 block mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-burgundy-deep/30 border border-gold-dim/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-dim/50 transition w-full md:w-48"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Wine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredWines.map((wine) => {
            const priceChange = wine.priceHistory
              ? wine.priceHistory[wine.priceHistory.length - 1].price -
                wine.priceHistory[0].price
              : 0;
            const priceChangePercent =
              wine.priceHistory && wine.priceHistory[0].price !== 0
                ? ((priceChange / wine.priceHistory[0].price) * 100).toFixed(1)
                : '0';

            return (
              <div
                key={wine.id}
                className="bg-burgundy-deep/20 border border-gold-dim/15 rounded-2xl overflow-hidden hover:border-gold-dim/30 transition group"
              >
                {/* Image/Gradient */}
                <div className="aspect-square bg-gradient-to-br from-burgundy-deep to-[#2d060f] flex items-center justify-center">
                  <span className="text-6xl">{wineTypeEmoji[wine.wineData.type] || '🍷'}</span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-4">
                    <h3 className="text-lg font-serif italic text-white mb-1">{wine.wineData.name}</h3>
                    <p className="text-sm text-white/35">{wine.wineData.producer}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block px-2 py-0.5 bg-burgundy-deep/40 text-burgundy-deep border border-burgundy-deep/50 rounded text-[10px] font-semibold capitalize">
                        {wine.wineData.type}
                      </span>
                      <span className="inline-block px-2 py-0.5 bg-gold-dim/10 text-gold-dim border border-gold-dim/20 rounded text-[10px] font-semibold">
                        {wine.wineData.vintage}
                      </span>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="mb-4 pb-4 border-b border-gold-dim/10">
                    <div className="flex items-baseline gap-2 mb-2">
                      <p className="text-2xl font-bold text-gold-dim">{formatCurrency(wine.listedPrice || 0)}</p>
                      <span
                        className={`text-xs font-semibold ${
                          parseFloat(priceChangePercent) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {parseFloat(priceChangePercent) >= 0 ? '+' : ''}
                        {priceChangePercent}%
                      </span>
                    </div>
                    <p className="text-xs text-white/30">
                      Original: {formatCurrency(wine.originalPrice || wine.wineData.currentValue)}
                    </p>
                  </div>

                  {/* Mini Price Chart */}
                  {wine.priceHistory && wine.priceHistory.length > 0 && (
                    <div className="mb-4 h-12 flex items-end gap-0.5">
                      {wine.priceHistory.map((point, idx) => {
                        const minPrice = Math.min(...wine.priceHistory!.map((p) => p.price));
                        const maxPrice = Math.max(...wine.priceHistory!.map((p) => p.price));
                        const range = maxPrice - minPrice || 1;
                        const height = ((point.price - minPrice) / range) * 100;
                        return (
                          <div
                            key={idx}
                            className="flex-1 bg-gradient-to-t from-gold-dim/60 to-gold-dim/20 rounded-t-sm"
                            style={{ height: `${Math.max(height, 10)}%` }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-[11px] text-white/40">
                    <div>
                      <p className="text-white/25 uppercase tracking-wider mb-0.5">Min Price</p>
                      <p className="text-white/60 font-semibold">
                        {formatCurrency(Math.min(...(wine.priceHistory?.map((p) => p.price) || [0])))}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/25 uppercase tracking-wider mb-0.5">Max Price</p>
                      <p className="text-white/60 font-semibold">
                        {formatCurrency(Math.max(...(wine.priceHistory?.map((p) => p.price) || [0])))}
                      </p>
                    </div>
                  </div>

                  {/* On-Chain Badge */}
                  <div className="flex items-center gap-1.5 mb-4 text-xs text-gold-dim/70">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    DUAL Token ERC-721
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => handleBuyClick(wine)}
                    className="w-full py-2.5 bg-gradient-to-r from-gold-dim to-[#b8860b] text-white font-bold rounded-lg active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-gold-dim/20"
                  >
                    <span className="material-symbols-outlined text-base">shopping_cart</span>
                    BUY NOW
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Purchase Modal */}
        {purchaseModal.isOpen && purchaseModal.wine && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-gold-dim/20 rounded-2xl max-w-md w-full p-8 space-y-6">
              <h2 className="text-2xl font-serif italic text-white">Confirm Purchase</h2>

              {/* Wine Summary */}
              <div className="bg-burgundy-deep/20 border border-gold-dim/10 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{wineTypeEmoji[purchaseModal.wine.wineData.type] || '🍷'}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-serif italic text-white">{purchaseModal.wine.wineData.name}</h3>
                    <p className="text-sm text-white/35">{purchaseModal.wine.wineData.producer}</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Asking Price</span>
                  <span>{formatCurrency(purchaseModal.wine.listedPrice || 0)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Transaction Fee (2%)</span>
                  <span>{formatCurrency((purchaseModal.wine.listedPrice || 0) * 0.02)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gold-dim pt-2 border-t border-gold-dim/10">
                  <span>Total</span>
                  <span>{formatCurrency((purchaseModal.wine.listedPrice || 0) * 1.02)}</span>
                </div>
              </div>

              {/* Error */}
              {purchaseModal.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {purchaseModal.error}
                </div>
              )}

              {/* Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleConfirmPurchase}
                  disabled={purchaseModal.loading}
                  className="w-full py-3 bg-gradient-to-r from-gold-dim to-[#b8860b] text-white font-bold rounded-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {purchaseModal.loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">blockchain</span>
                      Execute On-Chain
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    setPurchaseModal({
                      wine: null,
                      isOpen: false,
                      loading: false,
                      error: null,
                    })
                  }
                  className="w-full py-2.5 border border-white/10 text-white/40 font-semibold rounded-lg hover:bg-white/[0.03] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
