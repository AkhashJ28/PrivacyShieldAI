"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, AlertTriangle, Image as ImageIcon, Film } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { uploadMedia } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function UploadPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "uploading" | "completed" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const nextMediaType = file.type.startsWith("image/") ? "image" : "video";
    setFileName(file.name);
    setMediaType(nextMediaType);
    setStatus("uploading");
    setProgress(0);
    setFileUrl("");

    try {
      const result = await uploadMedia(file, user?.name || "Unknown Operator", (pct) => setProgress(pct));

      if (result.success) {
        setStatus("completed");
        setFileUrl(result.fileUrl || "");
        toast.success("Media protected", {
          description: `${file.name} was blurred and stored.`,
        });
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (err: unknown) {
      setStatus("error");
      const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
      toast.error("Upload failed", { description: message });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
      "video/*": [".mp4", ".mov", ".avi"],
    },
    maxSize: 100 * 1024 * 1024,
    disabled: status === "uploading",
  });

  const resetUpload = () => {
    setStatus("idle");
    setProgress(0);
    setFileName("");
    setFileUrl("");
    setMediaType(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Upload Media</h1>
        <p className="text-slate-400 text-xs">
          Upload images or CCTV footage. Detected faces are blurred before the file is stored.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`glass-card p-10 text-center border-2 border-dashed transition-all ${
          status === "uploading" ? "cursor-wait" : "cursor-pointer"
        } ${isDragActive ? "border-primary bg-primary/5" : "border-white/10 hover:border-primary/40"}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          {status === "idle" && (
            <>
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-1">
                <UploadCloud className="w-7 h-7 text-primary-light" />
              </div>
              <h3 className="text-sm font-bold text-white">Drag and drop an image or video here</h3>
              <p className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP, MP4, MOV, AVI up to 100MB</p>
            </>
          )}

          {status === "uploading" && (
            <div className="space-y-4 w-full max-w-sm">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-primary-light tracking-wide">{fileName}</p>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {progress}% uploaded. Face blurring continues on the server after transfer.
              </p>
            </div>
          )}

          {status === "completed" && (
            <div className="space-y-4 w-full max-w-2xl">
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-white">Media Protected and Stored</h3>
                <p className="text-[11px] text-success bg-success/10 border border-success/20 px-3 py-1 rounded-full inline-block font-mono mt-2">
                  {fileName}
                </p>
              </div>

              {fileUrl && (
                <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40">
                  {mediaType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fileUrl} alt={`Blurred ${fileName}`} className="max-h-[420px] w-full object-contain" />
                  ) : (
                    <video src={fileUrl} controls className="max-h-[420px] w-full bg-black" />
                  )}
                </div>
              )}

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  resetUpload();
                }}
                className="text-xs text-primary-light hover:text-white transition-colors underline underline-offset-4"
              >
                Upload another file
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <AlertTriangle className="w-12 h-12 text-danger mx-auto" />
              <h3 className="text-sm font-bold text-white">Upload Failed</h3>
              <p className="text-[11px] text-danger bg-danger/10 border border-danger/20 px-3 py-1 rounded-full inline-block font-mono">
                {fileName}
              </p>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  resetUpload();
                }}
                className="text-xs text-primary-light hover:text-white transition-colors underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <ImageIcon className="w-5 h-5 text-primary-light" />
          <div>
            <p className="text-sm font-bold text-white">Image Processing</p>
            <p className="text-xs text-slate-500">JPG, PNG and WEBP files are blurred and returned immediately.</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <Film className="w-5 h-5 text-accent-light" />
          <div>
            <p className="text-sm font-bold text-white">Video Processing</p>
            <p className="text-xs text-slate-500">CCTV footage is encoded as a browser-playable MP4 after blurring.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
