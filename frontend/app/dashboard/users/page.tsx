"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getUsers, SystemUser } from "@/lib/api";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getUsers()
      .then((response) => {
        if (active) setUsers(response.success ? response.users || [] : []);
      })
      .catch((error) => {
        console.error("Failed to load users:", error);
        toast.error("Failed to load users");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">User Management</h1>
        <p className="text-slate-400 text-xs">Registered operators and administrative users.</p>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-400">
            <Loader2 className="w-5 h-5 text-primary-light animate-spin mr-2" />
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No users are configured.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-slate-300 font-mono text-[11px] uppercase">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.01]">
                  <td className="p-3 font-semibold text-white">{user.name}</td>
                  <td className="p-3 text-slate-400 font-mono">{user.email}</td>
                  <td className="p-3 text-primary-light font-mono font-bold capitalize">{user.role}</td>
                  <td className="p-3 text-right">
                    <span className="text-[10px] font-mono bg-success/10 border border-success/20 text-success px-2 py-0.5 rounded-full font-bold uppercase">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
