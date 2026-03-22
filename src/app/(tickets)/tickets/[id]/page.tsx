'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface TicketTier {
  id: string
  name: string
  price: number
  description: string
  perks: string[]
  remaining: number
  total: number
  tier: 'standard' | 'vip' | 'premium'
}

interface Event {
  id: string
  name: string
  date: string
  time: string
  venue: string
  description: string
  imageGradient: string
  tiers: TicketTier[]
  priceFloor: number
  priceCeiling: number
  isLive?: boolean
  blockchainTxHash?: string
  explorerUrl?: string
}

const MOCK_EVENTS: Record<string, Event> = {
  '1': {
    id: '1',
    name: 'Neon Dreams Festival 2026',
    date: '2026-04-15',
    time: '20:00 - 02:00',
    venue: 'San Francisco Bay Area',
    description:
      "Experience the most immersive electronic music festival of the year. Featuring world-renowned DJs, AI-assisted visual performances, and holographic stage setups. This is not just a concert—it's a journey through digital enlightenment.",
    imageGradient: 'from-cyan-500/40 to-purple-600/40',
    tiers: [
      {
        id: 'ga',
        name: 'General Admission',
        price: 89,
        description: 'Access to all stages and zones',
        perks: ['Main stage access', 'All performances', 'Digital badge collectible'],
        remaining: 240,
        total: 300,
        tier: 'standard',
      },
      {
        id: 'vip',
        name: 'VIP Experience',
        price: 199,
        description: 'Premium access with lounge privileges',
        perks: [
          'VIP Lounge access with premium seating',
          'Complimentary refreshments',
          'Exclusive VIP-only stage view',
          'VIP parking pass',
          'Limited edition merch pack',
        ],
        remaining: 80,
        total: 120,
        tier: 'vip',
      },
      {
        id: 'backstage',
        name: 'Backstage Pass',
        price: 299,
        description: 'The ultimate experience',
        perks: [
          'Exclusive Meet & Greet with headliners',
          'VIP lounge + backstage access',
          'Premium seating all areas',
          'Complimentary VIP dinner',
          'Exclusive limited edition merch collection',
          'Digital collectible hologram NFT',
        ],
        remaining: 20,
        total: 80,
        tier: 'premium',
      },
    ],
    priceFloor: 89,
    priceCeiling: 299,
  },
  '2': {
    id: '2',
    name: 'Virtual Reality Concert Series',
    date: '2026-05-22',
    time: '19:00 - 23:30',
    venue: 'Los Angeles Convention Center',
    description:
      'Immerse yourself in a groundbreaking VR concert experience. Using cutting-edge virtual reality technology, experience your favorite artists in impossible venues—from zero gravity to underwater stages.',
    imageGradient: 'from-cyan-500/50 to-pink-500/30',
    tiers: [
      {
        id: 'vr-basic',
        name: 'Standard VR Experience',
        price: 65,
        description: 'Basic VR access',
        perks: ['VR headset rental', 'Standard quality stream', 'Access to 5 immersive stages'],
        remaining: 156,
        total: 300,
        tier: 'standard',
      },
      {
        id: 'vr-pro',
        name: 'Pro VR Experience',
        price: 149,
        description: 'Enhanced experience with haptic feedback',
        perks: ['VR headset + haptic suit', '4K immersive quality', 'All stages + exclusive areas', 'Post-concert digital replay (7 days)'],
        remaining: 35,
        total: 60,
        tier: 'vip',
      },
      {
        id: 'vr-elite',
        name: 'Elite Creator Pass',
        price: 199,
        description: 'Creator-exclusive tier',
        perks: [
          'Premium haptic suit + latest VR tech',
          '8K immersive quality',
          'Private creator lounge',
          'Lifetime digital replay access',
          'Creator revenue share option',
          'Exclusive NFT creator pass',
        ],
        remaining: 8,
        total: 40,
        tier: 'premium',
      },
    ],
    priceFloor: 65,
    priceCeiling: 199,
  },
  '3': {
    id: '3',
    name: 'Crypto Cup 2026 - Final Match',
    date: '2026-06-10',
    time: '14:00 - 18:00',
    venue: 'MetaStadium NYC',
    description:
      'The championship final of the blockchain gaming league. Watch AI-enhanced players compete in unprecedented digital tournaments with real prize pools. Revolutionary gaming at its finest.',
    imageGradient: 'from-green-400/40 to-cyan-500/40',
    tiers: [
      {
        id: 'general',
        name: 'General Admission',
        price: 149,
        description: 'Standard stadium seating',
        perks: ['General stadium seating', 'Live match commentary', 'Access to highlights reel'],
        remaining: 1250,
        total: 1500,
        tier: 'standard',
      },
      {
        id: 'premium-seating',
        name: 'Premium Seating',
        price: 449,
        description: 'Best views in the stadium',
        perks: [
          'Premium midfield seating',
          'Exclusive stadium club lounge',
          'Complimentary premium concessions',
          'Pro match analysis download',
        ],
        remaining: 200,
        total: 300,
        tier: 'vip',
      },
      {
        id: 'suite',
        name: 'Executive Suite',
        price: 799,
        description: 'The ultimate sports experience',
        perks: [
          'Private VIP suite (12 seats)',
          'Premium catering & bar service',
          'Player autograph meet & greet',
          "Champions' exclusive after-party",
          'Limited edition trophy replica NFT',
        ],
        remaining: 15,
        total: 50,
        tier: 'premium',
      },
    ],
    priceFloor: 149,
    priceCeiling: 799,
  },
  '4': {
    id: '4',
    name: 'The Holographic Opera',
    date: '2026-07-08',
    time: '19:30 - 22:00',
    venue: 'Miami Art Deco Theater',
    description:
      'A revolutionary fusion of classical opera and cutting-edge holographic technology. Watch legendary performers brought to life through quantum computing projection systems in a historic Miami venue.',
    imageGradient: 'from-pink-500/40 to-purple-600/40',
    tiers: [
      {
        id: 'orchestra',
        name: 'Orchestra Level',
        price: 49,
        description: 'Balcony seating',
        perks: ['Balcony seating', 'Digital program guide', 'Access to museum (pre-show)'],
        remaining: 89,
        total: 150,
        tier: 'standard',
      },
      {
        id: 'mezzanine',
        name: 'Mezzanine VIP',
        price: 149,
        description: 'Premium mid-level seating',
        perks: [
          'Mezzanine premium seating',
          'Pre-show champagne reception',
          'Exclusive artist background film',
          'Limited edition program book',
        ],
        remaining: 35,
        total: 80,
        tier: 'vip',
      },
      {
        id: 'main-floor',
        name: 'Main Floor Exclusive',
        price: 249,
        description: 'Best seats in the theater',
        perks: [
          'Front row main floor seating',
          'Post-show meet the artists',
          'Fine dining experience included',
          'Exclusive hologram capture NFT',
          'Lifetime theater membership',
        ],
        remaining: 12,
        total: 70,
        tier: 'premium',
      },
    ],
    priceFloor: 49,
    priceCeiling: 249,
  },
}

export default function EventDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const mockEvent = MOCK_EVENTS[params.id]
  const [event, setEvent] = useState<Event | null>(mockEvent || null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [liveData, setLiveData] = useState<any>(null)
  const [minting, setMinting] = useState(false)

  useEffect(() => {
    if (mockEvent) {
      fetch(`/api/tickets/${params.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.ticket) {
            setLiveData(data.ticket)
            setEvent((prev) =>
              prev
                ? {
                    ...prev,
                    isLive: true,
                    blockchainTxHash: data.ticket.blockchainTxHash,
                    explorerUrl: `https://32f.blockv.io/token/0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06`,
                  }
                : null
            )
          }
        })
        .catch(() => {})
    }
  }, [params.id, mockEvent])

  const handleMintTicket = async (tierId: string) => {
    if (!event) return
    setMinting(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          tierId: tierId,
          ticketData: {
            eventName: event.name,
            eventDate: event.date,
            venue: event.venue,
            category: params.id === '1' || params.id === '2' || params.id === '6' ? 'concert' : params.id === '3' || params.id === '7' ? 'sports' : 'theater',
          },
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Ticket minted successfully!')
      } else {
        alert('Failed to mint ticket: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Network error: ' + String(err))
    }
    setMinting(false)
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#00f0ff] mb-4">Event not found</h1>
          <Link
            href="/tickets"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all"
          >
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes holographic-rotate {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .holographic {
          background-size: 300% 300%;
          animation: holographic-rotate 6s ease infinite;
        }

        .gloss-effect {
          position: relative;
        }

        .gloss-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
          border-radius: inherit;
        }
      `}</style>

      <div className={`relative h-96 overflow-hidden bg-gradient-to-br ${event.imageGradient}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080f] via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-9xl text-white/20">
            {event.id === '1' || event.id === '2' || event.id === '6'
              ? 'music_note'
              : event.id === '3' || event.id === '7'
                ? 'sports_soccer'
                : 'theater_comedy'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-16">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 text-[#00f0ff] hover:text-white transition-colors mb-6"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Events
          </Link>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-[#00f0ff] via-[#ff2d78] to-[#39ff14] bg-clip-text text-transparent">
            {event.name}
          </h1>

          {event.isLive && (
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#39ff14]/10 border border-[#39ff14]/30">
              <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" />
              <span className="text-sm font-bold text-[#39ff14]">LIVE ON DUAL NETWORK</span>
              {event.explorerUrl && (
                <a
                  href={event.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-xs text-[#00f0ff] hover:text-white transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#00f0ff]">calendar_month</span>
              <div>
                <p className="text-sm text-gray-400 mb-1">Date & Time</p>
                <p className="font-semibold">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  • {event.time}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ff2d78]">location_on</span>
              <div>
                <p className="text-sm text-gray-400 mb-1">Venue</p>
                <p className="font-semibold">{event.venue}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#39ff14]">verified</span>
              <div>
                <p className="text-sm text-gray-400 mb-1">Verification</p>
                <p className="font-semibold text-[#39ff14]">DUAL Verified</p>
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">{event.description}</p>
        </div>

        <div className="mb-16">
          <h2 className="text-4xl font-black mb-8 tracking-tight">Ticket Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {event.tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative group gloss-effect rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
                  tier.tier === 'premium' ? 'md:scale-105 md:origin-bottom' : ''
                } ${
                  selectedTier === tier.id
                    ? 'ring-2 ring-[#00f0ff] scale-105'
                    : 'hover:scale-105'
                }`}
                onClick={() => setSelectedTier(tier.id)}
              >
                <div
                  className={`absolute inset-0 -z-10 transition-all duration-300 ${
                    tier.tier === 'premium'
                      ? 'holographic bg-gradient-to-br from-[#ff2d78]/30 via-[#00f0ff]/20 to-[#6c2bd9]/30'
                      : tier.tier === 'vip'
                        ? 'bg-gradient-to-br from-[#ff2d78]/20 to-[#6c2bd9]/20'
                        : 'bg-gradient-to-br from-[#00f0ff]/10 to-[#39ff14]/10'
                  }`}
                />

                <div
                  className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300 ${
                    tier.tier === 'premium'
                      ? 'border-2 border-transparent bg-gradient-to-r from-[#ff2d78] via-[#00f0ff] to-[#6c2bd9] bg-clip-border'
                      : tier.tier === 'vip'
                        ? 'border-2 border-[#ff2d78]/50 group-hover:border-[#ff2d78]'
                        : 'border border-[#00f0ff]/30 group-hover:border-[#00f0ff]/70'
                  }`}
                />

                <div className="relative p-8 flex flex-col h-full">
                  {tier.tier === 'premium' && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#ff2d78] to-[#6c2bd9] w-fit">
                      <span className="material-symbols-outlined text-sm">crown</span>
                      <span className="text-xs font-bold">PREMIUM</span>
                    </div>
                  )}

                  {tier.tier === 'vip' && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff2d78]/20 border border-[#ff2d78]/50 w-fit">
                      <span className="material-symbols-outlined text-sm text-[#ff2d78]">star</span>
                      <span className="text-xs font-bold text-[#ff2d78]">VIP</span>
                    </div>
                  )}

                  <h3 className="text-2xl font-black mb-2">{tier.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 flex-1">{tier.description}</p>

                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Starting at</p>
                    <p className="text-4xl font-black text-[#00f0ff]">
                      ${tier.price}
                      <span className="text-sm text-gray-400 font-normal ml-2">per ticket</span>
                    </p>
                  </div>

                  <div className="mb-6 space-y-2">
                    {tier.perks.map((perk, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="material-symbols-outlined text-xs text-[#39ff14] mt-0.5 flex-shrink-0">
                          check_circle
                        </span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400">Available</span>
                      <span className="text-sm font-bold text-[#00f0ff]">
                        {tier.remaining} / {tier.total}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00f0ff] to-[#39ff14]"
                        style={{
                          width: `${(tier.remaining / tier.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMintTicket(tier.id)
                    }}
                    disabled={minting}
                    className={`w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                      tier.tier === 'premium'
                        ? 'bg-gradient-to-r from-[#ff2d78] to-[#6c2bd9] hover:shadow-[0_0_30px_rgba(255,45,120,0.5)] text-white'
                        : tier.tier === 'vip'
                          ? 'bg-gradient-to-r from-[#ff2d78]/80 to-[#6c2bd9]/80 hover:shadow-[0_0_20px_rgba(255,45,120,0.4)] text-white'
                          : 'bg-gradient-to-r from-[#00f0ff]/30 to-[#39ff14]/30 border border-[#00f0ff]/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] text-[#00f0ff]'
                    } disabled:opacity-50`}
                  >
                    {minting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Minting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">shopping_cart</span>
                        Mint Ticket
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="border border-[#ff2d78]/30 rounded-2xl p-8 bg-gradient-to-br from-[#ff2d78]/10 to-transparent">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#ff2d78] text-3xl">
                verified_user
              </span>
              <div>
                <h3 className="text-xl font-black mb-3 text-white">Anti-Scalp Protection</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Every ticket is protected by on-chain smart contracts that enforce price boundaries:
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff2d78]" />
                    <span>
                      <strong className="text-white">Price Floor:</strong> ${event.priceFloor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff2d78]" />
                    <span>
                      <strong className="text-white">Price Ceiling:</strong> ${event.priceCeiling}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff2d78]" />
                    <span>
                      <strong className="text-white">Enforcement:</strong> Automatic blockchain
                      verification
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[#00f0ff]/30 rounded-2xl p-8 bg-gradient-to-br from-[#00f0ff]/10 to-transparent">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#00f0ff] text-3xl">checklist</span>
              <div>
                <h3 className="text-xl font-black mb-3 text-white">On-Chain Guarantee</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Your ticket is backed by blockchain technology:
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                    <span>Transparent transaction history</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                    <span>Immutable ownership records</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                    <span>Transferable with built-in royalties</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                    <span>Collectible after event</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#39ff14]/30 rounded-2xl p-8 bg-gradient-to-br from-[#39ff14]/5 to-transparent">
          <h3 className="text-2xl font-black mb-6 text-white">Blockchain Provenance</h3>
          {event.isLive && event.blockchainTxHash && (
            <div className="mb-6 p-4 rounded-lg border border-[#39ff14]/30 bg-[#39ff14]/5">
              <p className="text-xs text-gray-400 mb-2">Transaction Hash</p>
              <p className="font-mono text-sm text-[#39ff14] break-all mb-4">{event.blockchainTxHash}</p>
              {event.explorerUrl && (
                <a
                  href={event.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14] text-sm font-semibold hover:bg-[#39ff14]/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  View on Blockscout Explorer
                </a>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-2">
                <h4 className="font-bold text-lg mb-4 text-white">Contract Details</h4>
                <div className="space-y-3 text-gray-300 text-sm">
                  <p>
                    <strong className="text-white">Address:</strong>{' '}
                    <span className="font-mono text-[#00f0ff]">0x41Cf...FF06</span>
                  </p>
                  <p>
                    <strong className="text-white">Standard:</strong>{' '}
                    <span className="font-mono text-[#39ff14]">ERC-721</span>
                  </p>
                  <p>
                    <strong className="text-white">Chain:</strong>{' '}
                    <span className="font-mono text-[#ff2d78]">DUAL Network</span>
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <h4 className="font-bold text-lg mb-4 text-white">Security Features</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#39ff14] mt-1">✓</span>
                    <span>Smart contract audit verified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#39ff14] mt-1">✓</span>
                    <span>Multi-signature authorization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#39ff14] mt-1">✓</span>
                    <span>Real-time price enforcement</span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <h4 className="font-bold text-lg mb-4 text-white">Audit Trail</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>All mints, transfers, and metadata changes are permanently recorded on the DUAL Network blockchain.</p>
                  <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
