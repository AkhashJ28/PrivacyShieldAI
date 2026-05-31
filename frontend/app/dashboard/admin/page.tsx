"use client";

import { useEffect, useState } from "react";
import { Check, X, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccessRequest, getRequests, updateRequestStatus } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function AdminPanel() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await getRequests();
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getRequests()
      .then((res) => {
        if (active && res.success) {
          setRequests(res.requests || []);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch requests:", err);
        toast.error("Failed to load requests");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      const res = await updateRequestStatus(id, status, user?.name || "Admin");
      if (res.success) {
        toast.success(`Request ${status}`, {
          description: `Access request has been ${status}.`,
        });
        // Refresh the list
        await fetchRequests();
      } else {
        throw new Error("Action failed");
      }
    } catch (err) {
      console.error("Action error:", err);
      toast.error("Action failed", { description: "Could not update request status." });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const resolvedRequests = requests.filter((r) => r.status !== "pending");

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-primary-light animate-spin" />
        <span className="ml-3 text-sm text-slate-400">Loading requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Admin Review Panel</h1>
        <p className="text-slate-400 text-xs">
          Validate access justifications before decrypting temporary identity feeds.
        </p>
      </div>

      {/* Pending Requests */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-warning" /> Pending Requests
            {pendingRequests.length > 0 && (
              <span className="text-[10px] bg-warning/10 border border-warning/20 text-warning px-2 py-0.5 rounded-full font-mono">
                {pendingRequests.length}
              </span>
            )}
          </h3>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No pending requests.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="p-3">Officer</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Video</th>
                <th className="p-3">Submitted</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {pendingRequests.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.01]">
                  <td className="p-3 font-semibold text-white">{row.officer_name}</td>
                  <td className="p-3 text-slate-400 max-w-[200px] truncate">{row.reason}</td>
                  <td className="p-3 font-mono text-primary-light text-[11px]">
                    {row.documents?.original_name || "—"}
                  </td>
                  <td className="p-3 text-slate-500 font-mono">{formatDate(row.created_at)}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        disabled={actionLoading === row.id}
                        onClick={() => handleAction(row.id, "approved")}
                        className="bg-success hover:bg-success/80 text-white text-[11px] h-7 px-2"
                      >
                        {actionLoading === row.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        disabled={actionLoading === row.id}
                        onClick={() => handleAction(row.id, "rejected")}
                        className="bg-danger hover:bg-danger/80 text-white text-[11px] h-7 px-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Resolved Requests */}
      {resolvedRequests.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.01]">
            <h3 className="text-xs font-bold text-white">Resolved Requests</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="p-3">Officer</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {resolvedRequests.slice(0, 10).map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.01]">
                  <td className="p-3 font-semibold text-white">{row.officer_name}</td>
                  <td className="p-3 text-slate-400 max-w-[200px] truncate">{row.reason}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border capitalize font-mono font-bold ${
                        row.status === "approved"
                          ? "text-success bg-success/10 border-success/20"
                          : "text-danger bg-danger/10 border-danger/20"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-500">{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
