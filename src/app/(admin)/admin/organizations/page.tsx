'use client';

import { useState, useEffect } from "react";
import type { Organization } from "@/types/dual";
import { Building, Users, Crown, Shield, User } from "lucide-react";

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/organizations")
      .then((r) => r.json())
      .then((data) => { setOrgs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-stone-400">Loading organizations...</div>;

  const roleIcons: Record<string, React.ReactNode> = {
    owner: <Crown className="w-3.5 h-3.5 text-gold-600" />,
    admin: <Shield className="w-3.5 h-3.5 text-wine-600" />,
    member: <User className="w-3.5 h-3.5 text-stone-400" />,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Organizations</h1>
        <p className="text-stone-500">DUAL network organization management</p>
      </div>

      {orgs.length === 0 ? (
        <div className="text-center py-12 text-stone-400">No organizations found</div>
      ) : (
        <div className="space-y-6">
          {orgs.map((org) => (
            <div key={org.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="p-6 border-b border-stone-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-wine-50 flex items-center justify-center">
                    <Building className="w-6 h-6 text-wine-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 text-lg">{org.name}</h3>
                    <p className="text-xs text-stone-500">ID: {org.id} · Created {new Date(org.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {org.description && <p className="text-sm text-stone-600 mt-3">{org.description}</p>}
              </div>

              <div className="p-6">
                <h4 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Members ({org.members.length})
                </h4>
                <div className="space-y-2">
                  {org.members.map((member) => (
                    <div key={member.userId} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-wine-100 flex items-center justify-center">
                        {roleIcons[member.role]}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-stone-900">{member.userId}</div>
                        <div className="text-xs text-stone-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        member.role === "owner" ? "bg-gold-50 text-gold-700" :
                        member.role === "admin" ? "bg-wine-50 text-wine-700" :
                        "bg-stone-100 text-stone-600"
                      }`}>
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
  );
}
