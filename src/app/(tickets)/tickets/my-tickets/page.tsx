'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Ticket {
  id: string
  eventName: string
  date: string
  venue: string
  tier: 'general' | 'vip' | 'backstage'
  status: 'valid' | 'scanned' | 'collectible'
  section: string
  seat: string
  qrCode: string
  transactionHash: string
  mintedDate: string
  isLive?: boolean
  objectId?: string
  integrityHash?: string
  explorerUrl?: string
  ownerId?: string
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'demo-1',
    eventName: 'Neon Dreams Festival 2026',
    date: '2026-04-15',
    venue: 'San Francisco Bay Area',
    tier: 'backstage',
    status: 'valid',
    section: 'VIP',
    seat: 'B-142',
    qrCode: 'QR_CODE_001',
    transactionHash: '0x7a8f...9d2c',
    mintedDate: '2026-03-10',
  },
  {
    id: 'demo-2',
    eventName: 'Virtual Reality Concert Series',
    date: '2026-05-22',
    venue: 'Los Angeles Convention Center',
    tier: 'vip',
    status: 'valid',
    section: 'Premium',
    seat: 'A-055',
    qrCode: 'QR_CODE_002',
    transactionHash: '0x4b3e...6a1f',
    mintedDate: '2026-03-08',
  },
  {
    id: 'demo-3',
    eventName: 'Crypto Cup 2026 - Final Match',
    date: '2026-06-10',
    venue: 'MetaStadium NYC',
    tier: 'general',
    status: 'scanned',
    section: 'Lower Bowl',
    seat: 'C-287',
    qrCode: 'QR_CODE_003',
    transactionHash: '0x2d9c...5e7b',
    mintedDate: '2026-02-28',
  },
  {
    id: 'demo-4',
    eventName: 'The Holographic Opera',
    date: '2026-07-08',
    venue: 'Miami Art Deco Theater',
    tier: 'backstage',
    status: 'collectible',
    section: 'Main Floor',
    seat: 'F-018',
    qrCode: 'QR_CODE_004',
    transactionHash: '0x8f2a...4c9e',
    mintedDate: '2026-02-15',
  },
]

const DUAL_CONTRACT = '0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06'
const BLOCKSCOUT = 'https://32f.blockv.io'

export default function MyTicketsPage() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const [liveTickets, setLiveTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [transferModal, setTransferModal] = useState<string | null>(null)
  const [transferEmail, setTransferEmail] = useState('')
  const [transferring, setTransferring] = useState(false)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [actionResult, setActionResult] = useState<{
    type: string
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    fetch('/api/tickets')
      .then((r) => r.json())
      .then((data) => {
        const tickets = data.tickets || []
        const mapped: Ticket[] = tickets.map((t: any) => ({
          id: t.id,
          eventName: t.ticketData?.eventName || t.ticketData?.name || 'Event Ticket',
          date: t.ticketData?.eventDate || t.createdAt?.split('T')[0] || '',
          venue: t.ticketData?.venue || 'DUAL Network',
          tier: (t.ticketData?.tier || 'general') as any,
          status: (t.status || 'valid') as any,
          section: t.ticketData?.section || 'On-Chain',
          seat: t.ticketData?.seat || 'NFT',
          qrCode: t.id?.slice(0, 12) || 'DUAL',
          transactionHash: t.blockchainTxHash || t.id?.slice(0, 16) || '',
          mintedDate: t.createdAt?.split('T')[0] || '',
          isLive: true,
          objectId: t.objectId || t.id,
          integrityHash: t.blockchainTxHash,
          explorerUrl: t.blockchainTxHash
            ? `${BLOCKSCOUT}/token/${DUAL_CONTRACT}`
            : undefined,
          ownerId: t.ownerId,
        }))
        setLiveTickets(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const allTickets = [...liveTickets, ...MOCK_TICKETS]

  const toggleFlip = (ticketId: string) => {
    setFlipped((prev) => ({ ...prev, [ticketId]: !prev[ticketId] }))
  }

  const handleTransfer = async (ticketId: string) => {
    if (!transferEmail) return
    setTransferring(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: transferEmail }),
      })
      const data = await res.json()
      if (data.success) {
        setActionResult({
          type: 'transfer',
          success: true,
          message: `Transferred to ${transferEmail}`,
        })
      } else {
        setActionResult({
          type: 'transfer',
          success: false,
          message: data.error || 'Transfer failed',
        })
      }
    } catch {
      setActionResult({
        type: 'transfer',
        success: false,
        message: 'Network error',
      })
    }
    setTransferring(false)
    setTransferModal(null)
    setTransferEmail('')
    setTimeout(() => setActionResult(null), 5000)
  }

  const handleVerify = async (ticketId: string) => {
    setVerifying(ticketId)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/verify`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setActionResult({
          type: 'verify',
          success: true,
          message: 'Ticket verified on-chain!',
        })
      } else {
        setActionResult({
          type: 'verify',
          success: false,
          message: data.error || 'Verification failed',
        })
      }
    } catch {
      setActionResult({
        type: 'verify',
        success: false,
        message: 'Network error',
      })
    }
    setVerifying(null)
    setTimeout(() => setActionResult(null), 5000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return {
          bg: 'bg-[#39ff14]/20',
          border: 'border-[#39ff14]/50',
          text: 'text-[#39ff14]',
          glow: 'shadow-[0_0_20px_rgba(57,255,20,0.3)]',
        }
      case 'scanned':
        return {
          bg: 'bg-amber-600/20',
          border: 'border-amber-500/50',
          text: 'text-amber-400',
          glow: 'shadow-[0_0_20px_rgba(217,119,6,0.3)]',
        }
      case 'collectible':
        return {
          bg: 'bg-gradient-to-r from-pink-600/20 to-purple-600/20',
          border: 'border-pink-500/50',
          text: 'text-pink-400',
          glow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]',
        }
      default:
        return {
          bg: 'bg-gray-600/20',
          border: 'border-gray-500/50',
          text: 'text-gray-400',
          glow: 'shadow-[0_0_20px_rgba(107,114,128,0.3)]',
        }
    }
  }

  return (
    <div className="min-h-screen relative">
      <style>{`
        .ticket-card {
          perspective: 1000px;
          transform-style: preserve-3d;
          transition: transform 0.6s;
        }
        .ticket-card.flipped {
          transform: rotateY(180deg);
        }
        .ticket-front, .ticket-back {
          backface-visibility: hidden;
        }
        .ticket-back {
          transform: rotateY(180deg);
        }
        @keyframes holographic-border {
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
        .holographic-border {
          background-size: 200% 200%;
          animation: holographic-border 3s ease infinite;
        }
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(57, 255, 20, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(57, 255, 20, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(57, 255, 20, 0);
          }
        }
        .pulse-ring {
          animation: pulse-ring 2s infinite;
        }
        .ticket-slot {
          opacity: 0;
          animation: slideIn 0.6s ease forwards;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .ticket-slot:nth-child(1) {
          animation-delay: 0s;
        }
        .ticket-slot:nth-child(2) {
          animation-delay: 0.1s;
        }
        .ticket-slot:nth-child(3) {
          animation-delay: 0.2s;
        }
        .ticket-slot:nth-child(4) {
          animation-delay: 0.3s;
        }
        .ticket-slot:nth-child(5) {
          animation-delay: 0.4s;
        }
        .ticket-slot:nth-child(6) {
          animation-delay: 0.5s;
        }
        @keyframes shift {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>

      {actionResult && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 transition-all ${
            actionResult.success
              ? 'bg-[#39ff14]/10 border-[#39ff14]/50 text-[#39ff14]'
              : 'bg-[#ff2d78]/10 border-[#ff2d78]/50 text-[#ff2d78]'
          }`}
        >
          <span className="material-symbols-outlined">
            {actionResult.success ? 'check_circle' : 'error'}
          </span>
          <span className="font-semibold">{actionResult.message}</span>
        </div>
      )}

      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a0a12] border border-[#00f0ff]/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_60px_rgba(0,240,255,0.2)]">
            <h3 className="text-2xl font-black text-white mb-2">Transfer Ticket</h3>
            <p className="text-gray-400 mb-6">Transfer this NFT ticket to another wallet via email</p>
            <input
              type="email"
              placeholder="Recipient email address"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#00f0ff] focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTransferModal(null)
                  setTransferEmail('')
                }}
                className="flex-1 py-3 rounded-lg border border-white/10 text-gray-400 font-semibold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTransfer(transferModal)}
                disabled={transferring || !transferEmail}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] text-black font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {transferring ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />{' '}
                    Transferring...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">send</span> Transfer
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              This executes an on-chain transfer via DUAL ebus.execute()
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-[#00f0ff] via-[#ff2d78] to-[#39ff14] bg-clip-text text-transparent">
            My Tickets
          </h1>
          <p className="text-lg text-gray-300">
            Your collection of on-chain verified event tickets and collectibles
          </p>
        </div>

        {!loading && allTickets.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-8xl text-[#00f0ff]/30 block mb-6">
              confirmation_number
            </span>
            <h2 className="text-3xl font-bold text-white mb-4">No Tickets Yet</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              You haven't purchased any tickets yet. Explore upcoming events and join the web3 ticketing
              revolution.
            </p>
            <Link
              href="/tickets"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all"
            >
              <span className="material-symbols-outlined">explore</span>
              Browse Events
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
              <div className="p-4 rounded-xl border border-[#00f0ff]/30 bg-[#00f0ff]/5">
                <p className="text-sm text-gray-400 mb-2">Total Tickets</p>
                <p className="text-3xl font-black text-[#00f0ff]">{allTickets.length}</p>
              </div>
              <div className="p-4 rounded-xl border border-[#39ff14]/30 bg-[#39ff14]/5">
                <p className="text-sm text-gray-400 mb-2">On-Chain</p>
                <p className="text-3xl font-black text-[#39ff14]">{liveTickets.length}</p>
              </div>
              <div className="p-4 rounded-xl border border-[#39ff14]/30 bg-[#39ff14]/5">
                <p className="text-sm text-gray-400 mb-2">Valid</p>
                <p className="text-3xl font-black text-[#39ff14]">
                  {allTickets.filter((t) => t.status === 'valid').length}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-600/5">
                <p className="text-sm text-gray-400 mb-2">Already Used</p>
                <p className="text-3xl font-black text-amber-400">
                  {allTickets.filter((t) => t.status === 'scanned').length}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-pink-500/30 bg-pink-600/5">
                <p className="text-sm text-gray-400 mb-2">Collectibles</p>
                <p className="text-3xl font-black text-pink-400">
                  {allTickets.filter((t) => t.status === 'collectible').length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {allTickets.map((ticket) => {
                const colors = getStatusColor(ticket.status)
                const isFlipped = flipped[ticket.id]

                return (
                  <div key={ticket.id} className="ticket-slot">
                    <div
                      className={`ticket-card relative cursor-pointer ${isFlipped ? 'flipped' : ''}`}
                      onClick={() => toggleFlip(ticket.id)}
                    >
                      <div className="ticket-front">
                        <div
                          className={`relative rounded-2xl overflow-hidden border-2 ${colors.border} p-8 ${colors.glow} ${colors.bg} backdrop-blur-sm transition-all duration-300`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-2">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} border ${colors.border}`}>
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      ticket.status === 'valid'
                                        ? 'bg-[#39ff14] pulse-ring'
                                        : ticket.status === 'scanned'
                                          ? 'bg-amber-400'
                                          : 'bg-pink-400'
                                    }`}
                                  />
                                  <span className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>
                                    {ticket.status}
                                  </span>
                                </div>
                                {ticket.isLive && (
                                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#39ff14]/10 border border-[#39ff14]/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
                                    <span className="text-xs font-bold text-[#39ff14]">ON-CHAIN</span>
                                  </div>
                                )}
                              </div>
                              <span className="material-symbols-outlined text-gray-400">flip</span>
                            </div>

                            <div className="mb-6">
                              <h3 className="text-2xl font-black text-white mb-2 line-clamp-2">
                                {ticket.eventName}
                              </h3>
                              <div className="space-y-1 text-sm text-gray-300">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-sm text-[#00f0ff]">
                                    calendar_month
                                  </span>
                                  {new Date(ticket.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-sm text-[#ff2d78]">
                                    location_on
                                  </span>
                                  {ticket.venue}
                                </div>
                              </div>
                            </div>

                            <div className="mb-6 inline-flex gap-2">
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                                  ticket.tier === 'backstage'
                                    ? 'bg-gradient-to-r from-[#ff2d78] to-[#6c2bd9] text-white'
                                    : ticket.tier === 'vip'
                                      ? 'bg-[#ff2d78]/30 border border-[#ff2d78]/50 text-[#ff2d78]'
                                      : 'bg-[#00f0ff]/30 border border-[#00f0ff]/50 text-[#00f0ff]'
                                }`}
                              >
                                {ticket.tier === 'backstage'
                                  ? 'Backstage Pass'
                                  : ticket.tier === 'vip'
                                    ? 'VIP'
                                    : 'General Admission'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-xs text-gray-400 mb-1">Section</p>
                                <p className="font-black text-lg text-[#00f0ff]">{ticket.section}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-xs text-gray-400 mb-1">Seat</p>
                                <p className="font-black text-lg text-[#39ff14]">{ticket.seat}</p>
                              </div>
                            </div>

                            <div className="mb-6 flex justify-center">
                              <div className="w-32 h-32 rounded-xl bg-white/10 border-2 border-dashed border-[#00f0ff]/50 flex items-center justify-center">
                                <div className="text-center">
                                  <span className="material-symbols-outlined text-4xl text-[#00f0ff]/50">
                                    qr_code
                                  </span>
                                  <p className="text-xs text-gray-500 mt-2">{ticket.qrCode}</p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => (ticket.isLive ? setTransferModal(ticket.id) : null)}
                                className={`px-4 py-2 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/50 text-[#00f0ff] font-bold text-sm hover:bg-[#00f0ff]/30 transition-all flex items-center justify-center gap-2 ${
                                  !ticket.isLive ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">send</span>
                                Transfer
                              </button>
                              <button
                                onClick={() => (ticket.isLive ? handleVerify(ticket.id) : null)}
                                disabled={verifying === ticket.id}
                                className={`px-4 py-2 rounded-lg bg-[#39ff14]/20 border border-[#39ff14]/50 text-[#39ff14] font-bold text-sm hover:bg-[#39ff14]/30 transition-all flex items-center justify-center gap-2 ${
                                  !ticket.isLive ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {verifying === ticket.id ? (
                                  <span className="w-4 h-4 border-2 border-[#39ff14]/30 border-t-[#39ff14] rounded-full animate-spin" />
                                ) : (
                                  <span className="material-symbols-outlined text-sm">verified</span>
                                )}
                                Verify
                              </button>
                              <button className="px-4 py-2 rounded-lg bg-[#ff2d78]/20 border border-[#ff2d78]/50 text-[#ff2d78] font-bold text-sm hover:bg-[#ff2d78]/30 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">sell</span>
                                List
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ticket-back absolute inset-0 rounded-2xl border-2 border-[#6c2bd9]/50">
                        <div className="h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#6c2bd9]/20 to-[#00f0ff]/10 p-8 flex flex-col justify-between border border-[#6c2bd9]/50">
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `linear-gradient(45deg, transparent 30%, rgba(108, 43, 217, 0.1) 50%, transparent 70%)`,
                              backgroundSize: '200% 200%',
                              animation: 'shift 3s infinite',
                            }}
                          />
                          <div className="relative z-10">
                            {ticket.isLive && (
                              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39ff14]/10 border border-[#39ff14]/30">
                                <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" />
                                <span className="text-xs font-bold text-[#39ff14]">LIVE ON DUAL NETWORK</span>
                              </div>
                            )}
                            <div className="mb-6">
                              <p className="text-xs text-gray-400 mb-1">
                                {ticket.isLive ? 'Integrity Hash' : 'Transaction Hash'}
                              </p>
                              <p className="font-mono text-sm text-[#6c2bd9] break-all">
                                {ticket.transactionHash}
                              </p>
                            </div>
                            <div className="mb-6 p-4 rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/5">
                              <p className="text-xs text-gray-400 mb-2">On-Chain Details</p>
                              <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex items-center justify-between">
                                  <span>Contract:</span>
                                  <span className="font-mono text-[#00f0ff]">
                                    {DUAL_CONTRACT.slice(0, 6)}...{DUAL_CONTRACT.slice(-4)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Token Standard:</span>
                                  <span className="font-mono text-[#39ff14]">ERC-721</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Chain:</span>
                                  <span className="font-mono text-[#ff2d78]">DUAL Network</span>
                                </div>
                                {ticket.ownerId && (
                                  <div className="flex items-center justify-between">
                                    <span>Owner:</span>
                                    <span className="font-mono text-[#6c2bd9] text-xs">
                                      {ticket.ownerId.slice(0, 8)}...{ticket.ownerId.slice(-4)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <p className="text-xs text-gray-400 mb-1">Minted</p>
                              <p className="text-sm text-gray-300">
                                {new Date(ticket.mintedDate).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                            {ticket.isLive && ticket.explorerUrl && (
                              <a
                                href={ticket.explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-sm font-semibold hover:bg-[#00f0ff]/20 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                View on Blockscout
                              </a>
                            )}
                          </div>
                          <div className="relative z-10 text-center text-xs text-gray-500">
                            Click to flip back
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-16 p-8 rounded-2xl border border-[#39ff14]/30 bg-gradient-to-r from-[#39ff14]/10 to-transparent">
              <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">Explore the Marketplace</h3>
                  <p className="text-gray-300">
                    Discover and trade verified tickets from other collectors
                  </p>
                </div>
                <Link
                  href="/tickets/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#39ff14]/30 to-[#00f0ff]/30 border border-[#39ff14]/50 hover:border-[#39ff14] text-[#39ff14] font-bold hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all whitespace-nowrap"
                >
                  <span className="material-symbols-outlined">storefront</span>
                  Explore Marketplace
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
