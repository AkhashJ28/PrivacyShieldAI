"use client";

import { useEffect, useState } from "react";
import { Film, ShieldCheck, Hourglass, Ban, Loader2 } from "lucide-react";
import { AccessRequest, getRequests, getDocuments } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([getRequests(), getDocuments()])
      .then(([reqRes, docRes]) => {
        if (!active) return;
        if (reqRes.success) setRequests(reqRes.requests || []);
        if (docRes.success) setDocCount((docRes.documents || []).length);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalRequests = requests.length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  const stats = user?.role === "admin"
    ? [
        { label: "Total Requests", value: String(totalRequests), icon: <Film className="text-accent" /> },
        { label: "Approved Access", value: String(approved), icon: <ShieldCheck className="text-success" /> },
        { label: "Pending Reviews", value: String(pending), icon: <Hourglass className="text-warning" /> },
        { label: "Rejected Requests", value: String(rejected), icon: <Ban className="text-danger" /> },
      ]
    : [
        { label: "Videos Uploaded", value: String(docCount), icon: <Film className="text-accent" /> },
        { label: "My Requests", value: String(totalRequests), icon: <ShieldCheck className="text-success" /> },
        { label: "Pending", value: String(pending), icon: <Hourglass className="text-warning" /> },
        { label: "Approved", value: String(approved), icon: <Ban className="text-primary-light" /> },
      ];

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-success bg-success/10 border-success/20";
      case "pending": return "text-warning bg-warning/10 border-warning/20";
      case "rejected": return "text-danger bg-danger/10 border-danger/20";
      default: return "text-slate-400 bg-white/5 border-white/10";
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-primary-light animate-spin" />
        <span className="ml-3 text-sm text-slate-400">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Dashboard Overview</h1>
        <p className="text-slate-400 text-xs">
          {user?.role === "admin"
            ? "System-wide surveillance parameters and access control metrics."
            : "Your surveillance activity and access request status."}
        </p>
      </div>

      {/* Statistics Block */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">{stat.label}</p>
              <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Recent Requests Table */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider font-mono">
          Recent Access Requests
        </h2>
        <div className="overflow-x-auto">
          {requests.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No access requests found.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-300 font-mono text-[11px] uppercase">
                <tr>
                  <th className="p-3 rounded-l-md">Officer</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Video</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-md">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {requests.slice(0, 8).map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.01]">
                    <td className="p-3 font-semibold text-white">{req.officer_name}</td>
                    <td className="p-3 text-slate-400 max-w-[200px] truncate">{req.reason}</td>
                    <td className="p-3 font-mono text-primary-light text-[11px]">
                      {req.documents?.original_name || "-"}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${statusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{formatDate(req.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
