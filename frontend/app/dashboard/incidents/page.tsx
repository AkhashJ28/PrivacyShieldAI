"use client";

import { useEffect, useState } from "react";
import { Eye, Loader2, Film, ShieldAlert, LockOpen, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AccessRequest,
  createAccessRequest,
  DocumentItem,
  getDocuments,
  getRequests,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

export default function IncidentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [myRequests, setMyRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestReason, setRequestReason] = useState("");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [dialogOpenId, setDialogOpenId] = useState<string | null>(null);

  const loadData = async () => {
    const [docsRes, reqsRes] = await Promise.all([getDocuments(), getRequests()]);
    setDocuments(docsRes.success ? docsRes.documents || [] : []);
    setMyRequests(
      reqsRes.success
        ? (reqsRes.requests || []).filter((request) => request.officer_name === user?.name)
        : []
    );
  };

  useEffect(() => {
    let active = true;

    Promise.all([getDocuments(), getRequests()])
      .then(([docsRes, reqsRes]) => {
        if (!active) return;
        setDocuments(docsRes.success ? docsRes.documents || [] : []);
        setMyRequests(
          reqsRes.success
            ? (reqsRes.requests || []).filter((request) => request.officer_name === user?.name)
            : []
        );
      })
      .catch((error) => {
        console.error("Failed to fetch media:", error);
        toast.error("Failed to load uploaded media");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.name]);

  const handleRequestAccess = async (docId: string) => {
    if (!requestReason.trim()) return;

    setSubmittingId(docId);
    try {
      const res = await createAccessRequest({
        document_id: docId,
        officer_name: user?.name || "Unknown Officer",
        reason: requestReason.trim(),
      });

      if (res.success) {
        toast.success("Request submitted", {
          description: "Admin will review your justification.",
        });
        setDialogOpenId(null);
        setRequestReason("");
        await loadData();
      } else {
        throw new Error(res.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      toast.error("Failed to request access", { description: msg });
    } finally {
      setSubmittingId(null);
    }
  };

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

  const statusLabel = (status: string | null) => {
    if (!status || status === "pending") return { text: "Processing", color: "text-warning" };
    if (status === "completed") return { text: "Blurred", color: "text-success" };
    return { text: status, color: "text-slate-400" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-primary-light animate-spin" />
        <span className="ml-3 text-sm text-slate-400">Loading protected media...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Protected Media</h1>
        <p className="text-slate-400 text-xs">
          Review blurred uploads and request identity access only when an investigation requires it.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Film className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No protected media has been uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const existingReq = myRequests.find((request) => request.document_id === doc.id);
            const isApproved = existingReq?.status === "approved";
            const isPending = existingReq?.status === "pending";
            const st = statusLabel(doc.processing_status);
            const isImage = doc.media_type === "image" || doc.content_type?.startsWith("image/");

            return (
              <div key={doc.id} className="glass-card flex flex-col overflow-hidden group hover:border-primary/30 transition-all">
                <div className="h-56 bg-black/60 relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                  {doc.file_url ? (
                    isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={doc.file_url} alt={doc.original_name} className="h-full w-full object-contain" />
                    ) : (
                      <video src={doc.file_url} className="h-full w-full object-contain bg-black" muted preload="metadata" />
                    )
                  ) : (
                    <Film className="w-8 h-8 text-white/10" />
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10">
                    {isApproved ? (
                      <>
                        <LockOpen className="w-3 h-3 text-success" />
                        <span className="text-[10px] font-bold text-success uppercase tracking-wider">Access Granted</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3 h-3 text-primary-light" />
                        <span className="text-[10px] font-bold text-primary-light uppercase tracking-wider">Privacy Mode</span>
                      </>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10">
                    {isImage ? <ImageIcon className="w-3 h-3 text-slate-300" /> : <Film className="w-3 h-3 text-slate-300" />}
                    <span className="text-[10px] text-slate-300 uppercase">{isImage ? "Image" : "Video"}</span>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white truncate" title={doc.original_name}>
                      {doc.original_name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-slate-500">
                      <span>{formatDate(doc.created_at)}</span>
                      <span>-</span>
                      <span className={st.color}>{st.text}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <Link href={`/dashboard/view/${doc.id}`} className="flex-1">
                      <Button variant="outline" className="w-full text-xs h-8 bg-white/[0.02] border-white/10 hover:bg-white/5 hover:text-white">
                        <Eye className="w-3.5 h-3.5 mr-1.5" /> Open
                      </Button>
                    </Link>

                    {user?.role === "officer" && (
                      <div className="flex-1">
                        {isApproved ? (
                          <Button className="w-full text-xs h-8 bg-success hover:bg-success/90 text-white font-bold cursor-default">
                            Access Granted
                          </Button>
                        ) : isPending ? (
                          <Button variant="outline" className="w-full text-xs h-8 bg-warning/10 text-warning border-warning/20 cursor-default hover:bg-warning/10 hover:text-warning">
                            Pending Admin
                          </Button>
                        ) : (
                          <Dialog open={dialogOpenId === doc.id} onOpenChange={(open) => setDialogOpenId(open ? doc.id : null)}>
                            <DialogTrigger asChild>
                              <Button className="w-full text-xs h-8 bg-primary hover:bg-primary-light text-white font-bold">
                                Request Access
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-surface border-white/10 text-white">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <ShieldAlert className="w-4 h-4 text-warning" />
                                  Identity Access Request
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                  You are requesting identity access for{" "}
                                  <strong className="text-primary-light font-mono">{doc.original_name}</strong>.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                  <label className="text-xs font-mono text-slate-400 uppercase">Legal Justification</label>
                                  <textarea
                                    className="w-full bg-background border border-white/10 rounded-md p-3 text-sm text-white focus:border-primary-light focus:outline-none resize-none"
                                    rows={4}
                                    placeholder="Describe why identity access is necessary for this investigation."
                                    value={requestReason}
                                    onChange={(event) => setRequestReason(event.target.value)}
                                  />
                                </div>
                                <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
                                  <p className="text-[10px] text-warning/90 leading-relaxed">
                                    This request is permanently logged and must match an active investigation.
                                  </p>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button variant="outline" className="bg-transparent border-white/10 hover:bg-white/5" onClick={() => setDialogOpenId(null)}>
                                  Cancel
                                </Button>
                                <Button
                                  className="bg-primary hover:bg-primary-light text-white"
                                  disabled={submittingId === doc.id || !requestReason.trim()}
                                  onClick={() => handleRequestAccess(doc.id)}
                                >
                                  {submittingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                  Submit Request
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
