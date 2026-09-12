"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Star,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  X,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import {
  useGetAdminReviewsQuery,
  useDeleteReviewMutation,
  type ReviewAdminItem,
} from "@/redux/api/dashboardApi";
import { formatDate, getErrorMessage } from "@/lib/utils";

export default function ReviewsPage() {
  const [search, setSearch] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deletingReview, setDeletingReview] = useState<ReviewAdminItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    data: res,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminReviewsQuery({
    rating: selectedRating,
    search: search.trim() || undefined,
  });

  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const rawData = res?.data;
  const reviews: ReviewAdminItem[] = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    if ("reviews" in rawData && Array.isArray(rawData.reviews)) {
      return rawData.reviews;
    }
    return [];
  }, [rawData]);

  // Summary Metrics Calculation
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { total: 0, avg: 0, fiveStar: 0, photoCount: 0 };

    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avg = Number((sum / total).toFixed(1));
    const fiveStar = reviews.filter((r) => r.rating === 5).length;
    const photoCount = reviews.filter((r) => r.images && r.images.length > 0).length;

    return { total, avg, fiveStar, photoCount };
  }, [reviews]);

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReview) return;
    try {
      await deleteReview(deletingReview.id).unwrap();
      showToast(
        "success",
        `Review by "${deletingReview.user?.name || deletingReview.user?.email || "Customer"}" deleted successfully.`
      );
      setDeletingReview(null);
    } catch (err) {
      showToast("error", getErrorMessage(err, "Failed to delete review."));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </span>
            <span>Product Reviews & Moderation</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Moderate verified customer feedback, rating scores, sentiment, and submitted product photos.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 disabled:opacity-50 w-fit self-start sm:self-auto flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-amber-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Toast Feedback Notification ───────────────────────── */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ── Key Metrics Overview ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Reviews</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {stats.total}
          </div>
          <p className="text-[11px] text-slate-400">Total customer testimonials</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Average Rating</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-1.5">
            <span>{stats.avg > 0 ? stats.avg : "5.0"}</span>
            <span className="text-xs text-amber-400 font-normal">/ 5.0</span>
          </div>
          <p className="text-[11px] text-emerald-400/90 font-medium">Overall satisfaction score</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>5-Star Ratings</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {stats.fiveStar}
          </div>
          <p className="text-[11px] text-yellow-400/90 font-medium">Top tier verified praise</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Photo Reviews</span>
            <ImageIcon className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {stats.photoCount}
          </div>
          <p className="text-[11px] text-sky-400/90 font-medium">User-uploaded gallery media</p>
        </div>
      </div>

      {/* ── Search & Star Filters ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, product, or keywords..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-zinc-950/70 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Rating Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedRating(undefined)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              selectedRating === undefined
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold"
                : "bg-zinc-800/60 hover:bg-zinc-800 text-slate-300 hover:text-white border border-white/5"
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => setSelectedRating(stars)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1 whitespace-nowrap transition-all ${
                selectedRating === stars
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold"
                  : "bg-zinc-800/60 hover:bg-zinc-800 text-slate-300 hover:text-white border border-white/5"
              }`}
            >
              <span>{stars}</span>
              <Star
                className={`w-3 h-3 ${
                  selectedRating === stars ? "fill-black text-black" : "fill-amber-400 text-amber-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Reviews Grid ───────────────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs font-medium">Fetching customer reviews...</span>
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-zinc-950/70 border border-white/10 hover:border-amber-500/30 backdrop-blur-md space-y-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 group"
              >
                <div className="space-y-3.5">
                  {/* Customer Header & Star Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 relative">
                        {r.user?.avatarUrl ? (
                          <Image
                            src={r.user.avatarUrl}
                            alt={r.user.name || "Customer"}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          (r.user?.name || "C").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-white">
                            {r.user?.name || "Verified Customer"}
                          </h3>
                          {r.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {r.user?.email || "customer@example.com"}
                        </p>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 shrink-0 shadow-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < r.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-700"
                          }`}
                        />
                      ))}
                      <span className="text-[11px] font-bold ml-1 text-white font-mono">
                        {r.rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Attached Product Tag */}
                  {r.product && (
                    <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden shrink-0 relative">
                        {r.product.images && r.product.images[0]?.url ? (
                          <Image
                            src={r.product.images[0].url}
                            alt={r.product.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-semibold">
                          PRODUCT
                        </span>
                        <p className="text-xs text-white font-semibold truncate">
                          {r.product.title}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    &ldquo;{r.comment}&rdquo;
                  </p>

                  {/* Customer Uploaded Photos */}
                  {r.images && r.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                      {r.images.map((imgUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewImage(imgUrl)}
                          className="w-12 h-12 rounded-lg border border-white/10 overflow-hidden hover:border-amber-400 transition-colors shrink-0 relative group/img"
                        >
                          <Image
                            src={imgUrl}
                            alt={`Customer review photo ${i + 1}`}
                            fill
                            unoptimized
                            className="object-cover group-hover/img:scale-105 transition-transform"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Meta & Actions */}
                <div className="flex items-center justify-between text-[11px] pt-3 border-t border-white/5">
                  <span className="text-slate-500 font-mono text-[10px]">
                    {formatDate(r.createdAt, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20">
                      Published
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeletingReview(r)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 text-amber-400/50 mx-auto" />
            <p className="font-semibold text-white text-sm">No customer reviews found</p>
            <p className="text-slate-500">No testimonials match your current rating or search filters.</p>
          </div>
        )}
      </div>

      {/* ── Photo Lightbox Modal ──────────────────────────────── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[80vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white p-1 hover:text-amber-400 text-xs font-semibold flex items-center gap-1"
            >
              <X className="w-5 h-5" />
              <span>Close</span>
            </button>
            <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden border border-white/20">
              <Image
                src={previewImage}
                alt="Customer preview"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────── */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Delete Customer Review</h3>
                <p className="text-xs text-slate-400">
                  By {deletingReview.user?.name || deletingReview.user?.email || "Customer"}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed italic bg-zinc-950 p-3 rounded-xl border border-white/5">
              &ldquo;{deletingReview.comment}&rdquo;
            </p>

            <p className="text-xs text-slate-400">
              Are you sure you want to permanently remove this review? This will also update the product's aggregate rating score.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                onClick={() => setDeletingReview(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/20 active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Review</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
