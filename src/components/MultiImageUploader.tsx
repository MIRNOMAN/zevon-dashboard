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
  Star,
  StarOff,
  Sparkles,
  Images,
} from "lucide-react";
import { useUploadImageMutation } from "@/redux/api/dashboardApi";
import { getErrorMessage } from "@/lib/utils";
import Image from "next/image";

export interface GalleryImage {
  id?: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

interface MultiImageUploaderProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  folder?: string;
  label?: string;
}

export default function MultiImageUploader({
  images,
  onChange,
  folder = "products",
  label = "Product Imagery & Gallery",
}: MultiImageUploaderProps) {
  const [uploadImage] = useUploadImageMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [directUrl, setDirectUrl] = useState("");

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploadError(null);
    setIsUploading(true);

    const newImages: GalleryImage[] = [...images];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!file) continue;

      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds 10MB limit and was skipped.`);
        continue;
      }

      setUploadProgress(`Uploading ${i + 1} of ${fileArray.length} to MinIO...`);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await uploadImage(formData).unwrap();
        const uploadedUrl = res.data?.url;
        if (uploadedUrl) {
          const isFirstImage = newImages.length === 0;
          newImages.push({
            url: uploadedUrl,
            altText: file.name.replace(/\.[^/.]+$/, ""),
            isPrimary: isFirstImage,
            sortOrder: newImages.length,
          });
        }
      } catch (err: unknown) {
        setUploadError(getErrorMessage(err, `Failed to upload "${file.name}" to MinIO.`));
      }
    }

    setIsUploading(false);
    setUploadProgress(null);
    onChange(newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // reset input so same file can be chosen again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddDirectUrl = () => {
    const trimmed = directUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setUploadError("Please provide a valid image URL starting with http:// or https://");
      return;
    }

    const isFirst = images.length === 0;
    onChange([
      ...images,
      {
        url: trimmed,
        altText: "Product Image",
        isPrimary: isFirst,
        sortOrder: images.length,
      },
    ]);
    setDirectUrl("");
    setUploadError(null);
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // If the removed image was primary, make the first remaining image primary
    if (images[index]?.isPrimary && updated.length > 0 && updated[0]) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Images className="w-4 h-4 text-amber-400" />
          <span>{label}</span>
          <span className="text-[11px] font-normal text-slate-400">({images.length} images)</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors font-medium cursor-pointer"
        >
          {showUrlInput ? "← Upload from Computer" : "+ Paste Direct Image URL"}
        </button>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Direct URL Input Mode */}
      {showUrlInput && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-white/10">
          <input
            type="url"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddDirectUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddDirectUrl}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-semibold hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
          >
            Add URL
          </button>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-4 sm:p-5 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-amber-400 bg-amber-500/15 scale-[0.99]"
            : "border-white/15 bg-zinc-950/60 hover:border-amber-400/60 hover:bg-white/[0.02]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2.5">
          {isUploading ? (
            <div className="flex items-center gap-3 text-amber-400 py-2">
              <Loader2 className="w-6 h-6 animate-spin shrink-0" />
              <div className="text-left">
                <span className="text-xs font-semibold block text-white">
                  {uploadProgress || "Uploading images to MinIO S3..."}
                </span>
                <span className="text-[10px] text-amber-400/80 font-mono">
                  Bucket: emdadullah (api.zenexcloud.com)
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-bold text-[11px] shadow-md shadow-amber-500/20">
                      Choose Multiple Images
                    </span>
                    <span className="text-xs text-slate-400">or drop them here</span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-0.5">
                    Select 1 or multiple files (PNG, JPG, WEBP, AVIF up to 10MB each)
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Uploaded Gallery (Click star to set Primary Thumbnail)</span>
            <span className="text-amber-400 font-medium font-mono">{images.length} Loaded</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative rounded-xl border overflow-hidden bg-zinc-950 group transition-all ${
                  img.isPrimary
                    ? "border-amber-400 ring-1 ring-amber-400/50"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Image Preview */}
                <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-900 relative">
                  <Image
                    src={img.url}
                    alt={img.altText || `Product View ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />

                  {/* Primary Cover Badge */}
                  {img.isPrimary && (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Star className="w-2.5 h-2.5 fill-black" />
                      <span>Primary Cover</span>
                    </div>
                  )}

                  {/* Hover Overlay Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-between">
                      {!img.isPrimary ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrimary(idx);
                          }}
                          className="p-1 rounded-lg bg-black/70 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 transition-all text-[10px] flex items-center gap-1 px-1.5 cursor-pointer"
                          title="Set as Primary Cover Thumbnail"
                        >
                          <Star className="w-3 h-3" />
                          <span>Set Primary</span>
                        </button>
                      ) : (
                        <span />
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="p-1 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                      <span className="truncate max-w-[120px] font-mono">{idx + 1}. View</span>
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white"
                        title="Open full resolution"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
