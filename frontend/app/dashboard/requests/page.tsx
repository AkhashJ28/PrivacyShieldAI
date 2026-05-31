"use client";

import { useEffect, useState } from "react";
import { Loader2, FileText, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { AccessRequest, getRequests } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!user) {
      Promise.resolve().then(() => {
        if (active) setLoading(false);
      });
      return () => {
        active = false;
      };
    }

    getRequests()
      .then((res) => {
        if (active && res.success && res.requests) {
          setRequests(res.requests.filter((request) => request.officer_name === user.name));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch requests:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

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

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "approved": return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "rejected": return <XCircle className="w-4 h-4 text-danger" />;
      default: return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-success bg-success/10 border-success/20";
      case "rejected": return "text-danger bg-danger/10 border-danger/20";
      default: return "text-warning bg-warning/10 border-warning/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-primary-light animate-spin" />
        <span className="ml-3 text-sm text-slate-400">Loading your requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">My Access Requests</h1>
        <p className="text-slate-400 text-xs">
          Track the status of your submitted identity unmasking justifications.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No requests submitted yet.</p>
          <p className="text-xs text-slate-600 mt-1">Submit a request from the Incidents page.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="p-3">Target Video</th>
                <th className="p-3">Justification</th>
                <th className="p-3">Submitted On</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-white/[0.01]">
                  <td className="p-3 font-semibold text-white truncate max-w-[150px]" title={req.documents?.original_name}>
                    {req.documents?.original_name || "Unknown"}
                  </td>
                  <td className="p-3 text-slate-400 max-w-[250px] truncate" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="p-3 font-mono text-slate-500">
                    {formatDate(req.created_at)}
                  </td>
                  <td className="p-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border capitalize font-bold text-[10px] ${statusColor(req.status)}`}>
                      <StatusIcon status={req.status} />
                      {req.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
