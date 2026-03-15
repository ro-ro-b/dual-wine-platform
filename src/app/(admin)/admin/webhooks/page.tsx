'use client';

import { useState, useEffect, useRef } from "react";
import { Webhook, Radio, Wifi, WifiOff } from "lucide-react";

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Webhook Events</h1>
          <p className="text-stone-500">Real-time event stream from the DUAL network</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          connected ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"
        }`}>
          {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {connected ? "Connected" : "Disconnected"}
        </div>
      </div>

      {/* Connection Info */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <h3 className="font-semibold text-stone-900 mb-3">Webhook Configuration</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-stone-500">Endpoint:</span>
            <code className="ml-2 bg-stone-100 px-2 py-1 rounded text-xs font-mono">/api/webhooks</code>
          </div>
          <div>
            <span className="text-stone-500">Verification:</span>
            <span className="ml-2 text-stone-700">HMAC-SHA256</span>
          </div>
          <div>
            <span className="text-stone-500">SSE Stream:</span>
            <code className="ml-2 bg-stone-100 px-2 py-1 rounded text-xs font-mono">/api/sse</code>
          </div>
          <div>
            <span className="text-stone-500">Status:</span>
            <span className={`ml-2 ${connected ? "text-green-600" : "text-amber-600"}`}>
              {connected ? "Streaming" : "Waiting for events"}
            </span>
          </div>
        </div>
        <p className="text-xs text-stone-400 mt-4">
          Configure DUAL_WEBHOOK_SECRET and DUAL_WEBHOOK_CALLBACK_URL to receive live blockchain events.
          Events are verified using HMAC-SHA256 signatures and broadcast via SSE to connected clients.
        </p>
      </div>

      {/* Event Stream */}
      <div className="bg-wine-950 rounded-xl p-6 min-h-[400px]">
        <div className="flex items-center gap-2 mb-4">
          <Radio className={`w-4 h-4 ${connected ? "text-green-400 animate-pulse" : "text-stone-500"}`} />
          <span className="text-sm font-medium text-wine-300">Live Event Stream</span>
          <span className="text-xs text-wine-500 ml-auto">{events.length} events</span>
        </div>
        {events.length === 0 ? (
          <div className="text-center py-16 text-wine-500">
            <Webhook className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Waiting for webhook events...</p>
            <p className="text-xs mt-1">Events will appear here in real-time when the DUAL network sends them</p>
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {events.map((event) => (
              <div key={event.id} className="bg-wine-900/50 rounded-lg p-3 border border-wine-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-400">{event.type}</span>
                  <span className="text-wine-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
                <pre className="text-wine-300 whitespace-pre-wrap break-all">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
