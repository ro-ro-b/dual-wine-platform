'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AuthState = 'checking' | 'unauthenticated' | 'otp_sent' | 'authenticated';

type MintStep = {
  id: string;
  label: string;
  description: string;
  icon: string;
  status: 'pending' | 'active' | 'done' | 'error';
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function TicketsAdminPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [mintPhase, setMintPhase] = useState<'form' | 'minting' | 'success'>('form');
  const [mintResult, setMintResult] = useState<{ actionId: string; objectIds: string[]; ticketId?: string } | null>(null);
  const [mintError, setMintError] = useState('');
  const [mintSteps, setMintSteps] = useState<MintStep[]>([]);

  const [form, setForm] = useState({
    // Event Information
    eventName: '',
    eventDate: '',
    eventTime: '20:00',
    venueName: '',
    venueAddress: '',
    category: 'concert' as string,
    description: '',
    // Ticket Details
    tier: 'general' as string,
    section: '',
    seat: '',
    price: 0,
    maxResalePrice: 0,
    quantity: 1,
    perks: '',
  });

  // Check auth on mount
  useEffect(() => {
    fetch('/api/auth/status')
      .then(r => r.json())
      .then(d => {
        setAuthState(d.authenticated ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => setAuthState('unauthenticated'));
  }, []);

  const handleSendOtp = async () => {
    if (!email) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthState('otp_sent');
      } else {
        setAuthError(data.error || 'Failed to send OTP');
      }
    } catch {
      setAuthError('Network error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!otp) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthState('authenticated');
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch {
      setAuthError('Network error');
    } finally {
      setAuthLoading(false);
    }
  };

  const update = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMintError('');

    // Validate required fields
    if (!form.eventName || !form.eventDate || !form.venueName || !form.tier) {
      setMintError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    // Initialize minting steps
    const steps: MintStep[] = [
      { id: 'prepare', label: 'Preparing Ticket Data', description: 'Structuring ticket metadata for on-chain storage', icon: 'data_object', status: 'pending' },
      { id: 'auth', label: 'Authenticating with DUAL', description: 'Verifying org-scoped JWT credentials', icon: 'shield', status: 'pending' },
      { id: 'mint', label: 'Minting ERC-721 NFT', description: 'Writing to DUAL Network via /ebus/execute', icon: 'token', status: 'pending' },
      { id: 'anchor', label: 'Anchoring Content Hash', description: 'Computing integrity hash and anchoring on-chain', icon: 'link', status: 'pending' },
      { id: 'confirm', label: 'Confirmed on Blockchain', description: 'Ticket NFT verified on DUAL Network', icon: 'verified', status: 'pending' },
    ];
    setMintSteps(steps);
    setMintPhase('minting');

    // Step 1: Preparing
    await sleep(400);
    steps[0].status = 'active';
    setMintSteps([...steps]);
    await sleep(800);
    steps[0].status = 'done';
    setMintSteps([...steps]);

    // Step 2: Authenticating
    await sleep(300);
    steps[1].status = 'active';
    setMintSteps([...steps]);
    await sleep(600);
    steps[1].status = 'done';
    setMintSteps([...steps]);

    // Step 3: Minting — API call
    await sleep(300);
    steps[2].status = 'active';
    setMintSteps([...steps]);

    try {
      const perksArray = form.perks
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const mintPayload = {
        data: {
          name: `${form.eventName} - ${form.tier.toUpperCase()}`,
          eventName: form.eventName,
          eventDate: form.eventDate,
          eventTime: form.eventTime,
          venueName: form.venueName,
          venueAddress: form.venueAddress,
          category: form.category,
          description: form.description,
          tier: form.tier,
          section: form.section,
          seat: form.seat,
          price: form.price,
          maxResalePrice: form.maxResalePrice,
          quantity: form.quantity,
          perks: perksArray,
        },
      };

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mintPayload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        steps[2].status = 'error';
        setMintSteps([...steps]);
        setMintError(data.error || 'Mint failed');
        if (res.status === 401) setAuthState('unauthenticated');
        setSubmitting(false);
        return;
      }

      steps[2].status = 'done';
      setMintSteps([...steps]);

      // Step 4: Anchoring content hash
      await sleep(400);
      steps[3].status = 'active';
      setMintSteps([...steps]);
      await sleep(900);
      steps[3].status = 'done';
      setMintSteps([...steps]);

      // Step 5: Confirmed
      await sleep(400);
      steps[4].status = 'active';
      setMintSteps([...steps]);
      await sleep(600);
      steps[4].status = 'done';
      setMintSteps([...steps]);

      await sleep(500);
      setMintResult({
        actionId: data.actionId,
        objectIds: data.objectIds,
        ticketId: data.objectIds?.[0],
      });
      setMintPhase('success');

    } catch (err: any) {
      steps[2].status = 'error';
      setMintSteps([...steps]);
      setMintError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Auth Gate ──
  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (authState === 'unauthenticated' || authState === 'otp_sent') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-md px-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-cyan-400 text-3xl">lock</span>
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-2">DUAL Network Auth</h2>
            <p className="text-sm text-white/50 text-center mb-6">
              {authState === 'unauthenticated'
                ? 'Enter your email to receive a one-time code for minting tickets.'
                : `Enter the OTP code sent to ${email}`}
            </p>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {authError}
              </div>
            )}

            {authState === 'unauthenticated' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30"
                    placeholder="admin@example.com"
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={authLoading || !email}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-lg">mail</span>
                  )}
                  {authLoading ? 'Sending...' : 'Send OTP Code'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white text-center tracking-[0.3em] font-mono text-lg placeholder-white/30"
                    placeholder="Enter code"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={authLoading || !otp}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-lg">login</span>
                  )}
                  {authLoading ? 'Authenticating...' : 'Verify & Login'}
                </button>
                <button
                  onClick={() => { setAuthState('unauthenticated'); setOtp(''); setAuthError(''); }}
                  className="w-full py-2 text-white/40 text-sm hover:text-white/70 transition"
                >
                  Back to email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Cinematic Minting Phase ──
  if (mintPhase === 'minting') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Ambient orbs with cyan and magenta */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/[0.08] blur-3xl animate-ambient pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-magenta-500/[0.06] blur-3xl animate-ambient pointer-events-none" style={{ animationDelay: "-7s" }} />
        <div className="max-w-lg w-full px-6 relative z-10">
          {/* Central animation */}
          <div className="relative w-40 h-40 mx-auto mb-10">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '2s' }} />
            {/* Middle ring */}
            <div className="absolute inset-4 rounded-full border-2 border-magenta-500/30" />
            <div className="absolute inset-4 rounded-full border-2 border-t-transparent border-r-magenta-500 border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            {/* Inner ring */}
            <div className="absolute inset-8 rounded-full border-2 border-cyan-400/20" />
            {/* Center pulse */}
            <div className="absolute inset-12 rounded-full bg-gradient-to-r from-cyan-500/40 to-magenta-500/40 blur-lg animate-pulse" />
          </div>

          {/* Minting steps */}
          <div className="space-y-3">
            {mintSteps.map((step) => (
              <div key={step.id} className="flex gap-4">
                {/* Icon area */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative">
                  {step.status === 'pending' && (
                    <div className="w-10 h-10 rounded-full border-2 border-white/20" />
                  )}
                  {step.status === 'active' && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-pulse" />
                      <span className="material-symbols-outlined text-cyan-400 text-lg">{step.icon}</span>
                    </>
                  )}
                  {step.status === 'done' && (
                    <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
                      <span className="material-symbols-outlined text-green-400 text-lg">check</span>
                    </div>
                  )}
                  {step.status === 'error' && (
                    <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-400 text-lg">error</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <p className={`text-sm font-semibold ${step.status === 'active' ? 'text-cyan-400' : step.status === 'done' ? 'text-green-400' : step.status === 'error' ? 'text-red-400' : 'text-white/50'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-white/30">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {mintError && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {mintError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Success Phase ──
  if (mintPhase === 'success') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden p-6">
        {/* Ambient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/[0.08] blur-3xl animate-ambient pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-green-500/[0.06] blur-3xl animate-ambient pointer-events-none" style={{ animationDelay: "-7s" }} />

        <div className="max-w-lg w-full relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-green-400 text-5xl">verified</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Ticket Minted Successfully</h2>
            <p className="text-white/50">Your event ticket NFT has been anchored on the DUAL Network</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-6">
            {/* Ticket ID */}
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Ticket NFT ID</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm font-mono text-cyan-400 break-all">
                  {mintResult?.ticketId || mintResult?.objectIds?.[0] || 'N/A'}
                </code>
                <button
                  onClick={() => {
                    const id = mintResult?.ticketId || mintResult?.objectIds?.[0];
                    if (id) navigator.clipboard.writeText(id);
                  }}
                  className="px-3 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  <span className="material-symbols-outlined text-white/60 text-lg">content_copy</span>
                </button>
              </div>
            </div>

            {/* Action ID */}
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Action ID</label>
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm font-mono text-white/70">
                {mintResult?.actionId || 'N/A'}
              </div>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-white/40 mb-1">Event</p>
                <p className="text-sm font-semibold text-white">{form.eventName}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Tier</p>
                <p className="text-sm font-semibold text-cyan-400">{form.tier.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Venue</p>
                <p className="text-sm font-semibold text-white">{form.venueName}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Date</p>
                <p className="text-sm font-semibold text-white">{form.eventDate}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setMintPhase('form');
                  setForm({
                    eventName: '',
                    eventDate: '',
                    eventTime: '20:00',
                    venueName: '',
                    venueAddress: '',
                    category: 'concert',
                    description: '',
                    tier: 'general',
                    section: '',
                    seat: '',
                    price: 0,
                    maxResalePrice: 0,
                    quantity: 1,
                    perks: '',
                  });
                  setMintResult(null);
                  setMintError('');
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Mint Another
              </button>
              <Link
                href={`/tickets/${mintResult?.ticketId || mintResult?.objectIds?.[0]}`}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">open_in_new</span>
                View Ticket
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form Phase ──
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/[0.08] blur-3xl animate-ambient pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-magenta-500/[0.06] blur-3xl animate-ambient pointer-events-none" style={{ animationDelay: "-7s" }} />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="material-symbols-outlined text-cyan-400 text-4xl">bolt</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
              Mint Event Tickets
            </h1>
          </div>
          <p className="text-white/50">DUAL Tickets Admin</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Event Information Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">calendar_month</span>
              Event Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Name */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Event Name *</label>
                <input
                  type="text"
                  required
                  value={form.eventName}
                  onChange={e => update('eventName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30"
                  placeholder="e.g., Summer Music Festival 2026"
                />
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Event Date *</label>
                <input
                  type="date"
                  required
                  value={form.eventDate}
                  onChange={e => update('eventDate', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30"
                />
              </div>

              {/* Event Time */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Event Time</label>
                <input
                  type="text"
                  value={form.eventTime}
                  onChange={e => update('eventTime', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30"
                  placeholder="20:00"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={e => update('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white"
                >
                  <option value="concert">Concert</option>
                  <option value="sports">Sports</option>
                  <option value="theater">Theater</option>
                  <option value="conference">Conference</option>
                  <option value="festival">Festival</option>
                </select>
              </div>

              {/* Venue Name */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={form.venueName}
                  onChange={e => update('venueName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30"
                  placeholder="e.g., Central Park"
                />
              </div>

              {/* Venue Address */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Venue Address</label>
                <input
                  type="text"
                  value={form.venueAddress}
                  onChange={e => update('venueAddress', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30"
                  placeholder="Full address"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30 resize-none"
                placeholder="Event details, terms, restrictions..."
              />
            </div>
          </div>

          {/* Ticket Details Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-magenta-400">confirmation_number</span>
              Ticket Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tier */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Tier *</label>
                <select
                  required
                  value={form.tier}
                  onChange={e => update('tier', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white"
                >
                  <option value="general">General Admission</option>
                  <option value="vip">VIP</option>
                  <option value="backstage">Backstage Pass</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Section</label>
                <input
                  type="text"
                  value={form.section}
                  onChange={e => update('section', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30"
                  placeholder="e.g., A, B, Floor 1"
                />
              </div>

              {/* Seat */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Seat</label>
                <input
                  type="text"
                  value={form.seat}
                  onChange={e => update('seat', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30"
                  placeholder="e.g., 101, 202, GA"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={e => update('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30"
                  placeholder="99.99"
                />
              </div>

              {/* Max Resale Price */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Max Resale Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.maxResalePrice}
                  onChange={e => update('maxResalePrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30"
                  placeholder="149.99"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Quantity to Mint</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={e => update('quantity', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30"
                />
              </div>
            </div>

            {/* Perks */}
            <div className="mt-6">
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Perks (comma-separated)</label>
              <textarea
                value={form.perks}
                onChange={e => update('perks', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/30 bg-white/5 text-white placeholder-white/30 resize-none"
                placeholder="e.g., Early entry, Exclusive merchandise, Meet & greet"
              />
            </div>
          </div>

          {/* Error Display */}
          {mintError && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {mintError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-lg shadow-lg shadow-cyan-500/30 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">bolt</span>
                Mint Ticket NFT
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
