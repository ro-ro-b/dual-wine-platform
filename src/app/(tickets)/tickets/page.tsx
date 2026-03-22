'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Event {
  id: string
  name: string
  date: string
  venue: string
  type: 'concert' | 'sports' | 'theater' | 'conference'
  priceRange: { min: number; max: number }
  available: number
  total: number
  imageGradient: string
  isLive?: boolean
  blockchainTxHash?: string
  explorerUrl?: string
}

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Neon Dreams Festival 2026',
    date: '2026-04-15',
    venue: 'San Francisco Bay Area',
    type: 'concert',
    priceRange: { min: 89, max: 299 },
    available: 340,
    total: 500,
    imageGradient: 'from-cyan-500/40 to-purple-600/40',
  },
  {
    id: '2',
    name: 'Virtual Reality Concert Series',
    date: '2026-05-22',
    venue: 'Los Angeles Convention Center',
    type: 'concert',
    priceRange: { min: 65, max: 199 },
    available: 156,
    total: 400,
    imageGradient: 'from-cyan-500/50 to-pink-500/30',
  },
  {
    id: '3',
    name: 'Crypto Cup 2026 - Final Match',
    date: '2026-06-10',
    venue: 'MetaStadium NYC',
    type: 'sports',
    priceRange: { min: 149, max: 799 },
    available: 1250,
    total: 2000,
    imageGradient: 'from-green-400/40 to-cyan-500/40',
  },
  {
    id: '4',
    name: 'The Holographic Opera',
    date: '2026-07-08',
    venue: 'Miami Art Deco Theater',
    type: 'theater',
    priceRange: { min: 49, max: 249 },
    available: 89,
    total: 300,
    imageGradient: 'from-pink-500/40 to-purple-600/40',
  },
  {
    id: '5',
    name: 'Web3 Summit 2026',
    date: '2026-08-03',
    venue: 'Denver Convention Center',
    type: 'conference',
    priceRange: { min: 299, max: 999 },
    available: 450,
    total: 1000,
    imageGradient: 'from-purple-600/40 to-blue-500/40',
  },
  {
    id: '6',
    name: 'Cyberpunk Live: Electric Revolution',
    date: '2026-04-28',
    venue: 'Seattle Paramount Theatre',
    type: 'concert',
    priceRange: { min: 79, max: 249 },
    available: 223,
    total: 500,
    imageGradient: 'from-cyan-400/50 to-magenta-500/40',
  },
  {
    id: '7',
    name: 'AI vs Humans: Esports Championship',
    date: '2026-05-14',
    venue: 'Tokyo International Center',
    type: 'sports',
    priceRange: { min: 39, max: 199 },
    available: 567,
    total: 1000,
    imageGradient: 'from-lime-400/40 to-cyan-500/40',
  },
  {
    id: '8',
    name: 'The Digital Canvas: Immersive Art Experience',
    date: '2026-06-30',
    venue: 'London National Gallery (Web3 Wing)',
    type: 'theater',
    priceRange: { min: 69, max: 199 },
    available: 134,
    total: 400,
    imageGradient: 'from-fuchsia-500/40 to-purple-600/40',
  },
  {
    id: '9',
    name: 'Future Tech Innovators Summit',
    date: '2026-09-12',
    venue: 'Berlin Tech Hub',
    type: 'conference',
    priceRange: { min: 199, max: 599 },
    available: 320,
    total: 800,
    imageGradient: 'from-indigo-500/40 to-blue-600/40',
  },
  {
    id: '10',
    name: 'Synth Wave Night: Retrowave Festival',
    date: '2026-07-19',
    venue: 'Chicago Navy Pier',
    type: 'concert',
    priceRange: { min: 55, max: 175 },
    available: 412,
    total: 600,
    imageGradient: 'from-pink-500/50 to-cyan-400/40',
  },
]

export default function TicketsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [glitchText, setGlitchText] = useState(false)
  const [liveTickets, setLiveTickets] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tickets')
      .then((r) => r.json())
      .then((data) => {
        const tickets = data.tickets || []
        const mapped: Event[] = tickets.map((t: any) => ({
          id: t.id,
          name: t.ticketData?.eventName || t.ticketData?.name || 'Event Ticket',
          date: t.ticketData?.eventDate || t.createdAt,
          venue: t.ticketData?.venue || 'DUAL Network',
          type: (t.ticketData?.category || 'concert') as any,
          priceRange: {
            min: t.ticketData?.price || 0,
            max: t.ticketData?.maxResalePrice || t.ticketData?.price || 0,
          },
          available: 1,
          total: 1,
          imageGradient: 'from-[#00f0ff]/40 to-[#39ff14]/40',
          isLive: true,
          blockchainTxHash: t.blockchainTxHash,
          explorerUrl: t.blockchainTxHash
            ? `https://32f.blockv.io/token/0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06`
            : undefined,
        }))
        setLiveTickets(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchText(true)
      setTimeout(() => setGlitchText(false), 100)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'concert', label: 'Concerts' },
    { id: 'sports', label: 'Sports' },
    { id: 'theater', label: 'Theater' },
    { id: 'conference', label: 'Conferences' },
  ]

  const allEvents = [...liveTickets, ...MOCK_EVENTS]
  const filteredEvents =
    selectedCategory === 'all'
      ? allEvents
      : allEvents.filter((event) => event.type === selectedCategory)

  return (
    <div className="min-h-screen relative">
      <style>{`
        @keyframes glitch {
          0% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(0);
          }
          20% {
            clip-path: inset(92% 0 1% 0);
            transform: translate(-2px, 2px);
          }
          40% {
            clip-path: inset(43% 0 1% 0);
            transform: translate(-2px, -2px);
          }
          60% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(2px, -2px);
          }
          80% {
            clip-path: inset(54% 0 7% 0);
            transform: translate(2px, 2px);
          }
          100% {
            clip-path: inset(58% 0 43% 0);
            transform: translate(0);
          }
        }
        @keyframes scroll-ticker {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .glitch-active {
          animation: glitch 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .scroll-ticker {
          animation: scroll-ticker 20s linear infinite;
        }
        .ticker-content:hover {
          animation-play-state: paused;
        }
        @keyframes pulse-glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(0, 240, 255, 0.3), 0 0 20px rgba(255, 45, 120, 0.1);
          }
          50% {
            text-shadow: 0 0 20px rgba(0, 240, 255, 0.8), 0 0 40px rgba(255, 45, 120, 0.3);
          }
        }
        .pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer {
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      <div className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1
              className={`text-6xl md:text-8xl font-black mb-4 tracking-tight relative inline-block ${
                glitchText ? 'glitch-active' : ''
              }`}
              style={{
                backgroundImage: 'linear-gradient(135deg, #00f0ff 0%, #ff2d78 50%, #39ff14 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              The Future of
              <br />
              Live Events
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mt-6 pulse-glow">
              Experience on-chain verified tickets with anti-scalp protection and true ownership.
            </p>
          </div>

          <div className="mb-16 overflow-hidden rounded-lg border border-[#00f0ff]/30 bg-[#08080f]/50 backdrop-blur-sm">
            <div className="py-4 bg-gradient-to-r from-transparent via-[#00f0ff]/10 to-transparent">
              <div className="flex whitespace-nowrap scroll-ticker ticker-content gap-8 px-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i} className="text-lg font-bold tracking-widest">
                      <span className="text-[#00f0ff]">●</span> NOW ON-CHAIN{' '}
                      <span className="text-[#ff2d78]">●</span> VERIFIED{' '}
                      <span className="text-[#39ff14]">●</span> ANTI-SCALP{' '}
                      <span className="text-[#00f0ff]">●</span> TRANSFERABLE
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {liveTickets.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-[#39ff14]/30 bg-[#39ff14]/5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#39ff14] animate-pulse" />
              <span className="text-[#39ff14] font-bold text-lg">{liveTickets.length}</span>
            </div>
            <span className="text-gray-300">
              ticket{liveTickets.length !== 1 ? 's' : ''} live on{' '}
              <span className="text-[#00f0ff] font-semibold">DUAL Network</span>
            </span>
            <a
              href="https://32f.blockv.io/token/0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-sm text-[#00f0ff] hover:text-white transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              View on Explorer
            </a>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 text-sm ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] text-black shadow-[0_0_20px_rgba(0,240,255,0.5)]'
                  : 'bg-white/5 text-gray-300 border border-white/10 hover:border-[#00f0ff]/50 hover:text-[#00f0ff]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[#0a0a12] overflow-hidden">
                <div className="h-40 shimmer" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-3/4 rounded shimmer" />
                  <div className="h-4 w-1/2 rounded shimmer" />
                  <div className="h-4 w-2/3 rounded shimmer" />
                  <div className="h-10 rounded shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <Link key={event.id} href={`/tickets/${event.id}`}>
                <div className="h-full group cursor-pointer">
                  <div
                    className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a12] h-full flex flex-col transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,240,255,0.2)] hover:-translate-y-1"
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(0, 240, 255, 0.05), rgba(255, 45, 120, 0.05))`,
                    }}
                  >
                    <div
                      className={`h-40 bg-gradient-to-br ${event.imageGradient} relative overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="text-center">
                        <span className="material-symbols-outlined text-5xl text-white/40">
                          {event.type === 'concert'
                            ? 'music_note'
                            : event.type === 'sports'
                              ? 'sports_soccer'
                              : event.type === 'theater'
                                ? 'theater_comedy'
                                : 'school'}
                        </span>
                      </div>
                      {event.isLive ? (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#39ff14]/90 text-black text-xs font-black flex items-center gap-1 shadow-[0_0_15px_rgba(57,255,20,0.5)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                          LIVE ON-CHAIN
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-gray-300 text-xs font-semibold">
                          DEMO
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-lg leading-tight flex-1 group-hover:text-[#00f0ff] transition-colors">
                            {event.name}
                          </h3>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
                          <span className="text-xs font-semibold text-[#00f0ff]">
                            {event.isLive ? 'Anchored on DUAL' : 'Verified on DUAL'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="material-symbols-outlined text-sm">calendar_month</span>
                          <span>
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span className="truncate">{event.venue}</span>
                        </div>
                        {event.isLive && event.blockchainTxHash && (
                          <div className="flex items-center gap-2 text-sm text-[#39ff14]">
                            <span className="material-symbols-outlined text-sm">link</span>
                            <span className="font-mono truncate text-xs">
                              {event.blockchainTxHash.slice(0, 16)}...
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mb-4 p-3 rounded-lg bg-white/5 border border-[#39ff14]/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-400">Available</span>
                          <span className="text-sm font-bold text-[#39ff14]">
                            {event.available} of {event.total}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#39ff14] to-[#00f0ff]"
                            style={{
                              width: `${(event.available / event.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">From</p>
                          <p className="text-lg font-bold text-[#00f0ff]">
                            ${event.priceRange.min}
                            <span className="text-sm text-gray-500 font-normal ml-1">
                              - ${event.priceRange.max}
                            </span>
                          </p>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00f0ff]/20 to-[#ff2d78]/20 border border-[#00f0ff]/30 text-[#00f0ff] font-semibold text-sm hover:from-[#00f0ff]/40 hover:to-[#ff2d78]/40 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300">
                          {event.isLive ? 'View Token' : 'Explore'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
