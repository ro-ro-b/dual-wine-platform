'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#08080f] text-white overflow-x-hidden">
      {/* Animated gradient background with grid overlay */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#08080f] via-[#1a0033] to-[#08080f]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 19px,
              rgba(0, 240, 255, 0.03) 19px,
              rgba(0, 240, 255, 0.03) 20px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 19px,
              rgba(0, 240, 255, 0.03) 19px,
              rgba(0, 240, 255, 0.03) 20px
            )`,
          }}
        />
        {/* Floating gradient orbs */}
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#6c2bd9]/20 to-transparent blur-3xl" />
        <div className="absolute bottom-[-300px] right-[-300px] w-[800px] h-[800px] rounded-full bg-gradient-to-l from-[#ff2d78]/10 to-transparent blur-3xl" />
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-[#00f0ff]/20">
        <div
          className="backdrop-blur-xl bg-[#08080f]/80"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(255, 45, 120, 0.03) 100%)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link href="/tickets" className="flex items-center gap-2 group">
              <div className="relative">
                <span className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#6c2bd9] to-[#ff2d78] bg-clip-text text-transparent tracking-tight">
                  DUAL
                </span>
                <span
                  className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
                  }}
                />
              </div>
              <span className="text-xl text-[#00f0ff] group-hover:text-[#ff2d78] transition-colors">
                ⚡
              </span>
              <span className="text-sm font-light text-gray-400 group-hover:text-[#00f0ff] transition-colors ml-1">
                Tickets
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/tickets"
                className="text-gray-300 hover:text-[#00f0ff] transition-colors relative group"
              >
                Events
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/tickets/my-tickets"
                className="text-gray-300 hover:text-[#00f0ff] transition-colors relative group"
              >
                My Tickets
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/tickets/marketplace"
                className="text-gray-300 hover:text-[#00f0ff] transition-colors relative group"
              >
                Marketplace
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/tickets/scan"
                className="text-gray-300 hover:text-[#00f0ff] transition-colors relative group"
              >
                Scan
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] group-hover:w-full transition-all duration-300" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-[#00f0ff]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#00f0ff]/20 px-4 py-4 flex flex-col gap-4">
              <Link href="/tickets" className="text-gray-300 hover:text-[#00f0ff] transition-colors">
                Events
              </Link>
              <Link href="/tickets/my-tickets" className="text-gray-300 hover:text-[#00f0ff] transition-colors">
                My Tickets
              </Link>
              <Link href="/tickets/marketplace" className="text-gray-300 hover:text-[#00f0ff] transition-colors">
                Marketplace
              </Link>
              <Link href="/tickets/scan" className="text-gray-300 hover:text-[#00f0ff] transition-colors">
                Scan
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#00f0ff]/20 mt-20">
        <div
          className="backdrop-blur-xl bg-[#08080f]/60"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(0, 240, 255, 0.03) 0%, rgba(255, 45, 120, 0.02) 100%)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-[#00f0ff] font-bold mb-4">DUAL Tickets</h3>
                <p className="text-sm text-gray-400">
                  The future of live events on-chain. Transparent, secure, fair.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-[#00f0ff] transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#00f0ff] transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#00f0ff] transition-colors">
                      Security
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Learn</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-[#00f0ff] transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#00f0ff] transition-colors">
                      Docs
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#00f0ff] transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-[#00f0ff] transition-colors">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#00f0ff] transition-colors">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#00f0ff] transition-colors">
                      Cookies
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-[#00f0ff]/20 pt-8 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                © 2026 DUAL Tickets. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-[#00f0ff] hover:text-[#ff2d78] transition-colors">
                  <span className="material-symbols-outlined text-sm">language</span>
                </a>
                <a href="#" className="text-[#00f0ff] hover:text-[#ff2d78] transition-colors">
                  <span className="material-symbols-outlined text-sm">favorite</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(0, 240, 255, 0.6);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
