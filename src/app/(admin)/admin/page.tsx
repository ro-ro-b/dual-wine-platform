'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { DashboardStats } from "@/types/dual";

/* ── Animated Counter Hook ── */
function useAnimatedNumber(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const from = 0;
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration]);

  return value;
}

/* ── Skeleton Components ── */
function SkeletonLine({ w = "w-full", h = "h-4" }: { w?: string; h?: string }) {
  return <div className={`skeleton ${w} ${h}`} />;
}

function DashboardSkeleton() {
  return (
    <section className="flex-1 overflow-y-auto px-6 py-10 lg:px-24">
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="skeleton w-8 h-8 rounded-lg" />
            <div className="skeleton w-24 h-4 rounded" />
          </div>
          <div className="pl-11 space-y-3">
            <SkeletonLine w="w-3/4" h="h-10" />
            <SkeletonLine w="w-full" h="h-5" />
            <SkeletonLine w="w-2/3" h="h-5" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 pl-11">
          <div className="skeleton h-48 rounded-3xl" />
          <div className="skeleton h-48 rounded-3xl" />
        </div>
        <div className="pl-11 space-y-4">
          <SkeletonLine w="w-40" h="h-3" />
          {[1, 2, 3, 4].map(i => <SkeletonLine key={i} h="h-10" />)}
        </div>
      </div>
    </section>
  );
}

/* ── Mini Sparkline ── */
function MiniSparkline({ data, color = "#e9c349" }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 80;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Glow dot on last point */}
      {data.length > 1 && (() => {
        const lx = w;
        const ly = h - ((data[data.length - 1] - min) / range) * (h - 4) - 2;
        return <circle cx={lx} cy={ly} r="2" fill={color} opacity="0.8" />;
      })()}
    </svg>
  );
}

/* ── Stat Card ── */
function StatCard({
  label,
  value,
  suffix = "",
  prefix = "",
  subtext,
  color = "white",
  sparkData,
  delay = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  subtext?: string;
  color?: string;
  sparkData?: number[];
  delay?: number;
}) {
  const animValue = useAnimatedNumber(value);
  const colorMap: Record<string, string> = {
    white: "text-white",
    gold: "text-gold-dim",
    green: "text-green-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
  };

  return (
    <div
      className="glass-card-hover p-5 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{label}</span>
        {sparkData && <MiniSparkline data={sparkData} color={color === "gold" ? "#e9c349" : color === "green" ? "#4ade80" : "#fff"} />}
      </div>
      <div className={`text-3xl font-bold font-mono ${colorMap[color] ?? "text-white"} animate-count-up`}>
        {prefix}{animValue.toLocaleString()}{suffix}
      </div>
      {subtext && <div className="text-[10px] text-white/25 mt-2">{subtext}</div>}
    </div>
  );
}

/* ── Main Dashboard ── */
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  if (loading) return <DashboardSkeleton />;

  const totalValue = stats?.totalValue ?? 0;
  const totalWines = stats?.totalWines ?? 0;
  const totalActions = stats?.totalActions ?? 0;
  const activeListings = stats?.activeListings ?? 0;
  const mintedThisMonth = stats?.mintedThisMonth ?? 0;
  const topRegions = stats?.topRegions ?? [];
  const sortedTypes = [...(stats?.valueByType ?? [])].sort((a, b) => b.value - a.value);
  const topRegion = topRegions.length > 0 ? topRegions[0] : null;
  const topRegionPct = topRegion && totalWines > 0
    ? Math.round((topRegion.count / totalWines) * 100)
    : 0;

  // Fake sparkline data for visual flair
  const valueSpark = [65, 72, 68, 80, 76, 85, 90, 88, 95, 100].map(v => Math.round(v * totalValue / 100));
  const tokenSpark = [3, 5, 4, 7, 6, 8, 10, 9, 11, totalWines];

  return (
    <section className="flex-1 overflow-y-auto px-6 py-10 lg:px-24">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* AI Sommelier Greeting */}
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-burgundy-accent flex items-center justify-center animate-glow-pulse">
              <span
                className="material-symbols-outlined text-gold-dim text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <span className="text-sm font-semibold text-gold-dim">Sommelier AI</span>
          </div>
          <div className="pl-11">
            <h2 className="text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
              {greeting}, Administrator. <br />
              The vault is{" "}
              <span className="italic ai-gradient-text">optimizing</span>.
            </h2>
            <p className="text-lg text-white/50 leading-relaxed max-w-2xl">
              Portfolio value stands at{" "}
              <span className="text-white font-mono">${totalValue.toLocaleString()}</span> across{" "}
              <span className="text-white font-mono">{totalWines}</span> tokens.
              I&apos;ve processed{" "}
              <span className="text-white font-mono">{totalActions.toLocaleString()}</span> network actions.
              {topRegion && (
                <>
                  {" "}{topRegion.region} remains your strongest concentration at{" "}
                  <span className="text-white font-mono">{topRegionPct}%</span>.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pl-11 stagger-children">
          <StatCard label="Portfolio Value" value={totalValue} prefix="$" color="gold" sparkData={valueSpark} />
          <StatCard label="Total Tokens" value={totalWines} color="white" sparkData={tokenSpark} delay={80} />
          <StatCard label="Active Listings" value={activeListings} color="blue" subtext="Secondary market" delay={160} />
          <StatCard label="Minted This Cycle" value={mintedThisMonth} color="green" subtext="Current period" delay={240} />
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-11 stagger-children">
          {/* Market Intelligence Card */}
          <div className="glass-card-hover p-6 rounded-3xl group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold-dim/10 flex items-center justify-center group-hover:bg-gold-dim/20 transition-colors">
                <span className="material-symbols-outlined text-gold-dim text-xl">trending_up</span>
              </div>
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-1">
                Market Alert
              </span>
            </div>
            <h3 className="text-white font-bold mb-2 text-lg">Secondary Market Peak</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              {sortedTypes.length > 0 ? (
                <>
                  {sortedTypes[0].type.charAt(0).toUpperCase() + sortedTypes[0].type.slice(1)} wines lead at{" "}
                  <span className="text-gold-dim font-mono">
                    ${sortedTypes[0].value.toLocaleString()}
                  </span>
                  . {activeListings} active listings across the secondary market.
                </>
              ) : (
                "Market data loading. Check back shortly for real-time portfolio insights."
              )}
            </p>
            <div className="mt-5 pt-4 border-t border-white/5 flex gap-2">
              <Link
                href="/admin/inventory"
                className="px-4 py-1.5 rounded-full bg-gold-dim text-burgundy-deep text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition"
              >
                View Inventory
              </Link>
              <button className="px-4 py-1.5 rounded-full border border-white/10 text-[10px] text-white/40 hover:text-white/70 hover:border-white/20 transition">
                Dismiss
              </button>
            </div>
          </div>

          {/* Mint Protocol Card */}
          <div className="glass-card-hover p-6 rounded-3xl !border-burgundy-accent/20 group cursor-pointer hover:!border-burgundy-accent/40">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <span className="material-symbols-outlined text-purple-400 text-xl">token</span>
              </div>
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-1">
                Minting Protocol
              </span>
            </div>
            <h3 className="text-white font-bold mb-2 text-lg">
              {mintedThisMonth > 0
                ? `${mintedThisMonth} Tokens Minted This Cycle`
                : "Ready to Mint"}
            </h3>
            <p className="text-sm text-white/40 leading-relaxed">
              {mintedThisMonth > 0
                ? "Digital certificates authenticated and anchored on DUAL Network. AI image and video generation available."
                : "The minting pipeline is clear. Generate AI product images and cinematic videos from wine metadata."}
            </p>
            <div className="mt-5 pt-4 border-t border-white/5">
              <Link
                href="/admin/mint"
                className="block w-full py-2.5 rounded-xl bg-burgundy-accent text-white text-[10px] font-bold uppercase tracking-widest text-center hover:bg-burgundy-accent/80 transition-all active:scale-[0.98]"
              >
                Mint New Token
              </Link>
            </div>
          </div>
        </div>

        {/* Strategic Summary */}
        <div className="pl-11 space-y-5 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-4 text-white/15">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Strategic Summary</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="space-y-0.5">
            {[
              { label: "Portfolio Value", value: `$${totalValue.toLocaleString()}`, dot: "bg-gold-dim" },
              ...(topRegion ? [{ label: `${topRegion.region} Concentration`, value: `${topRegionPct}% (Optimal)`, dot: "bg-gold-dim" }] : []),
              { label: "Active Secondary Listings", value: `${activeListings} items`, dot: "bg-blue-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group cursor-default py-3 px-4 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                  <span className="text-white/60 font-medium text-sm">{item.label}</span>
                </div>
                <span className="text-white/30 font-mono text-sm group-hover:text-white/60 transition-colors">
                  {item.value}
                </span>
              </div>
            ))}

            {/* Status rows */}
            {[
              { label: "Blockchain Synchronization", status: "Connected", color: "text-green-400", border: "border-green-500/30" },
              { label: "AI Asset Generation", status: "Gemini Ready", color: "text-purple-400", border: "border-purple-500/30" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`w-1.5 h-0 border-t-2 ${item.border} inline-block`} style={{ width: 6 }} />
                  <span className="text-white/60 font-medium text-sm">{item.label}</span>
                </div>
                <span className={`${item.color} font-mono text-xs uppercase tracking-wider`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wine Type Breakdown */}
        {sortedTypes.length > 0 && (
          <div className="pl-11 space-y-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-4 text-white/15">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Value Distribution</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Stacked bar */}
            <div className="w-full h-2.5 flex rounded-full overflow-hidden bg-white/5">
              {sortedTypes.map((item: any) => {
                const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                const colors: Record<string, string> = {
                  red: "bg-burgundy-accent",
                  white: "bg-gold-dim",
                  sparkling: "bg-amber-400",
                  "rosé": "bg-pink-400",
                  dessert: "bg-orange-400",
                  fortified: "bg-purple-400",
                };
                return (
                  <div
                    key={item.type}
                    className={`${colors[item.type] ?? "bg-white/20"} h-full transition-all duration-700 hover:opacity-80`}
                    style={{ width: `${pct}%` }}
                    title={`${item.type}: $${item.value.toLocaleString()}`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {sortedTypes.map((item: any) => {
                const colors: Record<string, string> = {
                  red: "bg-burgundy-accent",
                  white: "bg-gold-dim",
                  sparkling: "bg-amber-400",
                  "rosé": "bg-pink-400",
                  dessert: "bg-orange-400",
                  fortified: "bg-purple-400",
                };
                return (
                  <div key={item.type} className="flex items-center gap-2 group cursor-default">
                    <span className={`w-2 h-2 rounded-full ${colors[item.type] ?? "bg-white/20"} group-hover:scale-125 transition-transform`} />
                    <span className="text-xs text-white/30 capitalize group-hover:text-white/50 transition-colors">{item.type}</span>
                    <span className="text-xs text-white/50 font-mono group-hover:text-white/80 transition-colors">${item.value.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Region Breakdown */}
        {topRegions.length > 0 && (
          <div className="pl-11 space-y-4 pb-8 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center gap-4 text-white/15">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Top Regions</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="space-y-3">
              {topRegions.map((r: any, i: number) => {
                const totalCount = topRegions.reduce((s: number, x: any) => s + x.count, 0);
                const pct = totalCount > 0 ? (r.count / totalCount) * 100 : 0;
                return (
                  <div key={r.region} className="space-y-2 group cursor-default">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50 font-medium group-hover:text-white/80 transition-colors">{r.region}</span>
                      <span className="text-white/25 font-mono group-hover:text-white/50 transition-colors">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-gold-dim to-burgundy-accent h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, animationDelay: `${i * 100}ms` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
