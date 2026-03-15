'use client';

import { useState, useEffect } from "react";
import type { Action } from "@/types/dual";
import { Activity, CheckCircle, XCircle, Clock, ArrowUpRight } from "lucide-react";

const actionLabels: Record<string, string> = {
  MINT: "Wine Tokenised",
  LIST: "Listed for Sale",
  PURCHASE: "Wine Purchased",
  TRANSFER: "Ownership Transferred",
  REDEEM: "Wine Redeemed",
  VERIFY: "Authenticity Verified",
  STORE: "Storage Updated",
  UPDATE_VALUATION: "Valuation Updated",
  BURN: "Token Burned",
};

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
  pending: <Clock className="w-4 h-4 text-amber-500" />,
  processing: <Clock className="w-4 h-4 text-blue-500" />,
};

export default function ActivityPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/actions")
      .then((r) => r.json())
      .then((data) => { setActions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Activity Feed</h1>
        <p className="text-stone-500">Recent actions and events on your tokenised wines</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">Loading activity...</div>
      ) : actions.length === 0 ? (
        <div className="text-center py-12 text-stone-400">No activity yet</div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <div key={action.id} className="bg-white rounded-xl border border-stone-200 p-5 flex items-center gap-4 hover:shadow-sm transition">
              <div className="w-10 h-10 rounded-full bg-wine-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-wine-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-stone-900">
                    {actionLabels[action.type] ?? action.type}
                  </span>
                  {statusIcons[action.status]}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Wine: {action.wineId} · {new Date(action.createdAt).toLocaleString()}
                </div>
                {action.params && Object.keys(action.params).length > 0 && (
                  <div className="text-xs text-stone-400 mt-1">
                    {Object.entries(action.params).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                  action.status === "completed" ? "bg-green-50 text-green-700" :
                  action.status === "failed" ? "bg-red-50 text-red-700" :
                  "bg-amber-50 text-amber-700"
                }`}>
                  {action.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
