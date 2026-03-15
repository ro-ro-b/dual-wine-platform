'use client';

import { useState, useEffect } from "react";
import type { Template } from "@/types/dual";
import { FileCode, Settings, Zap } from "lucide-react";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => { setTemplates(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-stone-400">Loading templates...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Wine Templates</h1>
        <p className="text-stone-500">DUAL protocol templates define the schema for wine tokens</p>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 text-stone-400">No templates configured</div>
      ) : (
        <div className="space-y-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="p-6 border-b border-stone-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-wine-50 flex items-center justify-center">
                    <FileCode className="w-5 h-5 text-wine-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">{template.name}</h3>
                    <p className="text-xs text-stone-500">ID: {template.id}</p>
                  </div>
                </div>
                <p className="text-sm text-stone-600 mt-2">{template.description}</p>
              </div>

              {/* Properties */}
              <div className="p-6 border-b border-stone-100">
                <h4 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Properties Schema
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {template.properties.map((prop) => (
                    <div key={prop.key} className="bg-stone-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-stone-900">{prop.key}</span>
                        {prop.required && <span className="text-xs text-wine-600">required</span>}
                      </div>
                      <div className="text-xs text-stone-500">
                        Type: <code className="bg-stone-200 px-1.5 py-0.5 rounded">{prop.type}</code>
                        {prop.enumValues && (
                          <span className="ml-2">({prop.enumValues.join(", ")})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6">
                <h4 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Available Actions
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {template.actions.map((action) => (
                    <div key={action.type} className="bg-stone-50 rounded-lg p-3">
                      <div className="font-medium text-sm text-stone-900 mb-0.5">{action.label}</div>
                      <div className="text-xs text-stone-500">{action.description}</div>
                      {action.requiredParams.length > 0 && (
                        <div className="text-xs text-stone-400 mt-1">
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
  );
}
