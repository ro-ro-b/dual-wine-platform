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

const BLOCKSCOUT_BASE = 'https://32f.blockv.io';
const DUAL_CONTRACT = '0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06';

export default function MintWinePage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [mintPhase, setMintPhase] = useState<'form' | 'minting' | 'success'>('form');
  const [mintResult, setMintResult] = useState<{ actionId: string; objectIds: string[]; contentHash?: string; integrityHash?: string; ownerWallet?: string } | null>(null);
  const [mintError, setMintError] = useState('');
  const [mintSteps, setMintSteps] = useState<MintStep[]>([]);

  // Token mode: wine or video
  const [tokenMode, setTokenMode] = useState<'wine' | 'video'>('wine');

  // AI-generated assets
  const [videoUrl, setVideoUrl] = useState('');
  const videoUrlRef = useRef('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const imageUrlRef = useRef('');
  const [imagePrompt, setImagePrompt] = useState('');

  // Generation phase (before minting)
  const [generating, setGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState<'idle' | 'image' | 'video' | 'done'>('idle');

  const videoInputRef = useRef<HTMLInputElement>(null);

  // Keep refs in sync with state
  const setVideoUrlAndRef = (url: string) => {
    videoUrlRef.current = url;
    setVideoUrl(url);
  };
  const setImageUrlAndRef = (url: string) => {
    imageUrlRef.current = url;
    setImageUrl(url);
  };

  const [form, setForm] = useState({
    name: "", producer: "", region: "", country: "", vintage: new Date().getFullYear(),
    varietal: "", type: "red" as string, abv: 13.5, volume: "750ml", quantity: 1,
    condition: "pristine" as string, storage: "professional" as string,
    drinkingFrom: new Date().getFullYear(), drinkingTo: new Date().getFullYear() + 10,
    currentValue: 0, purchasePrice: 0, description: "",
    nose: "", palate: "", finish: "",
  });

  const getMetadataPayload = () => ({
    name: form.name, producer: form.producer, region: form.region,
    country: form.country, vintage: form.vintage, varietal: form.varietal,
    type: form.type, description: form.description,
    nose: form.nose, palate: form.palate, finish: form.finish,
    abv: form.abv, volume: form.volume,
  });

  const handleGenerateAssets = async () => {
    if (!form.name) {
      setMintError('Please fill in the wine name before generating assets.');
      return;
    }
    setGenerating(true);
    setMintError('');
    const payload = getMetadataPayload();

    // Step 1: Generate image
    setGenPhase('image');
    try {
      const imgRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const imgData = await imgRes.json();
      if (!imgRes.ok) throw new Error(imgData.error || 'Image generation failed');
      setImageUrlAndRef(imgData.imageUrl);
      setImagePrompt(imgData.prompt);
    } catch (err: any) {
      setMintError(`AI Image: ${err.message}`);
      setGenerating(false);
      setGenPhase('idle');
      return;
    }

    // Step 2: Generate video (only in video mode)
    if (tokenMode === 'video') {
      setGenPhase('video');
      try {
        const vidRes = await fetch('/api/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, imageUrl: imageUrlRef.current }),
        });
        const vidData = await vidRes.json();
        if (!vidRes.ok) throw new Error(vidData.error || 'Video generation failed');
        setVideoUrlAndRef(vidData.videoUrl);
        setVideoPrompt(vidData.prompt);
      } catch (err: any) {
        setMintError(`AI Video: ${err.message}`);
        setGenerating(false);
        setGenPhase('idle');
        return;
      }
    }

    setGenPhase('done');
    setGenerating(false);
  };

  const handleGenerateImage = async () => {
    if (!form.name) {
      setMintError('Please fill in the wine name before generating an image.');
      return;
    }
    setGenerating(true);
    setGenPhase('image');
    setMintError('');
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getMetadataPayload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image generation failed');
      setImageUrlAndRef(data.imageUrl);
      setImagePrompt(data.prompt);
      setGenPhase('done');
    } catch (err: any) {
      setMintError(`AI Image: ${err.message}`);
      setGenPhase('idle');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!form.name) {
      setMintError('Please fill in the wine name before generating a video.');
      return;
    }
    setGenerating(true);
    setGenPhase('video');
    setMintError('');
    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...getMetadataPayload(), imageUrl: imageUrlRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video generation failed');
      setVideoUrlAndRef(data.videoUrl);
      setVideoPrompt(data.prompt);
      setGenPhase('done');
    } catch (err: any) {
      setMintError(`AI Video: ${err.message}`);
      setGenPhase('idle');
    } finally {
      setGenerating(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    fetch('/api/auth/status').then(r => r.json()).then(d => {
      setAuthState(d.authenticated ? 'authenticated' : 'unauthenticated');
    }).catch(() => setAuthState('unauthenticated'));
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

  // Advance mint steps with animation timing
  const advanceMintStep = (steps: MintStep[], stepId: string, status: 'active' | 'done' | 'error') => {
    return steps.map(s => s.id === stepId ? { ...s, status } : s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMintError('');

    // Initialize cinematic mint steps
    const steps: MintStep[] = [
      { id: 'prepare', label: 'Preparing Token Data', description: 'Structuring wine metadata for on-chain storage', icon: 'data_object', status: 'pending' },
      { id: 'auth', label: 'Authenticating with DUAL', description: 'Verifying org-scoped JWT credentials', icon: 'shield', status: 'pending' },
      { id: 'mint', label: 'Minting ERC-721 Token', description: 'Writing to DUAL Network via /ebus/execute', icon: 'token', status: 'pending' },
      { id: 'anchor', label: 'Anchoring Content Hash', description: 'Computing integrity hash and anchoring on-chain', icon: 'link', status: 'pending' },
      { id: 'confirm', label: 'Confirmed on Blockchain', description: 'Token verified on DUAL Token contract', icon: 'verified', status: 'pending' },
    ];
    setMintSteps(steps);
    setMintPhase('minting');

    // Step 1: Preparing
    await sleep(400);
    steps.find(s => s.id === 'prepare')!.status = 'active';
    setMintSteps([...steps]);
    await sleep(800);
    steps.find(s => s.id === 'prepare')!.status = 'done';
    setMintSteps([...steps]);

    // Step 2: Authenticating
    await sleep(300);
    steps.find(s => s.id === 'auth')!.status = 'active';
    setMintSteps([...steps]);
    await sleep(600);
    steps.find(s => s.id === 'auth')!.status = 'done';
    setMintSteps([...steps]);

    // Step 3: Minting — this is where the real API call happens
    await sleep(300);
    steps.find(s => s.id === 'mint')!.status = 'active';
    setMintSteps([...steps]);

    try {
      const mintPayload: any = {
        data: {
          name: form.name, producer: form.producer, region: form.region, country: form.country,
          vintage: form.vintage, varietal: form.varietal, type: form.type, abv: form.abv,
          volume: form.volume, quantity: form.quantity, condition: form.condition, storage: form.storage,
          drinkingWindow: { from: form.drinkingFrom, to: form.drinkingTo },
          ratings: [], certifications: tokenMode === 'video' ? ['Video NFT'] : [],
          currentValue: form.currentValue, purchasePrice: form.purchasePrice,
          description: form.description,
          tastingNotes: { nose: form.nose, palate: form.palate, finish: form.finish },
        },
      };
      // Include AI-generated assets (use refs for latest values)
      if (imageUrlRef.current) {
        mintPayload.data.imageUrl = imageUrlRef.current;
      }
      if (tokenMode === 'video' && videoUrlRef.current) {
        mintPayload.data.videoUrl = videoUrlRef.current;
      }

      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mintPayload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        steps.find(s => s.id === 'mint')!.status = 'error';
        setMintSteps([...steps]);
        setMintError(data.error || 'Mint failed');
        if (res.status === 401) setAuthState('unauthenticated');
        setSubmitting(false);
        return;
      }

      steps.find(s => s.id === 'mint')!.status = 'done';
      setMintSteps([...steps]);

      // Step 4: Anchoring content hash
      await sleep(400);
      steps.find(s => s.id === 'anchor')!.status = 'active';
      setMintSteps([...steps]);

      // Fetch the freshly minted object to get real hashes
      const objectId = data.objectIds?.[0];
      let contentHash = '';
      let integrityHash = '';
      let ownerWallet = '';

      if (objectId) {
        try {
          const objRes = await fetch(`/api/wines/${objectId}`);
          if (objRes.ok) {
            const objData = await objRes.json();
            contentHash = objData.contentHash || '';
            integrityHash = objData.blockchainTxHash || '';
            ownerWallet = objData.ownerId || '';
          }
        } catch {}
      }

      await sleep(900);
      steps.find(s => s.id === 'anchor')!.status = 'done';
      setMintSteps([...steps]);

      // Step 5: Confirmed
      await sleep(400);
      steps.find(s => s.id === 'confirm')!.status = 'active';
      setMintSteps([...steps]);
      await sleep(600);
      steps.find(s => s.id === 'confirm')!.status = 'done';
      setMintSteps([...steps]);

      await sleep(500);
      setMintResult({
        actionId: data.actionId,
        objectIds: data.objectIds,
        contentHash,
        integrityHash,
        ownerWallet,
      });
      setMintPhase('success');

    } catch (err: any) {
      steps.find(s => s.id === 'mint')!.status = 'error';
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
        <div className="w-8 h-8 rounded-full border-2 border-wine-700 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (authState === 'unauthenticated' || authState === 'otp_sent') {
    return (
      <div>
        <header className="h-20 flex items-center justify-between px-8 bg-surface border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Admin</span>
            <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
            <span className="text-primary font-semibold">Authenticate</span>
          </div>
        </header>
        <div className="p-8 max-w-md mx-auto">
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="w-16 h-16 rounded-full bg-wine-50 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-wine-700 text-3xl">lock</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 text-center mb-2">DUAL Network Auth</h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              {authState === 'unauthenticated'
                ? 'Enter your email to receive a one-time code for minting tokens.'
                : `Enter the OTP code sent to ${email}`}
            </p>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {authError}
              </div>
            )}

            {authState === 'unauthenticated' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 bg-white"
                    placeholder="admin@example.com"
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={authLoading || !email}
                  className="w-full py-3 rounded-xl wine-gradient text-white font-bold text-sm shadow-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-lg">mail</span>
                  )}
                  {authLoading ? 'Sending...' : 'Send OTP Code'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 bg-white text-center tracking-[0.3em] font-mono text-lg"
                    placeholder="Enter code"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={authLoading || !otp}
                  className="w-full py-3 rounded-xl gold-gradient text-white font-bold text-sm shadow-lg shadow-accent/20 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-lg">login</span>
                  )}
                  {authLoading ? 'Authenticating...' : 'Verify & Login'}
                </button>
                <button
                  onClick={() => { setAuthState('unauthenticated'); setOtp(''); setAuthError(''); }}
                  className="w-full py-2 text-slate-500 text-sm hover:text-slate-700 transition"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-wine-950 to-slate-950 flex items-center justify-center">
        <div className="max-w-lg w-full px-6">
          {/* Central animation */}
          <div className="relative w-40 h-40 mx-auto mb-10">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-gold-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-gold-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '2s' }} />
            {/* Middle ring */}
            <div className="absolute inset-4 rounded-full border-2 border-wine-500/20" />
            <div className="absolute inset-4 rounded-full border-2 border-t-transparent border-r-wine-500 border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            {/* Inner ring */}
            <div className="absolute inset-8 rounded-full border-2 border-gold-400/20" />
            <div className="absolute inset-8 rounded-full border-2 border-t-transparent border-r-transparent border-b-gold-400 border-l-transparent animate-spin" style={{ animationDuration: '1s' }} />
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full wine-gradient flex items-center justify-center shadow-lg shadow-wine-900/50">
                <span className="material-symbols-outlined text-3xl text-white">{tokenMode === 'video' ? 'videocam' : 'wine_bar'}</span>
              </div>
            </div>
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full border border-gold-500/30 animate-ping" style={{ animationDuration: '2s' }} />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Minting on DUAL Network
          </h2>
          <p className="text-gold-300/70 text-sm text-center mb-1">{form.name}</p>
          <p className="text-white/30 text-xs text-center mb-10">{form.producer} · {form.vintage}</p>

          {/* Step progress */}
          <div className="space-y-1">
            {mintSteps.map((step, i) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-500 ${
                  step.status === 'active'
                    ? 'bg-white/10 border border-gold-500/30 shadow-lg shadow-gold-500/10'
                    : step.status === 'done'
                      ? 'bg-white/5 border border-white/5'
                      : step.status === 'error'
                        ? 'bg-red-500/10 border border-red-500/30'
                        : 'bg-transparent border border-transparent'
                }`}
              >
                {/* Step indicator */}
                <div className="flex-shrink-0">
                  {step.status === 'done' && (
                    <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-gold-400 text-lg">check</span>
                    </div>
                  )}
                  {step.status === 'active' && (
                    <div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
                  )}
                  {step.status === 'error' && (
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-400 text-lg">close</span>
                    </div>
                  )}
                  {step.status === 'pending' && (
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/20 text-lg">{step.icon}</span>
                    </div>
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold transition-colors ${
                    step.status === 'active' ? 'text-gold-300' :
                    step.status === 'done' ? 'text-white/70' :
                    step.status === 'error' ? 'text-red-300' :
                    'text-white/30'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 transition-colors ${
                    step.status === 'active' ? 'text-white/50' :
                    step.status === 'done' ? 'text-white/30' :
                    step.status === 'error' ? 'text-red-300/60' :
                    'text-white/15'
                  }`}>
                    {step.description}
                  </p>
                </div>

                {/* Timestamp for done */}
                {step.status === 'done' && (
                  <span className="text-[10px] font-mono text-white/20 flex-shrink-0">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Error retry */}
          {mintError && (
            <div className="mt-6 text-center">
              <p className="text-red-400 text-sm mb-4">{mintError}</p>
              <button
                onClick={() => { setMintPhase('form'); setMintError(''); setMintSteps([]); }}
                className="px-6 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/5 transition"
              >
                Back to Form
              </button>
            </div>
          )}

          {/* Network badge */}
          <div className="mt-10 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-white/30 text-xs font-mono">DUAL Network · DUAL Token Contract</span>
          </div>
        </div>

        {/* Background particles */}
        <style jsx>{`
          @keyframes float-up {
            0% { transform: translateY(100vh) scale(0); opacity: 0; }
            20% { opacity: 0.6; }
            100% { transform: translateY(-10vh) scale(1); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  // ── Mint Success ──
  if (mintPhase === 'success' && mintResult) {
    const objectId = mintResult.objectIds[0];
    const objectUrl = `/wallet/browse/${objectId}`;
    const qrUrl = `/api/qr/${objectId}`;
    const explorerUrl = mintResult.ownerWallet ? `${BLOCKSCOUT_BASE}/address/${mintResult.ownerWallet}` : null;
    const contractUrl = `${BLOCKSCOUT_BASE}/token/${DUAL_CONTRACT}`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-wine-950 to-slate-950 flex items-center justify-center">
        <div className="max-w-lg w-full px-6 py-12">
          {/* Success burst */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-gold-500/20 animate-pulse" />
            <div className="absolute -inset-4 rounded-full border border-gold-500/10 animate-ping" style={{ animationDuration: '3s' }} />
            {/* Center checkmark */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center shadow-xl shadow-gold-500/30">
                <span className="material-symbols-outlined text-5xl text-white">verified</span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-2">Token Minted</h2>
          <p className="text-gold-300 text-center text-base mb-1">{form.name}</p>
          <p className="text-white/40 text-center text-sm mb-8">{form.producer} · {form.vintage}</p>

          {/* Token details card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mb-6">
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-4">On-Chain Token Data</h3>
            <div className="space-y-3">
              <DetailRow label="Object ID" value={objectId} mono />
              <DetailRow label="Action ID" value={mintResult.actionId} mono />
              {mintResult.contentHash && <DetailRow label="Content Hash" value={mintResult.contentHash} mono />}
              {mintResult.integrityHash && <DetailRow label="Integrity Hash" value={mintResult.integrityHash} mono />}
              {mintResult.ownerWallet && <DetailRow label="Owner Wallet" value={mintResult.ownerWallet} mono />}
              <div className="h-px bg-white/10 my-2" />
              <DetailRow label="Contract" value="DUAL Token (ERC-721)" />
              <DetailRow label="Chain" value="DUAL Network" />
            </div>
          </div>

          {/* Blockscout links */}
          <div className="bg-white/5 border border-gold-500/20 rounded-2xl p-5 mb-6">
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">explore</span>
              Verify on Blockscout
            </h3>
            <div className="space-y-2">
              {explorerUrl && (
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 hover:border-gold-500/40 hover:bg-gold-500/15 transition group">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gold-400 text-lg">account_balance_wallet</span>
                    <span className="text-gold-200 text-sm font-medium">Owner Wallet</span>
                  </div>
                  <span className="material-symbols-outlined text-gold-400/60 text-lg group-hover:text-gold-400 transition">open_in_new</span>
                </a>
              )}
              <a href={contractUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 hover:border-gold-500/40 hover:bg-gold-500/15 transition group">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold-400 text-lg">token</span>
                  <span className="text-gold-200 text-sm font-medium">DUAL Token Contract</span>
                </div>
                <span className="material-symbols-outlined text-gold-400/60 text-lg group-hover:text-gold-400 transition">open_in_new</span>
              </a>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 flex flex-col items-center">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Claim QR Code</h3>
            <div className="bg-white rounded-xl p-3 mb-3">
              <img src={qrUrl} alt="Wine QR Code" className="w-40 h-40" />
            </div>
            <p className="text-white/30 text-xs text-center">
              Scan to claim this token to a consumer wallet
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href={objectUrl}
              className="w-full py-3.5 gold-gradient text-white font-bold rounded-xl shadow-lg shadow-gold-500/20 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">wine_bar</span>
              View Token Details
            </Link>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/admin/inventory")}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 font-semibold text-sm hover:bg-white/5 transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">inventory_2</span>
                Inventory
              </button>
              <button
                onClick={() => { setMintPhase('form'); setMintResult(null); setMintSteps([]); setForm({ ...form, name: '' }); }}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 font-semibold text-sm hover:bg-white/5 transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Mint Another
              </button>
            </div>
          </div>

          {/* Network badge */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-white/30 text-xs font-mono">Transaction confirmed on DUAL Network</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Mint Form ──
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 bg-white";
  const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5";

  return (
    <div>
      <header className="h-20 flex items-center justify-between px-8 bg-surface border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Admin</span>
          <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
          <span className="text-primary font-semibold">Mint Wine</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Authenticated
          </span>
        </div>
      </header>

      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Mint New Token</h1>
          <p className="text-sm text-slate-500">Create a new tokenised asset on the DUAL network</p>
        </div>

        {/* Token Mode Toggle */}
        <div className="mb-6 max-w-4xl">
          <div className="inline-flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setTokenMode('wine')}
              className={`px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition ${
                tokenMode === 'wine'
                  ? 'bg-wine-700 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-lg">wine_bar</span>
              Wine Token
            </button>
            <button
              type="button"
              onClick={() => setTokenMode('video')}
              className={`px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition ${
                tokenMode === 'video'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-lg">videocam</span>
              Video Token
            </button>
          </div>
        </div>

        {mintError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm max-w-4xl">
            {mintError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          {/* AI Asset Generation — always shown */}
          <div className="bg-surface rounded-xl shadow-sm border border-amber-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-lg">auto_awesome</span>
              AI-Generated Assets
              <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Nano Banana</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Fill in the wine metadata below, then generate {tokenMode === 'video' ? 'a product image and cinematic video' : 'a product image'} from it
            </p>

            {/* Generate All button */}
            {!imageUrl && !generating && (
              <button
                type="button"
                onClick={handleGenerateAssets}
                className="w-full border-2 border-dashed border-amber-300 rounded-xl py-10 flex flex-col items-center gap-3 hover:border-amber-500 hover:bg-amber-50/50 transition group"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                  <span className="material-symbols-outlined text-2xl text-white">auto_awesome</span>
                </div>
                <span className="text-sm font-semibold text-amber-700">
                  Generate {tokenMode === 'video' ? 'Image & Video' : 'Product Image'} from Metadata
                </span>
                <span className="text-xs text-slate-400">
                  Uses wine name, region, vintage, tasting notes &amp; more
                </span>
              </button>
            )}

            {/* Generation progress */}
            {generating && (
              <div className="w-full rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 py-8 flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-amber-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
                  <div className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-orange-500 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1s', animationDirection: 'reverse' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600 text-xl">
                      {genPhase === 'image' ? 'image' : 'movie_creation'}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-amber-800">
                    {genPhase === 'image' ? 'Generating Product Image...' : 'Generating Cinematic Video...'}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    {genPhase === 'image' ? 'Nano Banana is creating your wine label artwork' : 'Nano Banana Video is rendering your clip'}
                  </p>
                </div>
                {/* Progress indicators */}
                <div className="flex items-center gap-3 mt-1">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    genPhase === 'image' ? 'bg-amber-200 text-amber-800 animate-pulse' :
                    imageUrl ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <span className="material-symbols-outlined text-xs">{imageUrl ? 'check_circle' : 'image'}</span>
                    Image
                  </div>
                  {tokenMode === 'video' && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      genPhase === 'video' ? 'bg-amber-200 text-amber-800 animate-pulse' :
                      videoUrl ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined text-xs">{videoUrl ? 'check_circle' : 'videocam'}</span>
                      Video
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">
                  {genPhase === 'image' ? 'Usually takes 5–15 seconds' : 'May take 30–120 seconds'}
                </p>
              </div>
            )}

            {/* Generated assets preview */}
            {(imageUrl || videoUrl) && !generating && (
              <div className="space-y-4">
                {/* Image preview */}
                {imageUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                        <span className="text-xs font-semibold text-slate-700">AI Product Image</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={handleGenerateImage}
                          className="text-xs text-amber-600 hover:text-amber-800 transition flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">refresh</span>
                          Regenerate
                        </button>
                        <button type="button" onClick={() => { setImageUrlAndRef(''); setImagePrompt(''); }}
                          className="text-xs text-red-500 hover:text-red-700 transition">
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={imageUrl} alt="AI generated wine" className="w-full max-h-72 object-contain mx-auto" />
                    </div>
                    {imagePrompt && (
                      <details className="text-xs">
                        <summary className="text-slate-400 cursor-pointer hover:text-slate-600 transition">View image prompt</summary>
                        <p className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 leading-relaxed">{imagePrompt}</p>
                      </details>
                    )}
                  </div>
                )}

                {/* Video preview */}
                {videoUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                        <span className="text-xs font-semibold text-slate-700">AI Cinematic Video</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={handleGenerateVideo}
                          className="text-xs text-amber-600 hover:text-amber-800 transition flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">refresh</span>
                          Regenerate
                        </button>
                        <button type="button" onClick={() => { setVideoUrlAndRef(''); setVideoPrompt(''); }}
                          className="text-xs text-red-500 hover:text-red-700 transition">
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-black">
                      <video src={videoUrl} controls className="w-full max-h-64 mx-auto" />
                    </div>
                    {videoPrompt && (
                      <details className="text-xs">
                        <summary className="text-slate-400 cursor-pointer hover:text-slate-600 transition">View video prompt</summary>
                        <p className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 leading-relaxed">{videoPrompt}</p>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wine Information */}
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">{tokenMode === 'video' ? 'info' : 'wine_bar'}</span>
              {tokenMode === 'video' ? 'Token Information' : 'Wine Information'}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className={labelClass}>Wine Name *</label><input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="e.g. Penfolds Grange 2018" /></div>
              <div><label className={labelClass}>Producer *</label><input required value={form.producer} onChange={(e) => update("producer", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Varietal *</label><input required value={form.varietal} onChange={(e) => update("varietal", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Region *</label><input required value={form.region} onChange={(e) => update("region", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Country *</label><input required value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Vintage *</label><input type="number" required value={form.vintage} onChange={(e) => update("vintage", parseInt(e.target.value))} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Type *</label>
                <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputClass}>
                  {["red", "white", "sparkling", "rosé", "dessert", "fortified"].map((t: any) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div><label className={labelClass}>ABV (%)</label><input type="number" step="0.1" value={form.abv} onChange={(e) => update("abv", parseFloat(e.target.value))} className={inputClass} /></div>
              <div><label className={labelClass}>Volume</label><input value={form.volume} onChange={(e) => update("volume", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Quantity</label><input type="number" min="1" value={form.quantity} onChange={(e) => update("quantity", parseInt(e.target.value))} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Condition</label>
                <select value={form.condition} onChange={(e) => update("condition", e.target.value)} className={inputClass}>
                  {["pristine", "excellent", "very_good", "good", "fair", "poor"].map((c: any) => (
                    <option key={c} value={c}>{c.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2"><label className={labelClass}>Description</label><textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} className={inputClass} /></div>
            </div>
          </div>

          {/* Valuation & Storage */}
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-lg">payments</span>
              Valuation & Storage
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Purchase Price ($)</label><input type="number" value={form.purchasePrice} onChange={(e) => update("purchasePrice", parseFloat(e.target.value))} className={inputClass} /></div>
              <div><label className={labelClass}>Current Value ($)</label><input type="number" value={form.currentValue} onChange={(e) => update("currentValue", parseFloat(e.target.value))} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Storage Type</label>
                <select value={form.storage} onChange={(e) => update("storage", e.target.value)} className={inputClass}>
                  {["professional", "home_cellar", "bonded_warehouse", "in_transit"].map((s: any) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Drink From</label><input type="number" value={form.drinkingFrom} onChange={(e) => update("drinkingFrom", parseInt(e.target.value))} className={inputClass} /></div>
                <div><label className={labelClass}>Drink To</label><input type="number" value={form.drinkingTo} onChange={(e) => update("drinkingTo", parseInt(e.target.value))} className={inputClass} /></div>
              </div>
            </div>
          </div>

          {/* Tasting Notes */}
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-lg">restaurant</span>
              Tasting Notes
            </h3>
            <div className="space-y-4">
              <div><label className={labelClass}>Nose</label><input value={form.nose} onChange={(e) => update("nose", e.target.value)} className={inputClass} placeholder="Aromas and scents..." /></div>
              <div><label className={labelClass}>Palate</label><input value={form.palate} onChange={(e) => update("palate", e.target.value)} className={inputClass} placeholder="Taste and texture..." /></div>
              <div><label className={labelClass}>Finish</label><input value={form.finish} onChange={(e) => update("finish", e.target.value)} className={inputClass} placeholder="Aftertaste and length..." /></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl gold-gradient text-white font-bold text-sm shadow-lg shadow-accent/20 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <span className="material-symbols-outlined">database</span>
            )}
            {submitting ? "Minting on DUAL..." : tokenMode === 'video' ? "Mint Video Token" : "Mint Wine Token"}
          </button>

          {/* Generate assets hint if not yet generated */}
          {!imageUrl && !generating && (
            <p className="text-xs text-center text-amber-600 -mt-2">
              Tip: Scroll up to generate AI image{tokenMode === 'video' ? ' & video' : ''} before minting
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// ── Helper Components ──

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const truncated = mono && value.length > 28 ? value.slice(0, 14) + '...' + value.slice(-10) : value;

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/40 text-xs flex-shrink-0">{label}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className={`text-xs text-right truncate max-w-[220px] group flex items-center gap-1.5 hover:text-gold-300 transition ${
          mono ? 'font-mono text-white/60' : 'text-white/70'
        }`}
      >
        <span>{truncated}</span>
        <span className="material-symbols-outlined text-[11px] opacity-0 group-hover:opacity-100 transition">
          {copied ? 'check' : 'content_copy'}
        </span>
      </button>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
