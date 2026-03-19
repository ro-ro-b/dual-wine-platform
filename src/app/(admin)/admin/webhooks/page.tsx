'use client';

import { useState, useEffect, useRef } from "react";

interface WebhookEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export default function WebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/sse");
    eventSourceRef.current = es;
    es.addEventListener("connected", () => setConnected(true));
    es.addEventListener("webhook", (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((prev) => [{ ...data, id: crypto.randomUUID(), timestamp: new Date().toISOString() }, ...prev].slice(0, 50));
      } catch {}
    });
    es.onerror = () => setConnected(false);
    return () => { es.close(); setConnected(false); };
  }, []);

  return (
    <div>
      <header className="h-20 flex items-center justify-between px-8 bg-surface border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Admin</span>
          <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
          <span className="text-primary font-semibold">Webhooks</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            connected ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
          }`}>
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-slate-400"}`} />
            {connected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </header>

      <div className="p-8 space-y-6">
        {/* Webhook Config Card */}
        <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">webhook</span>
            <h3 className="text-sm font-bold text-slate-900">Webhook Configuration</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Endpoint</span>
              <code className="block mt-1 bg-slate-50 px-3 py-2 rounded-lg text-xs font-mono text-slate-700 border border-slate-100">/api/webhooks</code>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SSE Stream</span>
              <code className="block mt-1 bg-slate-50 px-3 py-2 rounded-lg text-xs font-mono text-slate-700 border border-slate-100">/api/sse</code>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification</span>
              <p className="mt-1 text-slate-700">HMAC-SHA256</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
              <p className={`mt-1 ${connected ? "text-green-600" : "text-amber-600"}`}>
                {connected ? "Streaming" : "Waiting for events"}
              </p>
            </div>
          </div>
        </div>

        {/* Dark Terminal Panel */}
        <div className="bg-primary rounded-xl p-6 min-h-[400px]">
          <div className="flex items-center gap-2 mb-4">
            <span className={`material-symbols-outlined text-sm ${connected ? "text-green-400 animate-pulse" : "text-slate-500"}`}>radio_button_checked</span>
            <span className="text-sm font-semibold text-slate-300">Live Event Stream</span>
            <span className="text-xs text-slate-500 ml-auto">{events.length} events</span>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-slate-600 text-5xl mb-3 block">webhook</span>
              <p className="text-sm text-slate-500">Waiting for webhook events...</p>
              <p className="text-xs text-slate-600 mt-1">Events will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {events.map((event: any) => (
                <div key={event.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-400 font-semibold">{event.type}</span>
                    <span className="text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <pre className="text-slate-400 whitespace-pre-wrap break-all">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
