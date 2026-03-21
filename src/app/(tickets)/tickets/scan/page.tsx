'use client'

import Link from 'next/link'
import { useState } from 'react'

interface VerificationResult {
  status: 'valid' | 'duplicate' | 'invalid' | null
  ticketId: string
  eventName: string
  tier: string
  originalPrice: number
  maxResalePrice: number
  holder: string
  seat: string
  verificationHash: string
  verificationTime: string
  reason?: string
}

interface ScanStats {
  scannedToday: number
  validScans: number
  rejectedScans: number
}

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  general: { bg: 'from-[#00f0ff]/10 to-transparent', text: 'text-[#00f0ff]', border: 'border-[#00f0ff]/30' },
  vip: { bg: 'from-[#ff2d78]/10 to-transparent', text: 'text-[#ff2d78]', border: 'border-[#ff2d78]/30' },
  backstage: { bg: 'from-[#6c2bd9]/10 to-transparent', text: 'text-[#6c2bd9]', border: 'border-[#6c2bd9]/30' },
  premium: { bg: 'from-[#ff00e5]/10 to-transparent', text: 'text-[#ff00e5]', border: 'border-[#ff00e5]/30' },
}

export default function ScannerPage() {
  const [ticketIdInput, setTicketIdInput] = useState('')
  const [verificationStep, setVerificationStep] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<ScanStats>({
    scannedToday: 0,
    validScans: 0,
    rejectedScans: 0,
  })

  const handleScanTicket = async () => {
    if (!ticketIdInput.trim()) {
      alert('Please enter a ticket ID')
      return
    }

    setLoading(true)
    setVerificationStep(1)
    setResult(null)

    try {
      // Simulate step 1: Reading QR Code
      await new Promise((r) => setTimeout(r, 1000))
      setVerificationStep(2)

      // Simulate step 2: Querying DUAL Network
      await new Promise((r) => setTimeout(r, 1000))
      setVerificationStep(3)

      // Call verify API
      const verifyResponse = await fetch(`/api/tickets/${ticketIdInput}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const verifyData = await verifyResponse.json()

      // Simulate step 3: Verifying On-Chain
      await new Promise((r) => setTimeout(r, 1000))
      setVerificationStep(4)

      // Fetch ticket details
      const ticketResponse = await fetch(`/api/tickets/${ticketIdInput}`)
      const ticketData = await ticketResponse.json()

      if (!ticketData || !ticketData.ticketData) {
        setResult({
          status: 'invalid',
          ticketId: ticketIdInput,
          eventName: 'Unknown',
          tier: 'Unknown',
          originalPrice: 0,
          maxResalePrice: 0,
          holder: 'Unknown',
          seat: 'Unknown',
          verificationHash: 'N/A',
          verificationTime: new Date().toISOString(),
          reason: 'Ticket not found',
        })
      } else {
        // Simulate step 4: Checking Anti-Scalp Compliance
        await new Promise((r) => setTimeout(r, 800))
        setVerificationStep(0)

        // Generate mock verification data
        setResult({
          status: 'valid',
          ticketId: ticketIdInput,
          eventName: ticketData.ticketData.eventName || 'Event',
          tier: ticketData.ticketData.tier || 'general',
          originalPrice: ticketData.ticketData.originalPrice || ticketData.ticketData.price || 0,
          maxResalePrice: ticketData.ticketData.maxResalePrice || 0,
          holder: ticketData.ownerId?.slice(0, 10) + '...' || 'Unknown',
          seat: ticketData.ticketData.seat || 'No seat assigned',
          verificationHash: ticketData.blockchainTxHash || '0x' + Math.random().toString(16).slice(2),
          verificationTime: new Date().toISOString(),
        })

        setStats((prev) => ({
          ...prev,
          scannedToday: prev.scannedToday + 1,
          validScans: prev.validScans + 1,
        }))
      }
    } catch (err) {
      setVerificationStep(0)
      setResult({
        status: 'invalid',
        ticketId: ticketIdInput,
        eventName: 'Error',
        tier: 'Unknown',
        originalPrice: 0,
        maxResalePrice: 0,
        holder: 'Unknown',
        seat: 'Unknown',
        verificationHash: 'N/A',
        verificationTime: new Date().toISOString(),
        reason: String(err),
      })
      setStats((prev) => ({
        ...prev,
        scannedToday: prev.scannedToday + 1,
        rejectedScans: prev.rejectedScans + 1,
      }))
    }

    setLoading(false)
  }

  const handleScanNext = () => {
    setTicketIdInput('')
    setResult(null)
    setVerificationStep(0)
  }

  const tierColor =
    result && result.tier in tierColors
      ? tierColors[result.tier]
      : tierColors['general']

  return (
    <div className="min-h-screen relative">
      <style>{`
        @keyframes scan-pulse {
          0%, 100% {
            box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.3);
          }
          50% {
            box-shadow: inset 0 0 40px rgba(0, 240, 255, 0.6);
          }
        }

        @keyframes network-pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes block-chain {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes anti-scalp-check {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .scan-pulse {
          animation: scan-pulse 2s ease-in-out infinite;
        }

        .network-pulse {
          animation: network-pulse 1.5s ease-in-out infinite;
        }

        .block-animation {
          position: relative;
          overflow: hidden;
        }

        .block-animation::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(57, 255, 20, 0.4), transparent);
          animation: block-chain 2s ease-in-out infinite;
        }

        .anti-scalp-check {
          animation: anti-scalp-check 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 text-[#00f0ff] hover:text-white transition-colors mb-6"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Events
          </Link>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-3 bg-gradient-to-r from-[#00f0ff] via-[#ff2d78] to-[#39ff14] bg-clip-text text-transparent">
            VENUE SCANNER
          </h1>
          <p className="text-lg text-gray-300">DUAL TICKET VERIFICATION SYSTEM</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scanner Area */}
          <div className="lg:col-span-2">
            <div className="border border-[#00f0ff]/30 rounded-2xl p-8 bg-gradient-to-br from-[#00f0ff]/5 to-transparent">
              {/* QR Scan Area */}
              <div className="mb-8">
                <div className="scan-pulse border-2 border-[#00f0ff] rounded-xl p-12 bg-[#00f0ff]/5 flex flex-col items-center justify-center min-h-80 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-32 h-32 border-2 border-[#00f0ff]/50 rounded" />
                    <div className="absolute top-0 right-1/4 w-32 h-32 border-2 border-[#00f0ff]/50 rounded" />
                    <div className="absolute bottom-0 left-1/4 w-32 h-32 border-2 border-[#00f0ff]/50 rounded" />
                    <div className="absolute bottom-0 right-1/4 w-32 h-32 border-2 border-[#00f0ff]/50 rounded" />
                  </div>

                  <div className="relative z-10 text-center">
                    <span className="material-symbols-outlined text-8xl text-[#00f0ff] mb-4 block">
                      {loading ? 'sync' : 'qr_code_2'}
                    </span>
                    <p className="text-lg text-gray-300 mb-2">
                      {loading ? 'Scanning...' : 'QR Scanner Ready'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {loading ? 'Processing ticket...' : 'Enter ticket ID or scan QR code'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket ID Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-400 mb-3">
                  Ticket ID or QR Data
                </label>
                <input
                  type="text"
                  value={ticketIdInput}
                  onChange={(e) => setTicketIdInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleScanTicket()}
                  placeholder="Enter ticket ID (e.g., ticket-abc123)"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#00f0ff]/30 text-white placeholder-gray-500 focus:border-[#00f0ff] focus:outline-none transition-colors disabled:opacity-50"
                />
              </div>

              {/* Scan Button */}
              <button
                onClick={handleScanTicket}
                disabled={loading || !ticketIdInput.trim()}
                className="w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-[#00f0ff]/30 to-[#39ff14]/30 border border-[#00f0ff]/50 text-[#00f0ff] hover:from-[#00f0ff]/50 hover:to-[#39ff14]/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">
                  {loading ? 'hourglass_top' : 'center_focus_strong'}
                </span>
                {loading ? 'SCANNING...' : 'SCAN TICKET'}
              </button>

              {/* Verification Steps */}
              {loading && (
                <div className="mt-8 space-y-4">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationStep >= 1
                          ? 'bg-[#00f0ff]/30 border border-[#00f0ff]'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      {verificationStep > 1 ? (
                        <span className="text-[#00f0ff] material-symbols-outlined text-sm">check</span>
                      ) : verificationStep === 1 ? (
                        <div className="w-4 h-4 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
                      ) : (
                        <span className="text-white/50">1</span>
                      )}
                    </div>
                    <div className={verificationStep >= 1 ? 'text-white' : 'text-gray-500'}>
                      <p className="font-semibold">Reading QR Code...</p>
                      <p className="text-sm text-gray-400">Decoding ticket data</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationStep >= 2
                          ? 'bg-[#00f0ff]/30 border border-[#00f0ff]'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      {verificationStep > 2 ? (
                        <span className="text-[#00f0ff] material-symbols-outlined text-sm">check</span>
                      ) : verificationStep === 2 ? (
                        <div
                          className="w-4 h-4 rounded-full bg-[#00f0ff] network-pulse"
                          style={{ boxShadow: '0 0 10px rgba(0, 240, 255, 0.8)' }}
                        />
                      ) : (
                        <span className="text-white/50">2</span>
                      )}
                    </div>
                    <div className={verificationStep >= 2 ? 'text-white' : 'text-gray-500'}>
                      <p className="font-semibold">Querying DUAL Network...</p>
                      <p className="text-sm text-gray-400">Connecting to blockchain</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationStep >= 3
                          ? 'bg-[#ff2d78]/30 border border-[#ff2d78]'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      {verificationStep > 3 ? (
                        <span className="text-[#ff2d78] material-symbols-outlined text-sm">check</span>
                      ) : verificationStep === 3 ? (
                        <div className="w-4 h-4 border-2 border-[#ff2d78]/30 border-t-[#ff2d78] rounded-full animate-spin" />
                      ) : (
                        <span className="text-white/50">3</span>
                      )}
                    </div>
                    <div className={verificationStep >= 3 ? 'text-white' : 'text-gray-500'}>
                      <p className="font-semibold">Verifying On-Chain...</p>
                      <p className="text-sm text-gray-400">Validating smart contract</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center block-animation ${
                        verificationStep >= 4
                          ? 'bg-[#39ff14]/30 border border-[#39ff14]'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      {verificationStep > 4 ? (
                        <span className="relative z-10 text-[#39ff14] material-symbols-outlined text-sm">check</span>
                      ) : verificationStep === 4 ? (
                        <span className="relative z-10 anti-scalp-check text-[#39ff14] material-symbols-outlined text-sm">
                          verified
                        </span>
                      ) : (
                        <span className="text-white/50">4</span>
                      )}
                    </div>
                    <div className={verificationStep >= 4 ? 'text-white' : 'text-gray-500'}>
                      <p className="font-semibold">Checking Anti-Scalp Compliance...</p>
                      <p className="text-sm text-gray-400">Verifying price boundaries</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div>
            <div className="border border-[#39ff14]/30 rounded-2xl p-6 bg-gradient-to-br from-[#39ff14]/5 to-transparent sticky top-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#39ff14]">analytics</span>
                Today's Stats
              </h3>

              <div className="space-y-6">
                <div className="text-center p-4 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30">
                  <p className="text-xs text-gray-400 mb-1">SCANNED TODAY</p>
                  <p className="text-4xl font-black text-[#00f0ff]">{stats.scannedToday}</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/30">
                  <p className="text-xs text-gray-400 mb-1">VALID</p>
                  <p className="text-4xl font-black text-[#39ff14]">{stats.validScans}</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-[#ff2d78]/10 border border-[#ff2d78]/30">
                  <p className="text-xs text-gray-400 mb-1">REJECTED</p>
                  <p className="text-4xl font-black text-[#ff2d78]">{stats.rejectedScans}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="mt-12">
            {result.status === 'valid' ? (
              <div className="border-2 border-[#39ff14] rounded-2xl p-8 bg-gradient-to-br from-[#39ff14]/10 to-transparent">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#39ff14]/20 border-2 border-[#39ff14] mb-4">
                    <span className="text-6xl text-[#39ff14]">✓</span>
                  </div>
                  <h2 className="text-4xl font-black text-[#39ff14] mb-2">ENTRY GRANTED</h2>
                  <p className="text-gray-400">Ticket verified and validated</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Ticket ID</p>
                    <p className="font-mono text-[#00f0ff] break-all">{result.ticketId}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Event</p>
                    <p className="font-bold text-white">{result.eventName}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Tier</p>
                    <div className={`inline-flex px-3 py-1 rounded-full font-semibold text-sm border bg-gradient-to-r ${tierColor.bg} ${tierColor.text} ${tierColor.border}`}>
                      {result.tier.toUpperCase()}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Seat</p>
                    <p className="font-bold text-white">{result.seat}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Original Price</p>
                    <p className="font-bold text-white">${result.originalPrice}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Max Resale Price</p>
                    <p className="font-bold text-[#39ff14]">${result.maxResalePrice}</p>
                  </div>

                  <div className="md:col-span-2 p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Holder Address</p>
                    <p className="font-mono text-[#00f0ff] break-all text-sm">{result.holder}</p>
                  </div>

                  <div className="md:col-span-2 p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Verification Hash</p>
                    <p className="font-mono text-[#39ff14] break-all text-sm">{result.verificationHash}</p>
                  </div>

                  <div className="md:col-span-2 p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Verified At</p>
                    <p className="font-mono text-gray-300 text-sm">
                      {new Date(result.verificationTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <a
                    href={`https://32f.blockv.io/tx/${result.verificationHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#39ff14]/20 border border-[#39ff14]/50 text-[#39ff14] font-semibold hover:bg-[#39ff14]/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    View on Blockscout
                  </a>

                  <button
                    onClick={handleScanNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/50 text-[#00f0ff] font-semibold hover:bg-[#00f0ff]/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    Scan Next
                  </button>
                </div>
              </div>
            ) : result.status === 'duplicate' ? (
              <div className="border-2 border-[#ff2d78] rounded-2xl p-8 bg-gradient-to-br from-[#ff2d78]/10 to-transparent">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#ff2d78]/20 border-2 border-[#ff2d78] mb-4">
                    <span className="text-5xl">⚠</span>
                  </div>
                  <h2 className="text-4xl font-black text-[#ff2d78] mb-2">DUPLICATE SCAN</h2>
                  <p className="text-gray-400">This ticket has already been scanned</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="md:col-span-2 p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Ticket ID</p>
                    <p className="font-mono text-[#00f0ff] break-all">{result.ticketId}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Event</p>
                    <p className="font-bold text-white">{result.eventName}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Original Scan Time</p>
                    <p className="font-bold text-white">
                      {new Date(result.verificationTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleScanNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/50 text-[#00f0ff] font-semibold hover:bg-[#00f0ff]/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    Scan Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-[#ff2d78] rounded-2xl p-8 bg-gradient-to-br from-[#ff2d78]/10 to-transparent">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#ff2d78]/20 border-2 border-[#ff2d78] mb-4">
                    <span className="text-5xl">✗</span>
                  </div>
                  <h2 className="text-4xl font-black text-[#ff2d78] mb-2">ENTRY DENIED</h2>
                  <p className="text-gray-400">This ticket could not be verified</p>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-8">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Ticket ID</p>
                    <p className="font-mono text-[#00f0ff] break-all">{result.ticketId}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-[#ff2d78]/20 border border-[#ff2d78]/30">
                    <p className="text-sm text-gray-400 mb-1">Rejection Reason</p>
                    <p className="font-bold text-[#ff2d78]">{result.reason || 'Unknown error'}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Attempted At</p>
                    <p className="font-mono text-gray-300 text-sm">
                      {new Date(result.verificationTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleScanNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/50 text-[#00f0ff] font-semibold hover:bg-[#00f0ff]/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    Scan Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
