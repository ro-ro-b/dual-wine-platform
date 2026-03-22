'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface MarketplaceListing {
  id: string
  ticketName: string
  originalPrice: number
  listingPrice: number
  seller: string
  eventDate: string
  tier: string
  listed: string
  isLive?: boolean
  maxResalePrice?: number
  eventName?: string
}

interface PurchaseModalState {
  isOpen: boolean
  listing: MarketplaceListing | null
  step: 'confirm' | 'processing' | 'success' | 'error'
  error?: string
  transactionHash?: string
}

const MOCK_LISTINGS: MarketplaceListing[] = [
  {
    id: '1',
    ticketName: 'Neon Dreams Festival 2026 - Backstage Pass',
    originalPrice: 299,
    listingPrice: 349,
    seller: '0x7a8f...9d2c',
    eventDate: '2026-04-15',
    tier: 'Backstage Pass',
    listed: '2 hours ago',
  },
  {
    id: '2',
    ticketName: 'Virtual Reality Concert Series - VIP',
    originalPrice: 149,
    listingPrice: 175,
    seller: '0x4b3e...6a1f',
    eventDate: '2026-05-22',
    tier: 'VIP Experience',
    listed: '5 hours ago',
  },
  {
    id: '3',
    ticketName: 'Crypto Cup 2026 - Executive Suite',
    originalPrice: 799,
    listingPrice: 799,
    seller: '0x2d9c...5e7b',
    eventDate: '2026-06-10',
    tier: 'Executive Suite',
    listed: '1 day ago',
  },
  {
    id: '4',
    ticketName: 'The Holographic Opera - Main Floor',
    originalPrice: 249,
    listingPrice: 229,
    seller: '0x8f2a...4c9e',
    eventDate: '2026-07-08',
    tier: 'Main Floor Exclusive',
    listed: '3 days ago',
  },
  {
    id: '5',
    ticketName: 'Synth Wave Night - VIP Experience',
    originalPrice: 125,
    listingPrice: 145,
    seller: '0x5e6d...3a9f',
    eventDate: '2026-07-19',
    tier: 'VIP',
    listed: '4 hours ago',
  },
  {
    id: '6',
    ticketName: 'Future Tech Innovators Summit - VIP',
    originalPrice: 399,
    listingPrice: 425,
    seller: '0x1c2b...8f4d',
    eventDate: '2026-09-12',
    tier: 'VIP Access',
    listed: '6 hours ago',
  },
]

export default function MarketplacePage() {
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [liveListings, setLiveListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [purchaseModal, setPurchaseModal] = useState<PurchaseModalState>({
    isOpen: false,
    listing: null,
    step: 'confirm',
  })

  useEffect(() => {
    fetch('/api/tickets?status=listed')
      .then((r) => r.json())
      .then((data) => {
        const tickets = data.tickets || []
        const mapped: MarketplaceListing[] = tickets
          .filter((t: any) => t.status === 'listed')
          .map((t: any) => ({
            id: t.id,
            ticketName:
              (t.ticketData?.eventName || t.ticketData?.name || 'Event Ticket') +
              ' - ' +
              (t.ticketData?.tier || 'Ticket'),
            originalPrice: t.ticketData?.price || 0,
            listingPrice: t.ticketData?.listingPrice || t.ticketData?.price || 0,
            seller: t.ownerId?.slice(0, 8) + '...' + t.ownerId?.slice(-4) || 'Unknown',
            eventDate: t.ticketData?.eventDate || t.createdAt,
            tier: t.ticketData?.tier || 'Standard',
            listed: t.listedAt ? new Date(t.listedAt).toLocaleDateString() : 'Recently',
            isLive: true,
            maxResalePrice: t.ticketData?.maxResalePrice,
            eventName: t.ticketData?.eventName || 'Event',
          }))
        setLiveListings(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleBuyClick = (listing: MarketplaceListing) => {
    setPurchaseModal({
      isOpen: true,
      listing,
      step: 'confirm',
    })
  }

  const handleExecutePurchase = async () => {
    if (!purchaseModal.listing) return

    setPurchaseModal((prev) => ({ ...prev, step: 'processing' }))

    try {
      // Simulate processing steps
      await new Promise((r) => setTimeout(r, 1000)) // Initiating
      await new Promise((r) => setTimeout(r, 1000)) // Settling
      await new Promise((r) => setTimeout(r, 1000)) // Recording
      await new Promise((r) => setTimeout(r, 1000)) // Transferring

      const txHash = '0x' + Math.random().toString(16).slice(2)

      // Call buy API
      const response = await fetch(`/api/tickets/${purchaseModal.listing.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerAddress: '0x' + Math.random().toString(16).slice(2, 42),
          listingPrice: purchaseModal.listing.listingPrice,
          sellerId: purchaseModal.listing.seller,
        }),
      })

      if (!response.ok) {
        throw new Error('Purchase failed')
      }

      const data = await response.json()

      setPurchaseModal((prev) => ({
        ...prev,
        step: 'success',
        transactionHash: data.transactionHash || txHash,
      }))
    } catch (err) {
      setPurchaseModal((prev) => ({
        ...prev,
        step: 'error',
        error: String(err),
      }))
    }
  }

  const closePurchaseModal = () => {
    setPurchaseModal({
      isOpen: false,
      listing: null,
      step: 'confirm',
    })
  }

  const tiers = [
    'all',
    'General Admission',
    'VIP',
    'VIP Experience',
    'Backstage Pass',
    'Executive Suite',
    'Main Floor Exclusive',
  ]

  const allListings = [...liveListings, ...MOCK_LISTINGS]

  const filteredListings =
    filterTier === 'all' ? allListings : allListings.filter((l) => l.tier === filterTier)

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price-asc') return a.listingPrice - b.listingPrice
    if (sortBy === 'price-desc') return b.listingPrice - a.listingPrice
    return 0
  })

  return (
    <div className="min-h-screen relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-[#00f0ff] via-[#ff2d78] to-[#39ff14] bg-clip-text text-transparent">
            Ticket Marketplace
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Trade verified tickets with anti-scalp protection. All listings are enforced by smart contracts.
          </p>
        </div>

        {liveListings.length > 0 && (
          <div className="mb-8 flex items-center gap-4 p-4 rounded-xl border border-[#39ff14]/30 bg-[#39ff14]/5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#39ff14] animate-pulse" />
              <span className="text-[#39ff14] font-bold text-lg">{liveListings.length}</span>
            </div>
            <span className="text-gray-300">
              live listing{liveListings.length !== 1 ? 's' : ''} with on-chain price
              enforcement
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-3 font-semibold">Filter by Tier</p>
            <div className="flex flex-wrap gap-2">
              {tiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilterTier(tier)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterTier === tier
                      ? 'bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:border-[#00f0ff]/50'
                  }`}
                >
                  {tier === 'all' ? 'All Tiers' : tier}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-3 font-semibold block">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#00f0ff] focus:outline-none transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 animate-pulse"
              >
                <div className="h-6 bg-white/10 rounded mb-4" />
                <div className="h-4 bg-white/10 rounded w-3/4 mb-6" />
                <div className="space-y-3 mb-6">
                  <div className="h-4 bg-white/10 rounded" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
                <div className="h-10 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedListings.map((listing) => {
              const priceChange = listing.listingPrice - listing.originalPrice
              const priceChangePercent = ((priceChange / listing.originalPrice) * 100).toFixed(1)
              const isViolatingCeiling =
                listing.maxResalePrice && listing.listingPrice > listing.maxResalePrice

              return (
                <div
                  key={listing.id}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 hover:border-[#00f0ff]/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-300 flex flex-col"
                >
                  {listing.isLive && (
                    <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#39ff14]/10 border border-[#39ff14]/30 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
                      <span className="text-xs font-bold text-[#39ff14]">ON-CHAIN</span>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-[#00f0ff] transition-colors flex-1">
                        {listing.ticketName}
                      </h3>
                    </div>
                    <div className="inline-flex px-2 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30">
                      <span className="text-xs font-semibold text-[#00f0ff]">{listing.tier}</span>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs">calendar_month</span>
                      {new Date(listing.eventDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs">account_circle</span>
                      {listing.seller}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {listing.listed}
                    </div>
                  </div>

                  <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">Original Price</p>
                      <p className="text-sm text-gray-400 line-through">${listing.originalPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current Listing</p>
                      <div className="flex items-baseline justify-between">
                        <p className="text-2xl font-black text-[#00f0ff]">
                          ${listing.listingPrice}
                        </p>
                        <span
                          className={`text-xs font-bold ${
                            isViolatingCeiling
                              ? 'text-[#ff2d78]'
                              : priceChange > 0
                                ? 'text-[#ff2d78]'
                                : priceChange < 0
                                  ? 'text-[#39ff14]'
                                  : 'text-gray-400'
                          }`}
                        >
                          {priceChange > 0 ? '+' : ''}
                          {priceChangePercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {listing.isLive && listing.maxResalePrice && (
                    <div className="mb-4 p-3 rounded-lg bg-[#39ff14]/5 border border-[#39ff14]/20">
                      <p className="text-xs text-gray-500 mb-1">Anti-Scalp Max Price</p>
                      <p className="font-bold text-[#39ff14]">${listing.maxResalePrice}</p>
                      {isViolatingCeiling && (
                        <p className="text-xs text-[#ff2d78] mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">warning</span>
                          Above ceiling (will auto-reject on-chain)
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleBuyClick(listing)}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                      listing.isLive
                        ? 'bg-gradient-to-r from-[#00f0ff]/20 to-[#ff2d78]/20 border border-[#00f0ff]/30 text-[#00f0ff] hover:from-[#00f0ff]/40 hover:to-[#ff2d78]/40 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                        : 'bg-gradient-to-r from-[#39ff14]/20 to-[#00f0ff]/20 border border-[#39ff14]/30 text-[#39ff14] hover:from-[#39ff14]/40 hover:to-[#00f0ff]/40 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {listing.isLive ? 'swap_horiz' : 'shopping_cart'}
                    </span>
                    {listing.isLive ? 'Buy via ebus' : 'Buy Now'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {!loading && sortedListings.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-8xl text-[#00f0ff]/30 block mb-6">
              search
            </span>
            <h2 className="text-3xl font-bold text-white mb-4">No Listings Found</h2>
            <p className="text-gray-400">
              Try adjusting your filters to see more listings.
            </p>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="border border-[#39ff14]/30 rounded-2xl p-8 bg-gradient-to-r from-[#39ff14]/5 to-transparent">
          <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#39ff14]">shield_verified</span>
            Safe Trading with Anti-Scalp Protection
          </h3>
          <p className="text-gray-300 mb-4">
            Every transaction on DUAL Marketplace is protected by smart contracts that enforce price
            boundaries. Sellers cannot list above the price ceiling, and buyers cannot undercut below the
            price floor.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Automated price verification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Transparent transaction history</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Instant on-chain settlement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Real-time price enforcement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Multi-signature escrow</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Provenance verification</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Purchase Modal */}
      {purchaseModal.isOpen && purchaseModal.listing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <style>{`
            @keyframes settle-pulse {
              0%, 100% {
                opacity: 0.5;
              }
              50% {
                opacity: 1;
              }
            }

            @keyframes confetti-particle {
              0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translateY(-100px) rotate(360deg);
                opacity: 0;
              }
            }

            .settle-pulse {
              animation: settle-pulse 1.5s ease-in-out infinite;
            }

            .confetti {
              position: absolute;
              pointer-events: none;
            }

            .confetti-particle {
              animation: confetti-particle 2s ease-out forwards;
            }
          `}</style>

          <div className="max-w-2xl w-full rounded-2xl border border-[#00f0ff]/30 bg-gradient-to-br from-[#08080f] to-[#1a0033] p-8">
            {purchaseModal.step === 'confirm' && (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-white mb-2">Confirm Purchase</h2>
                  <p className="text-gray-400">Review the details before purchasing</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="p-6 rounded-xl border border-[#00f0ff]/30 bg-[#00f0ff]/5">
                    <h3 className="font-bold text-lg text-white mb-4">
                      {purchaseModal.listing.ticketName}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500 mb-1">Event</p>
                        <p className="font-semibold text-white">
                          {purchaseModal.listing.eventName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Date</p>
                        <p className="font-semibold text-white">
                          {new Date(purchaseModal.listing.eventDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Tier</p>
                        <p className="font-semibold text-[#ff2d78]">
                          {purchaseModal.listing.tier}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Seller</p>
                        <p className="font-mono text-[#00f0ff] text-xs">
                          {purchaseModal.listing.seller}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-gray-500 mb-1">Original Price</p>
                      <p className="text-2xl font-black text-gray-400 line-through">
                        ${purchaseModal.listing.originalPrice}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30">
                      <p className="text-xs text-gray-500 mb-1">Purchase Price</p>
                      <p className="text-2xl font-black text-[#00f0ff]">
                        ${purchaseModal.listing.listingPrice}
                      </p>
                    </div>
                  </div>

                  {purchaseModal.listing.maxResalePrice && (
                    <div className="p-4 rounded-lg bg-[#39ff14]/5 border border-[#39ff14]/30">
                      <p className="text-sm text-gray-400">
                        <span className="text-[#39ff14] font-bold">Anti-Scalp Protected:</span> Max
                        resale price is ${purchaseModal.listing.maxResalePrice}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closePurchaseModal}
                    className="flex-1 py-3 rounded-lg font-bold border border-white/20 text-white hover:border-white/40 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleExecutePurchase}
                    className="flex-1 py-3 rounded-lg font-bold bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] text-black hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">flash_on</span>
                    EXECUTE ON-CHAIN PURCHASE
                  </button>
                </div>
              </>
            )}

            {purchaseModal.step === 'processing' && (
              <>
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-black text-white mb-2">Processing Purchase</h2>
                  <p className="text-gray-400">Your transaction is being settled on-chain</p>
                </div>

                <div className="space-y-6 mb-8">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-[#00f0ff]/30">
                    <div className="settle-pulse w-8 h-8 rounded-full bg-[#00f0ff]/30 border border-[#00f0ff] flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Initiating transaction...</p>
                      <p className="text-sm text-gray-400">Preparing blockchain settlement</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-[#ff2d78]/30">
                    <div className="settle-pulse w-8 h-8 rounded-full bg-[#ff2d78]/30 border border-[#ff2d78] flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 border-2 border-[#ff2d78]/30 border-t-[#ff2d78] rounded-full animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Settling on DUAL Network...</p>
                      <p className="text-sm text-gray-400">Executing smart contract</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-[#39ff14]/30">
                    <div className="settle-pulse w-8 h-8 rounded-full bg-[#39ff14]/30 border border-[#39ff14] flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 border-2 border-[#39ff14]/30 border-t-[#39ff14] rounded-full animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Recording on Blockscout...</p>
                      <p className="text-sm text-gray-400">Finalizing transaction</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-[#6c2bd9]/30">
                    <div className="settle-pulse w-8 h-8 rounded-full bg-[#6c2bd9]/30 border border-[#6c2bd9] flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 border-2 border-[#6c2bd9]/30 border-t-[#6c2bd9] rounded-full animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Transferring ownership...</p>
                      <p className="text-sm text-gray-400">Updating ticket ownership</p>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-400">
                  Do not refresh or close this page
                </div>
              </>
            )}

            {purchaseModal.step === 'success' && (
              <>
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#39ff14]/20 border-2 border-[#39ff14] mb-4">
                    <span className="text-5xl text-[#39ff14]">✓</span>
                  </div>
                  <h2 className="text-3xl font-black text-[#39ff14] mb-2">PURCHASE COMPLETE</h2>
                  <p className="text-gray-400">Your ticket has been transferred to your wallet</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                    <p className="font-mono text-[#00f0ff] text-sm break-all">
                      {purchaseModal.transactionHash}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Ticket</p>
                    <p className="font-bold text-white">{purchaseModal.listing.ticketName}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/30">
                    <p className="text-xs text-gray-500 mb-1">Paid</p>
                    <p className="font-bold text-[#39ff14] text-lg">
                      ${purchaseModal.listing.listingPrice}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href={`https://32f.blockv.io/tx/${purchaseModal.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-lg font-bold border border-[#39ff14]/50 text-[#39ff14] hover:border-[#39ff14] hover:bg-[#39ff14]/10 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">open_in_new</span>
                    View on Blockscout
                  </a>

                  <Link
                    href="/tickets/my-tickets"
                    className="flex-1 py-3 rounded-lg font-bold bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] text-black hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">card_membership</span>
                    View My Ticket
                  </Link>
                </div>
              </>
            )}

            {purchaseModal.step === 'error' && (
              <>
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#ff2d78]/20 border-2 border-[#ff2d78] mb-4">
                    <span className="text-5xl">✗</span>
                  </div>
                  <h2 className="text-3xl font-black text-[#ff2d78] mb-2">PURCHASE FAILED</h2>
                  <p className="text-gray-400">Something went wrong with your transaction</p>
                </div>

                <div className="mb-8 p-4 rounded-lg bg-[#ff2d78]/10 border border-[#ff2d78]/30">
                  <p className="text-sm text-[#ff2d78]">{purchaseModal.error || 'Unknown error'}</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closePurchaseModal}
                    className="flex-1 py-3 rounded-lg font-bold border border-white/20 text-white hover:border-white/40 transition-colors"
                  >
                    Close
                  </button>

                  <button
                    onClick={() =>
                      setPurchaseModal((prev) => ({ ...prev, step: 'confirm', error: undefined }))
                    }
                    className="flex-1 py-3 rounded-lg font-bold bg-gradient-to-r from-[#00f0ff]/20 to-[#ff2d78]/20 border border-[#00f0ff]/30 text-[#00f0ff] hover:from-[#00f0ff]/40 hover:to-[#ff2d78]/40 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
