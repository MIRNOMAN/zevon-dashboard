"use client";

import React, { useState } from "react";
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
  Image as ImageIcon,
} from "lucide-react";
import {
  useGetAdminReviewsQuery,
  useDeleteReviewMutation,
  type ReviewAdminItem,
} from "@/redux/api/dashboardApi";

export default function ReviewsPage() {
  const [search, setSearch] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: res, isLoading } = useGetAdminReviewsQuery({
    rating: selectedRating,
    search: search.trim() || undefined,
  });

  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const rawData = res?.data;
  let reviews: ReviewAdminItem[] = [];
  if (Array.isArray(rawData)) {
    reviews = rawData;
  } else if (rawData && "reviews" in rawData) {
    reviews = rawData.reviews;
  }

  const handleDelete = async (id: string, customerName: string) => {
    if (!confirm(`Are you sure you want to remove the review by "${customerName}"?`)) return;
    try {
      await deleteReview(id).unwrap();
      setFeedback(`Review by "${customerName}" deleted successfully.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert("Failed to delete review.");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-400" />
            <span>Product Reviews & Moderation</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Moderate verified customer feedback, rating scores, sentiment, and submitted product photos
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ── Search & Star Filters ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, product, or keywords..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRating(undefined)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              selectedRating === undefined
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => setSelectedRating(stars)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1 transition-all ${
                selectedRating === stars
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <span>{stars}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Reviews Grid ───────────────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Fetching customer reviews...</span>
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-zinc-950/70 border border-white/10 backdrop-blur-md space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 relative">
                        {r.user?.avatarUrl ? (
                          <Image
                            src={r.user.avatarUrl}
                            alt={r.user.name || "Customer"}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          (r.user?.name || "C").charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-white">
                            {r.user?.name || "Verified Customer"}
                          </h3>
                          {r.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-medium px-1.5 py-0.2 rounded bg-emerald-500/10">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {r.user?.email || "customer@example.com"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                      <span className="text-[10px] font-bold ml-1 text-white">{r.rating}.0</span>
                    </div>
                  </div>

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
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
                          Product
                        </span>
                        <p className="text-xs text-white font-medium truncate">
                          {r.product.title}
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    &ldquo;{r.comment}&rdquo;
                  </p>

                  {/* Customer Uploaded Photos */}
                  {r.images && r.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                      {r.images.map((imgUrl, i) => (
                        <a
                          key={i}
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-lg border border-white/10 overflow-hidden hover:border-amber-400 transition-colors shrink-0 relative"
                        >
                          <Image
                            src={imgUrl}
                            alt={`Customer review media ${i + 1}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-3 border-t border-white/5">
                  <span className="text-slate-500 font-mono">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                      Published
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.user?.name || "Customer")}
                      disabled={isDeleting}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete / Moderate Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-slate-400 space-y-2">
            <MessageSquare className="w-6 h-6 text-amber-400 mx-auto" />
            <p>No customer reviews found matching your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

