"use client";

import React, { useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import {
  useGetAdminBannersQuery,
  useGetBannersQuery,
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerStatusMutation,
  type BannerItem,
} from "@/redux/api/dashboardApi";
import ImageUploader from "@/components/ImageUploader";
import { getErrorMessage } from "@/lib/utils";
import Image from "next/image";

export default function BannersPage() {
  const { data: adminRes, isLoading: isAdminLoading } = useGetAdminBannersQuery();
  const { data: publicRes, isLoading: isPublicLoading } = useGetBannersQuery();
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();
  const [toggleStatus] = useToggleBannerStatusMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [ctaText, setCtaText] = useState("Shop Collection");
  const [linkUrl, setLinkUrl] = useState("/shop");
  const [placement, setPlacement] = useState("HERO");
  const [sortOrder, setSortOrder] = useState("1");
  const [isActive, setIsActive] = useState(true);

  // Filter state
  const [selectedPlacement, setSelectedPlacement] = useState("ALL");

  const rawAdminData = adminRes?.data;
  const rawPublicData = publicRes?.data;

  let banners: BannerItem[] = [];
  if (Array.isArray(rawAdminData)) {
    banners = rawAdminData;
  } else if (rawAdminData && "banners" in rawAdminData) {
    banners = (rawAdminData as { banners: BannerItem[] }).banners;
  } else if (Array.isArray(rawPublicData)) {
    banners = rawPublicData;
  }

  const filteredBanners = banners.filter((b) => {
    if (selectedPlacement === "ALL") return true;
    return b.placement === selectedPlacement;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !imageUrl.trim()) {
      setErrorMessage("Please provide both a banner title and image.");
      return;
    }

    try {
      await createBanner({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        badge: badge.trim() || undefined,
        imageUrl: imageUrl.trim(),
        mobileImageUrl: mobileImageUrl.trim() || undefined,
        ctaText: ctaText.trim() || undefined,
        linkUrl: linkUrl.trim() || undefined,
        placement,
        sortOrder: parseInt(sortOrder, 10) || 1,
        isActive,
      }).unwrap();

      setFeedback(`Banner "${title}" created successfully!`);
      setIsModalOpen(false);
      setTitle("");
      setSubtitle("");
      setBadge("");
      setImageUrl("");
      setMobileImageUrl("");
      setCtaText("Shop Collection");
      setLinkUrl("/shop");
      setSortOrder("1");
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Failed to create banner."));
    }
  };

  const handleDelete = async (id: string, bannerTitle: string) => {
    if (!confirm(`Are you sure you want to delete banner "${bannerTitle}"?`)) return;
    try {
      await deleteBanner(id).unwrap();
      setFeedback(`Banner "${bannerTitle}" deleted successfully.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert("Failed to delete banner.");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleStatus(id).unwrap();
    } catch {
      alert("Failed to toggle banner status.");
    }
  };

  const isLoading = isAdminLoading && isPublicLoading;

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-amber-400" />
            <span>Promotional Banners & Hero Slider</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Configure dynamic homepage hero banners, promotional section sliders, and editorial drops
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ── Filter Tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "HERO", "SECTION_TOP", "SECTION_BOTTOM", "POPUP", "CATEGORY_HEADER"].map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPlacement(p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              selectedPlacement === p
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                : "bg-zinc-900/60 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {p.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* ── Banners Grid ───────────────────────────────────────── */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-xs">Fetching promotional banners...</span>
        </div>
      ) : filteredBanners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBanners.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl bg-zinc-900/60 border ${
                b.isActive ? "border-white/10" : "border-rose-500/20 opacity-70"
              } p-5 backdrop-blur-md space-y-4 transition-all`}
            >
              <div className="h-48 rounded-xl overflow-hidden bg-zinc-950 border border-white/10 relative group">
                {b.imageUrl ? (
                  <Image
                    src={b.imageUrl}
                    alt={b.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    No image provided
                  </div>
                )}
                {b.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-black shadow-md">
                    {b.badge}
                  </span>
                )}
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur-md text-amber-400 border border-white/10">
                  Order: #{b.sortOrder}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-bold text-white text-sm">{b.title}</h3>
                  <span className="text-emerald-400 font-medium text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {b.placement}
                  </span>
                </div>
                {b.subtitle && (
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {b.subtitle}
                  </p>
                )}
                {b.linkUrl && (
                  <p className="text-[11px] text-amber-400/80 font-mono flex items-center gap-1 pt-1">
                    <ExternalLink className="w-3 h-3" />
                    <span>{b.linkUrl}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <button
                  type="button"
                  onClick={() => handleToggle(b.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    b.isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {b.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{b.isActive ? "Active (Visible)" : "Hidden"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(b.id, b.title)}
                  disabled={isDeleting}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 rounded-2xl bg-zinc-900/40 border border-white/10 text-center text-xs text-slate-400 space-y-2">
          <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
          <p>No banners configured. Click &quot;Add Banner&quot; above to create a dynamic homepage slide.</p>
        </div>
      )}

      {/* ── Create Banner Modal ────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full space-y-5 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <span>Create Dynamic Banner</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Publish a new banner slide for the homepage, categories, or seasonal campaigns
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold uppercase tracking-wider text-slate-300">
                  Banner Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. URBAN LUXURY. MINIMALIST ESSENCE."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold uppercase tracking-wider text-slate-300">
                  Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Architectural silhouettes engineered with 380+ GSM super-combed organic cotton..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SS/26 Collection Now Live • Drop 01"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Placement Location
                  </label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="HERO">HERO (Main Homepage Slider)</option>
                    <option value="SECTION_TOP">SECTION_TOP (Top Banner)</option>
                    <option value="SECTION_BOTTOM">SECTION_BOTTOM (Bottom Promotion)</option>
                    <option value="POPUP">POPUP (Modal Announcement)</option>
                    <option value="CATEGORY_HEADER">CATEGORY_HEADER (Category Top)</option>
                  </select>
                </div>
              </div>

              {/* MinIO Image Upload */}
              <ImageUploader
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                label="Banner Desktop Imagery (MinIO S3)"
                folder="banners"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="Explore New Drops"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Target Link URL
                  </label>
                  <input
                    type="text"
                    placeholder="/shop?filter=new"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Sort Order Priority
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs disabled:opacity-60 flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Banner...</span>
                    </>
                  ) : (
                    <span>Save Banner</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

