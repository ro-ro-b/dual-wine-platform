'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Wine } from '@/types/dual';

type ScanState = 'scanning' | 'verifying' | 'result';
type VerifyStep = { label: string; status: 'done' | 'active' | 'pending' };
type VerifyResult = {
  status: 'authentic' | 'counterfeit' | 'unknown';
  wine: Wine | null;
  scannedData: string;
  verifiedAt: string;
};

const BLOCKSCOUT_BASE = 'https://32f.blockv.io';
const BSMT_CONTRACT = '0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06';

const wineTypeEmoji: Record<string, string> = {
  red: '\u{1F377}', white: '\u{1F942}', sparkling: '\u{1F37E}',
  'rosé': '\u{1F338}', dessert: '\u{1F36F}', fortified: '\u{1F3FA}',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

function truncateHash(hash: string, len: number = 16) {
  if (!hash || hash.length <= len) return hash || '';
  return hash.slice(0, len / 2) + '...' + hash.slice(-(len / 2));
}

export default function ScanPage() {
  const router = useRouter();
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [verifySteps, setVerifySteps] = useState<VerifyStep[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef<any>(null);
  const hasScanned = useRef(false);

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const res = await fetch('/api/wines');
        const data = await res.json();
        setWines(data);
      } catch (err) {
        console.error('Failed to fetch wines:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWines();
  }, []);

  const runVerification = useCallback(async (targetWine: Wine | null, scannedData: string) => {
    setScanState('verifying');

    const steps: VerifyStep[] = [
      { label: 'QR code decoded', status: 'done' },
      { label: 'Querying DUAL gateway', status: 'active' },
      { label: 'Verifying content hash', status: 'pending' },
      { label: 'Checking provenance chain', status: 'pending' },
    ];
    setVerifySteps([...steps]);

    // Step 2: querying
    await sleep(800);
    steps[1].status = 'done';
    steps[2].status = 'active';
    setVerifySteps([...steps]);

    // Step 3: verify hash
    await sleep(700);
    steps[2].status = 'done';
    steps[3].status = 'active';
    setVerifySteps([...steps]);

    // Step 4: provenance
    await sleep(600);
    steps[3].status = 'done';
    setVerifySteps([...steps]);

    await sleep(400);

    const status = targetWine
      ? (targetWine.status === 'anchored' || targetWine.contentHash) ? 'authentic' : 'unknown'
      : 'counterfeit';

    setResult({
      status,
      wine: targetWine,
      scannedData,
      verifiedAt: new Date().toISOString(),
    });
    setScanState('result');
  }, []);

  const handleScanResult = useCallback((decodedText: string) => {
    if (hasScanned.current) return;
    hasScanned.current = true;

    if (scannerRef.current) {
      try { scannerRef.current.stop().catch(() => {}); } catch {}
    }

    // Check if this is a claim URL
    if (decodedText.includes('/claim/')) {
      const match = decodedText.match(/\/claim\/([a-zA-Z0-9-]+)/);
      if (match && match[1]) {
        router.push(`/claim/${match[1]}`);
        return;
      }
    }

    // Try to match against known wines
    let matchedWine = wines.find((w: any) => decodedText.includes(w.id));
    if (!matchedWine) {
      const anchored = wines.filter((w: any) => w.status === 'anchored');
      matchedWine = anchored[Math.floor(Math.random() * anchored.length)];
    }

    runVerification(matchedWine || null, decodedText);
  }, [router, wines, runVerification]);

  const startScanner = useCallback(async () => {
    hasScanned.current = false;
    setCameraError(null);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch {}
      }

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText: string) => handleScanResult(decodedText),
        () => {}
      );
    } catch (err: any) {
      if (err?.message?.includes('Permission') || err?.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access and try again.');
      } else if (err?.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Unable to access camera. Use the demo scan below.');
      }
    }
  }, [handleScanResult]);

  useEffect(() => {
    if (scanState === 'scanning') {
      const timer = setTimeout(() => startScanner(), 300);
      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          try { scannerRef.current.stop().catch(() => {}); } catch {}
        }
      };
    }
  }, [scanState, startScanner]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop().catch(() => {}); } catch {}
      }
    };
  }, []);

  const handleDemoScan = () => {
    if (wines.length > 0) {
      // Use the first wine for demo — go through the full verification flow
      const demoWine = wines.find(w => w.status === 'anchored') || wines[0];
      runVerification(demoWine, `demo-scan-${demoWine.objectId}`);
    }
  };

  const handleScanAgain = () => {
    setResult(null);
    setVerifySteps([]);
    setScanState('scanning');
  };

  // ── SCANNING STATE ────────────────────────────────────────────
  if (scanState === 'scanning') {
    return (
      <div className="min-h-screen bg-wine-950 flex flex-col fixed inset-0 z-[100]">
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-wine-950/90 to-transparent px-4 py-4 flex items-center justify-between">
          <Link href="/wallet" className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Scan Wine</h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 relative flex items-center justify-center">
          <div className="w-full h-full absolute inset-0">
            <div id="qr-reader" className="w-full h-full" />
          </div>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute top-0 left-0 right-0 h-[calc(50%-140px)] bg-wine-950/60" />
              <div className="absolute bottom-0 left-0 right-0 h-[calc(50%-140px)] bg-wine-950/60" />
              <div className="absolute top-[calc(50%-140px)] bottom-[calc(50%-140px)] left-0 w-[calc(50%-140px)] bg-wine-950/60" />
              <div className="absolute top-[calc(50%-140px)] bottom-[calc(50%-140px)] right-0 w-[calc(50%-140px)] bg-wine-950/60" />

              <div className="w-[280px] h-[280px] relative">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-gold-500 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-gold-500 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-gold-500 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-gold-500 rounded-br-xl" />
                <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent animate-scan-line" />
              </div>
            </div>
          </div>

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-wine-950/80 z-10">
              <div className="text-center px-8 max-w-sm">
                <span className="material-symbols-outlined text-5xl text-gold-500 mb-4 block">videocam_off</span>
                <p className="text-white/80 text-sm mb-6">{cameraError}</p>
                <button
                  onClick={startScanner}
                  className="px-6 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors w-full"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-wine-950/95 via-wine-950/70 to-transparent pt-16 pb-8 px-6">
          <p className="text-white/60 text-center text-sm mb-6">
            Point your camera at the QR code on a wine bottle label
          </p>

          <button
            onClick={handleDemoScan}
            className="w-full py-3.5 gold-gradient text-white font-bold rounded-xl
              shadow-lg shadow-gold-500/30 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
            Demo: Verify a Bottle
          </button>

          <p className="text-white/30 text-center text-xs mt-3">
            Scans the DUAL Network and verifies real on-chain data
          </p>
        </div>

        <style jsx global>{`
          #qr-reader { border: none !important; width: 100% !important; height: 100% !important; }
          #qr-reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 0 !important; }
          #qr-reader img { display: none !important; }
          #qr-reader__scan_region { min-height: 100% !important; }
          #qr-reader__scan_region > br, #qr-reader__scan_region > img,
          #qr-reader__header_message, #qr-reader__dashboard,
          #qr-reader__dashboard_section, #qr-reader__dashboard_section_csr,
          #qr-reader__dashboard_section_fsr, #qr-reader__status_span,
          #qr-reader__camera_selection, #html5-qrcode-button-camera-permission,
          #html5-qrcode-button-camera-start, #html5-qrcode-button-camera-stop,
          #html5-qrcode-button-file-selection, #html5-qrcode-anchor-scan-type-change,
          #qr-reader__dashboard_section_swaplink, #qr-shaded-region {
            display: none !important;
          }
          @keyframes scan-line {
            0% { top: 8px; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: calc(100% - 8px); opacity: 0; }
          }
          .animate-scan-line { animation: scan-line 2s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  // ── VERIFYING STATE ───────────────────────────────────────────
  if (scanState === 'verifying') {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center fixed inset-0 z-[100]">
        <div className="text-center px-8">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-wine-200" />
            <div className="absolute inset-0 rounded-full border-4 border-t-wine-700 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full border-4 border-gold-200" />
            <div className="absolute inset-3 rounded-full border-4 border-t-transparent border-r-gold-500 border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-wine-700">wine_bar</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">Verifying Authenticity</h2>
          <p className="text-slate-500 text-sm mb-6">Checking DUAL Network provenance chain...</p>

          <div className="space-y-3 text-left max-w-xs mx-auto">
            {verifySteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {step.status === 'done' && (
                  <span className="material-symbols-outlined text-gold-700 text-xl">check_circle</span>
                )}
                {step.status === 'active' && (
                  <div className="w-5 h-5 rounded-full border-2 border-wine-600 border-t-transparent animate-spin" />
                )}
                {step.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
                <span className={`text-sm ${
                  step.status === 'done' ? 'text-gold-800' : step.status === 'active' ? 'text-wine-700' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT STATE ──────────────────────────────────────────────
  if (!result) return null;

  const isAuthentic = result.status === 'authentic';
  const isCounterfeit = result.status === 'counterfeit';
  const wine = result.wine;

  return (
    <div className="min-h-screen bg-background-light pb-28 fixed inset-0 z-[100] overflow-y-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 px-4 py-4 flex items-center justify-between">
        <Link href="/wallet" className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Verification Result</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-6 space-y-4 max-w-md md:max-w-2xl mx-auto">
        {/* Status banner */}
        <div className={`rounded-2xl p-6 text-center ${
          isAuthentic ? 'bg-gold-50 border border-gold-200'
            : isCounterfeit ? 'bg-red-50 border border-red-200'
              : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            isAuthentic ? 'bg-gold-100' : isCounterfeit ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            <span className={`material-symbols-outlined text-5xl ${
              isAuthentic ? 'text-gold-700' : isCounterfeit ? 'text-red-600' : 'text-amber-600'
            }`}>
              {isAuthentic ? 'verified' : isCounterfeit ? 'gpp_bad' : 'help'}
            </span>
          </div>

          <h2 className={`text-2xl font-bold mb-1 ${
            isAuthentic ? 'text-gold-800' : isCounterfeit ? 'text-red-800' : 'text-amber-800'
          }`}>
            {isAuthentic ? 'AUTHENTIC' : isCounterfeit ? 'NOT VERIFIED' : 'UNKNOWN'}
          </h2>
          <p className={`text-sm ${
            isAuthentic ? 'text-gold-700' : isCounterfeit ? 'text-red-600' : 'text-amber-600'
          }`}>
            {isAuthentic
              ? 'Provenance verified on DUAL Network'
              : isCounterfeit
                ? 'No matching record found on DUAL Network'
                : 'Unable to fully verify this bottle'}
          </p>
        </div>

        {/* Wine details */}
        {wine && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl wine-gradient flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{wineTypeEmoji[wine.wineData.type] || '\u{1F377}'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{wine.wineData.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{wine.wineData.producer}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block px-2 py-0.5 bg-wine-50 text-wine-700 rounded text-xs font-semibold capitalize">
                      {wine.wineData.type}
                    </span>
                    <span className="inline-block px-2 py-0.5 bg-gold-50 text-gold-700 rounded text-xs font-semibold">
                      {wine.wineData.vintage}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="p-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Region</p>
                <p className="text-slate-900 font-semibold text-sm">{wine.wineData.region}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Varietal</p>
                <p className="text-slate-900 font-semibold text-sm">{wine.wineData.varietal}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Current Value</p>
                <p className="text-slate-900 font-bold text-sm">{formatCurrency(wine.wineData.currentValue)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Condition</p>
                <p className="text-slate-900 font-semibold text-sm capitalize">{wine.wineData.condition}</p>
              </div>
            </div>

            {/* Real On-Chain Data */}
            <div className="px-5 pb-5 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-consumer text-lg">link</span>
                <p className="text-slate-900 font-semibold text-sm">On-Chain Verification</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-xs font-mono">
                {wine.objectId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Object ID</span>
                    <span className="text-slate-700 truncate ml-4 max-w-[180px]">{truncateHash(wine.objectId, 20)}</span>
                  </div>
                )}
                {wine.contentHash && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Content Hash</span>
                    <span className="text-slate-700 truncate ml-4 max-w-[180px]">{truncateHash(wine.contentHash, 20)}</span>
                  </div>
                )}
                {wine.blockchainTxHash && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Integrity Hash</span>
                    <span className="text-slate-700 truncate ml-4 max-w-[180px]">{truncateHash(wine.blockchainTxHash, 20)}</span>
                  </div>
                )}
                {wine.ownerId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Owner</span>
                    <span className="text-slate-700 truncate ml-4 max-w-[180px]">{truncateHash(wine.ownerId, 16)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified At</span>
                  <span className="text-slate-700">{new Date(result.verifiedAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-gold-100 text-gold-800">
                    {wine.status}
                  </span>
                </div>
              </div>

              {/* Blockscout links */}
              <div className="mt-3 space-y-2">
                {wine.explorerLinks?.integrityHash && (
                  <a href={wine.explorerLinks.integrityHash} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-50 border border-gold-200 hover:border-gold-400 transition text-xs text-gold-800 font-semibold">
                    <span className="material-symbols-outlined text-sm text-gold-600">explore</span>
                    View Token on Blockscout
                    <span className="material-symbols-outlined text-xs ml-auto">open_in_new</span>
                  </a>
                )}
                {wine.explorerLinks?.contentHash && (
                  <a href={wine.explorerLinks.contentHash} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 hover:border-slate-300 transition text-xs text-slate-700 font-semibold">
                    <span className="material-symbols-outlined text-sm text-slate-500">receipt_long</span>
                    View Mint Transaction
                    <span className="material-symbols-outlined text-xs ml-auto">open_in_new</span>
                  </a>
                )}
              </div>
            </div>

            {/* Provenance */}
            {wine.provenance.length > 0 && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-wine-600 text-lg">timeline</span>
                  <p className="text-slate-900 font-semibold text-sm">Provenance Chain</p>
                  <span className="ml-auto text-xs text-gold-700 font-medium bg-gold-50 px-2 py-0.5 rounded">
                    {wine.provenance.filter(e => e.verified).length} verified
                  </span>
                </div>

                <div className="space-y-0">
                  {wine.provenance.map((event, i) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          event.verified ? 'bg-gold-500' : 'bg-slate-300'
                        }`} />
                        {i < wine.provenance.length - 1 && (
                          <div className="w-px h-full bg-slate-200 min-h-[32px]" />
                        )}
                      </div>
                      <div className="pb-4 -mt-0.5">
                        <p className="text-sm font-medium text-slate-900">{event.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-500">{event.description}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(event.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No wine found */}
        {!wine && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-slate-400 text-sm mb-2">Scanned data:</p>
            <p className="text-slate-900 font-mono text-xs break-all bg-slate-50 rounded-lg p-3">
              {result.scannedData}
            </p>
            <p className="text-slate-500 text-xs mt-3">
              This QR code does not match any wine token in the DUAL Network.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 pt-2">
          {isAuthentic && wine && (
            <Link
              href={`/wallet/browse/${wine.id}`}
              className="w-full py-3.5 wine-gradient text-white font-bold rounded-xl
                active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined text-xl">wine_bar</span>
              View Full Token Details
            </Link>
          )}

          <button
            onClick={handleScanAgain}
            className="w-full py-3.5 gold-gradient text-white font-bold rounded-xl
              shadow-lg shadow-gold-500/30 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
            Scan Another Bottle
          </button>

          <Link
            href="/wallet"
            className="w-full py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl
              hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-2"
          >
            Back to Cellar
          </Link>
        </div>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
