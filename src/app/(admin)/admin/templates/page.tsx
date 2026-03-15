'use client';

import { useState, useEffect } from "react";
import type { Template } from "@/types/dual";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => { setTemplates(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-slate-400">Loading templates...</div>;

  return (
    <div>
      <header className="h-20 flex items-center justify-between px-8 bg-surface border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Admin</span>
          <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
          <span className="text-primary font-semibold">Templates</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">AD</div>
        </div>
      </header>

      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Wine Templates</h1>
          <p className="text-sm text-slate-500">DUAL protocol templates define the schema for wine tokens</p>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No templates configured</div>
        ) : (
          <div className="space-y-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-surface rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">description</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{template.name}</h3>
                      <p className="text-xs text-slate-500">ID: {template.id}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{template.description}</p>
                </div>

                {/* Properties */}
                <div className="p-6 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">settings</span>
                    Properties Schema
                  </h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {template.properties.map((prop) => (
                      <div key={prop.key} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-900">{prop.key}</span>
                          {prop.required && (
                            <span className="text-[10px] font-bold text-accent uppercase">required</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          Type: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">{prop.type}</code>
                          {prop.enumValues && (
                            <span className="ml-1 text-slate-400">({prop.enumValues.join(", ")})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    Available Actions
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {template.actions.map((action) => (
                      <div key={action.type} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="font-semibold text-sm text-slate-900 mb-0.5">{action.label}</div>
                        <div className="text-xs text-slate-500">{action.description}</div>
                        {action.requiredParams.length > 0 && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Params: {action.requiredParams.join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
