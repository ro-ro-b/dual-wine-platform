export default function ScanPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-accent text-4xl">qr_code_scanner</span>
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Scan Wine</h1>
      <p className="text-sm text-slate-500 max-w-[280px]">
        Scan a QR code or NFC tag on a wine bottle to verify authenticity and view provenance details.
      </p>
      <button className="mt-6 px-8 py-3 rounded-xl gold-gradient text-white font-bold text-sm shadow-lg shadow-gold-500/30">
        Open Scanner
      </button>
    </div>
  );
}
