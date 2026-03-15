'use client';

import { useState, useEffect } from "react";
import type { Organization } from "@/types/dual";

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/organizations")
      .then((r) => r.json())
      .then((data) => { setOrgs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-slate-400">Loading organizations...</div>;

  const roleColors: Record<string, string> = {
    owner: "bg-accent/10 text-accent",
    admin: "bg-primary/10 text-primary",
    member: "bg-slate-100 text-slate-600",
  };

  const roleIcons: Record<string, string> = {
    owner: "stars",
    admin: "shield",
    member: "person",
  };

  return (
    <div>
      <header className="h-20 flex items-center justify-between px-8 bg-surface border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Admin</span>
          <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
          <span className="text-primary font-semibold">Organizations</span>
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
          <h1 className="text-xl font-bold text-slate-900">Organizations</h1>
          <p className="text-sm text-slate-500">DUAL network organization management</p>
        </div>

        {orgs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No organizations found</div>
        ) : (
          <div className="space-y-6">
            {orgs.map((org) => (
              <div key={org.id} className="bg-surface rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-2xl">corporate_fare</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{org.name}</h3>
                      <p className="text-xs text-slate-500">ID: {org.id} · Created {new Date(org.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {org.description && <p className="text-sm text-slate-600 mt-3">{org.description}</p>}
                </div>

                <div className="p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">group</span>
                    Members ({org.members.length})
                  </h4>
                  <div className="space-y-2">
                    {org.members.map((member) => (
                      <div key={member.userId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${roleColors[member.role]}`}>
                          <span className="material-symbols-outlined text-sm">{roleIcons[member.role]}</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{member.userId}</div>
                          <div className="text-xs text-slate-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${roleColors[member.role]}`}>
                          {member.role}
                        </span>
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
