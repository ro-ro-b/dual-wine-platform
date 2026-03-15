'use client';

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a0a15] via-primary to-[#2a0a15] text-white font-display">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent rounded-lg p-2 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-primary font-bold">grain</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">DUAL Wine Vault</h1>
              <p className="text-xs text-white/50">Powered by DUAL Protocol</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/wallet")}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm font-medium"
            >
              Consumer Wallet
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="px-5 py-2.5 rounded-xl gold-gradient hover:opacity-90 transition text-sm font-semibold text-white shadow-lg shadow-accent/20"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-sm text-accent mb-8">
          <span className="material-symbols-outlined text-sm">lock</span>
          Blockchain-verified provenance
        </div>
        <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Fine Wine,{" "}
          <span className="bg-gradient-to-r from-accent to-gold-600 bg-clip-text text-transparent">
            Tokenised
          </span>
        </h2>
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
          Invest in, collect, and trade premium wines with full blockchain provenance tracking.
          Every bottle authenticated, every transaction immutable.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/wallet/browse")}
            className="px-8 py-3.5 rounded-xl gold-gradient hover:opacity-90 transition text-base font-bold text-white flex items-center gap-2 shadow-lg shadow-accent/30"
          >
            Browse Marketplace
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <button
            onClick={() => router.push("/wallet")}
            className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition text-base font-medium"
          >
            View Your Cellar
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "verified_user",
              title: "Verified Provenance",
              desc: "Every bottle's journey — from vineyard to your cellar — recorded immutably on the blockchain. Complete chain of custody you can trust.",
            },
            {
              icon: "analytics",
              title: "Investment Portfolio",
              desc: "Track valuations, monitor drinking windows, and manage your wine portfolio with real-time market data and performance analytics.",
            },
            {
              icon: "public",
              title: "Global Marketplace",
              desc: "Buy, sell, and trade tokenised wines on a global marketplace. Instant settlement, fractional ownership, and full regulatory compliance.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-accent text-2xl">{f.icon}</span>
              </div>
              <h3 className="text-lg font-bold mb-3">{f.title}</h3>
              <p className="text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "12", label: "Wines Tokenised" },
              { value: "$22K+", label: "Total Value" },
              { value: "8", label: "Regions" },
              { value: "100%", label: "Verified" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-accent">{s.value}</div>
                <div className="text-sm text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-white/30">
          <p>DUAL Wine Vault — Powered by DUAL Protocol</p>
          <p className="mt-1 text-white/20">Blockchain-verified wine tokenisation platform</p>
        </div>
      </footer>
    </div>
  );
}
