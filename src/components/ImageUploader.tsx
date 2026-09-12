"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileImage,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Sparkles,
} from "lucide-react";
import { useUploadImageMutation } from "@/redux/api/dashboardApi";
import { getErrorMessage } from "@/lib/utils";
import Image from "next/image";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export default function ImageUploader({
  value,
  onChange,
  folder = "products",
  label = "Product Imagery",
}: ImageUploaderProps) {
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploadError(null);

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size must be less than 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadImage(formData).unwrap();
      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
      }
    } catch (err: unknown) {
      setUploadError(getErrorMessage(err, "Failed to upload image to MinIO Cloud Storage."));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <FileImage className="w-3.5 h-3.5 text-amber-400" />
          <span>{label} *</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors font-medium"
        >
          {showUrlInput ? "← Import from Computer / Device" : "Paste Direct URL"}
        </button>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {showUrlInput ? (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>
      ) : value ? (
        <div className="relative rounded-2xl border border-white/10 bg-zinc-950/90 p-4 flex items-center gap-4 group">
          <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden shrink-0 relative">
            <Image
              src={value}
              alt="Uploaded Preview"
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Uploaded to MinIO S3 (emdadullah bucket)</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate">{value}</p>
            <div className="flex items-center gap-3 pt-0.5">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:underline"
              >
                <span>View full resolution</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] text-slate-400 hover:text-white underline"
              >
                Replace image
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange("")}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            title="Remove Image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-amber-400 bg-amber-500/15 scale-[0.99]"
              : "border-white/15 bg-zinc-950/60 hover:border-amber-400/60 hover:bg-white/[0.02]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3">
            {isUploading ? (
              <>
                <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-white font-semibold block">
                    Uploading image to MinIO Cloud Storage...
                  </span>
                  <span className="text-[11px] text-amber-400/80 font-mono block">
                    Bucket: emdadullah (api.zenexcloud.com)
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-md shadow-amber-500/20">
                      Import Image File
                    </span>
                    <span className="text-xs text-slate-400">or drag and drop here</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    PNG, JPG, WEBP, AVIF, GIF up to 10MB (Stored on MinIO)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
