'use client';

import { useRouter } from "next/navigation";
import { Wine, Shield, TrendingUp, ArrowRight, Grape, Lock, Globe } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-wine-950 via-wine-900 to-wine-950 text-white">
      {/* Header */}
      <header className="border-b border-wine-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg wine-gradient flex items-center justify-center">
              <Grape className="w-6 h-6 text-gold-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">DUAL Wine Vault</h1>
              <p className="text-xs text-wine-300">Powered by DUAL Protocol</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/wallet")}
              className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium"
            >
              Consumer Wallet
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="px-5 py-2.5 rounded-lg gold-gradient hover:opacity-90 transition text-sm font-medium text-wine-950"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-wine-800/50 rounded-full px-4 py-1.5 text-sm text-gold-300 mb-8">
          <Lock className="w-3.5 h-3.5" />
          Blockchain-verified provenance
        </div>
        <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Fine Wine,{" "}
          <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
            Tokenised
          </span>
        </h2>
        <p className="text-xl text-wine-200 max-w-2xl mx-auto mb-12 leading-relaxed">
          Invest in, collect, and trade premium wines with full blockchain provenance tracking.
          Every bottle authenticated, every transaction immutable.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/wallet/browse")}
            className="px-8 py-3.5 rounded-lg gold-gradient hover:opacity-90 transition text-base font-semibold text-wine-950 flex items-center gap-2"
          >
            Browse Marketplace
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push("/wallet")}
            className="px-8 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-base font-medium"
          >
            View Your Cellar
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-wine-800/30 border border-wine-700/30 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-wine-700/50 flex items-center justify-center mb-5">
              <Shield className="w-6 h-6 text-gold-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3">Verified Provenance</h3>
            <p className="text-wine-300 leading-relaxed">
              Every bottle's journey — from vineyard to your cellar — recorded immutably on the blockchain.
              Complete chain of custody you can trust.
            </p>
          </div>
          <div className="bg-wine-800/30 border border-wine-700/30 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-wine-700/50 flex items-center justify-center mb-5">
              <TrendingUp className="w-6 h-6 text-gold-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3">Investment Portfolio</h3>
            <p className="text-wine-300 leading-relaxed">
              Track valuations, monitor drinking windows, and manage your wine portfolio with real-time market data
              and performance analytics.
            </p>
          </div>
          <div className="bg-wine-800/30 border border-wine-700/30 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-wine-700/50 flex items-center justify-center mb-5">
              <Globe className="w-6 h-6 text-gold-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3">Global Marketplace</h3>
            <p className="text-wine-300 leading-relaxed">
              Buy, sell, and trade tokenised wines on a global marketplace. Instant settlement,
              fractional ownership, and full regulatory compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-wine-800/20 border border-wine-700/20 rounded-2xl p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gold-400">12</div>
              <div className="text-sm text-wine-300 mt-1">Wines Tokenised</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gold-400">$22K+</div>
              <div className="text-sm text-wine-300 mt-1">Total Value</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gold-400">8</div>
              <div className="text-sm text-wine-300 mt-1">Regions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gold-400">100%</div>
              <div className="text-sm text-wine-300 mt-1">Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-wine-800/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-wine-400">
          <p>DUAL Wine Vault — Powered by DUAL Protocol</p>
          <p className="mt-1 text-wine-500">Blockchain-verified wine tokenisation platform</p>
        </div>
      </footer>
    </div>
  );
}
