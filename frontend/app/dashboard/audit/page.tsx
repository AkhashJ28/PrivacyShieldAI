"use client";

import { useEffect, useState } from "react";
import { Layers, Loader2 } from "lucide-react";
import { AuditLog, getAuditLogs } from "@/lib/api";
import { toast } from "sonner";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getAuditLogs()
      .then((response) => {
        if (active) setLogs(response.success ? response.logs || [] : []);
      })
      .catch((error) => {
        console.error("Failed to load audit logs:", error);
        toast.error("Failed to load audit logs");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const tintForAction = (action: string) => {
    const normalized = action.toLowerCase();
    if (normalized.includes("approved")) return "text-success bg-success/10 border-success/20";
    if (normalized.includes("rejected")) return "text-danger bg-danger/10 border-danger/20";
    if (normalized.includes("requested")) return "text-warning bg-warning/10 border-warning/20";
    return "text-primary-light bg-primary/10 border-primary/20";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Audit Logs</h1>
        <p className="text-slate-400 text-xs">Live event trail for uploads, logins, and access decisions.</p>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
          <Layers className="w-4 h-4 text-primary-light" />
          <h3 className="text-xs font-bold text-white font-mono uppercase">System Events</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-400">
            <Loader2 className="w-5 h-5 text-primary-light animate-spin mr-2" />
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No audit events have been recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-300 font-mono text-[11px] uppercase">
                <tr>
                  <th className="p-3 rounded-l-md">Action</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Details</th>
                  <th className="p-3 rounded-r-md">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.01]">
                    <td className="p-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${tintForAction(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-white">{log.admin_name}</td>
                    <td className="p-3 text-slate-400">{log.details || "-"}</td>
                    <td className="p-3 font-mono text-slate-500">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
