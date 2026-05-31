"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Film, Image as ImageIcon, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentItem, getDocument } from "@/lib/api";
import Link from "next/link";

export default function MediaView() {
  const params = useParams<{ id: string }>();
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getDocument(params.id)
      .then((response) => {
        if (active) setDocument(response.document);
      })
      .catch(() => {
        if (active) setError("Media could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  const isImage = document?.media_type === "image" || document?.content_type?.startsWith("image/");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <Link href="/dashboard/incidents" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to protected media
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-success font-bold bg-success/10 border border-success/20 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3 inline mr-1" />
              Blurred Output
            </span>
            {document && (
              <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                {isImage ? "Image" : "Video"}
              </span>
            )}
          </div>
          <h1 className="text-xl font-extrabold text-white mt-2">
            {document?.original_name || "Protected Media"}
          </h1>
          <p className="text-slate-400 text-xs">This is the stored, privacy-preserving file returned by the blur pipeline.</p>
        </div>

        {document?.file_url && (
          <a href={document.file_url} target="_blank" rel="noopener noreferrer">
            <Button className="bg-primary hover:bg-primary-light text-white font-semibold text-xs h-9">
              Open Source File
            </Button>
          </a>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-3 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-[11px] font-mono uppercase text-slate-300 flex items-center gap-1.5">
            {isImage ? <ImageIcon className="w-3.5 h-3.5 text-primary-light" /> : <Film className="w-3.5 h-3.5 text-primary-light" />}
            Protected Preview
          </h3>
        </div>

        {loading ? (
          <div className="h-[520px] bg-slate-950 flex items-center justify-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-primary-light" />
            Loading media...
          </div>
        ) : error || !document ? (
          <div className="h-[520px] bg-slate-950 flex items-center justify-center text-danger text-sm">
            {error || "Media not found."}
          </div>
        ) : isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={document.file_url} alt={document.original_name} className="max-h-[640px] w-full object-contain bg-black" />
        ) : (
          <video src={document.file_url} controls className="max-h-[640px] w-full bg-black" />
        )}
      </div>
    </div>
  );
}
