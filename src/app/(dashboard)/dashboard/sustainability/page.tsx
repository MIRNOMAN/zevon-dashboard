"use client";

import React, { useState } from "react";
import {
  Leaf,
  Award,
  Sparkles,
  Droplets,
  Recycle,
  ShieldCheck,
  Edit3,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Globe2,
} from "lucide-react";
import {
  useGetSustainabilityMetricsQuery,
  useUpdateSustainabilityMetricsMutation,
  useGetSustainabilityStoriesQuery,
  useCreateSustainabilityStoryMutation,
  useUpdateSustainabilityStoryMutation,
  useDeleteSustainabilityStoryMutation,
  type SustainabilityStory,
} from "@/redux/api/sustainabilityApi";
import { getErrorMessage } from "@/lib/utils";

export default function SustainabilityPage() {
  const { data: metricsRes, isLoading: isMetricsLoading, refetch: refetchMetrics } =
    useGetSustainabilityMetricsQuery();
  const { data: storiesRes, isLoading: isStoriesLoading, refetch: refetchStories } =
    useGetSustainabilityStoriesQuery();

  const [updateMetrics, { isLoading: isUpdatingMetrics }] = useUpdateSustainabilityMetricsMutation();
  const [createStory, { isLoading: isCreatingStory }] = useCreateSustainabilityStoryMutation();
  const [updateStory, { isLoading: isUpdatingStory }] = useUpdateSustainabilityStoryMutation();
  const [deleteStory, { isLoading: isDeletingStory }] = useDeleteSustainabilityStoryMutation();

  const metrics = metricsRes?.data;
  const stories = storiesRes?.data || [];

  // Feedback Banner State
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Metrics Modal State
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [metricsForm, setMetricsForm] = useState({
    organicSourcingPercent: 94.2,
    organicSourcingDescription: "Certified GOTS organic silk & pure wool",
    carbonOffsetPercent: 100,
    carbonOffsetDescription: "All DHL Air express dispatches neutralized",
    plasticFreePackagingPercent: 100,
    plasticFreePackagingDescription: "Biodegradable mulberry paper & cotton garment bags",
    waterRecycledPercent: 85,
    waterRecycledDescription: "Closed-loop biological effluent water treatment plants",
    totalGarmentsRecycled: 1420,
  });

  // Story Modal State
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [storyForm, setStoryForm] = useState({
    title: "",
    summary: "",
    content: "",
    coverImageUrl: "",
    isPublished: true,
  });

  const openMetricsEdit = () => {
    if (metrics) {
      setMetricsForm({
        organicSourcingPercent: metrics.organicSourcingPercent,
        organicSourcingDescription: metrics.organicSourcingDescription,
        carbonOffsetPercent: metrics.carbonOffsetPercent,
        carbonOffsetDescription: metrics.carbonOffsetDescription,
        plasticFreePackagingPercent: metrics.plasticFreePackagingPercent,
        plasticFreePackagingDescription: metrics.plasticFreePackagingDescription,
        waterRecycledPercent: metrics.waterRecycledPercent,
        waterRecycledDescription: metrics.waterRecycledDescription,
        totalGarmentsRecycled: metrics.totalGarmentsRecycled,
      });
    }
    setIsMetricsModalOpen(true);
  };

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMetrics(metricsForm).unwrap();
      showToast("success", "Sustainability metrics updated successfully");
      setIsMetricsModalOpen(false);
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to update metrics"));
    }
  };

  const openNewStoryModal = () => {
    setEditingStoryId(null);
    setStoryForm({
      title: "",
      summary: "",
      content: "",
      coverImageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop",
      isPublished: true,
    });
    setIsStoryModalOpen(true);
  };

  const openEditStoryModal = (story: SustainabilityStory) => {
    setEditingStoryId(story.id);
    setStoryForm({
      title: story.title,
      summary: story.summary,
      content: story.content,
      coverImageUrl: story.coverImageUrl,
      isPublished: story.isPublished,
    });
    setIsStoryModalOpen(true);
  };

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.title.trim() || !storyForm.summary.trim() || !storyForm.content.trim()) {
      showToast("error", "Please fill in all required fields");
      return;
    }

    try {
      if (editingStoryId) {
        await updateStory({ id: editingStoryId, data: storyForm }).unwrap();
        showToast("success", "Initiative updated successfully");
      } else {
        await createStory(storyForm).unwrap();
        showToast("success", "New initiative published successfully");
      }
      setIsStoryModalOpen(false);
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to save initiative"));
    }
  };

  const handleDeleteStory = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteStory(id).unwrap();
      showToast("success", "Initiative deleted successfully");
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to delete initiative"));
    }
  };

  const togglePublishStatus = async (story: SustainabilityStory) => {
    try {
      await updateStory({
        id: story.id,
        data: { isPublished: !story.isPublished },
      }).unwrap();
      showToast("success", story.isPublished ? "Set to draft" : "Published initiative");
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to update status"));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Leaf className="w-6 h-6 text-emerald-400" />
            <span>Sustainability & Ethical Metrics</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Organic silk certifications, zero-waste cashmere recycling, and carbon offset logs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              refetchMetrics();
              refetchStories();
            }}
            className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-slate-300 hover:text-white hover:bg-zinc-800 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={openMetricsEdit}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition shadow-lg shadow-emerald-500/10"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Metrics</span>
          </button>
          <button
            type="button"
            onClick={openNewStoryModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-black text-xs font-bold transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Initiative</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Top 3 Core Metrics (Matching the image) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Organic Sourcing */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2 group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Organic Sourcing
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400/60 group-hover:text-emerald-400 transition" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {isMetricsLoading ? "..." : `${metrics?.organicSourcingPercent ?? 94.2}%`}
          </div>
          <p className="text-xs text-slate-400">
            {metrics?.organicSourcingDescription || "Certified GOTS organic silk & pure wool"}
          </p>
        </div>

        {/* Card 2: Carbon Offset */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2 group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Carbon Offset
            </span>
            <Globe2 className="w-4 h-4 text-emerald-400/60 group-hover:text-emerald-400 transition" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {isMetricsLoading ? "..." : `${metrics?.carbonOffsetPercent ?? 100}%`}
          </div>
          <p className="text-xs text-slate-400">
            {metrics?.carbonOffsetDescription || "All DHL Air express dispatches neutralized"}
          </p>
        </div>

        {/* Card 3: Plastic-Free Packaging */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2 group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Plastic-Free Packaging
            </span>
            <Recycle className="w-4 h-4 text-emerald-400/60 group-hover:text-emerald-400 transition" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {isMetricsLoading ? "..." : `${metrics?.plasticFreePackagingPercent ?? 100}%`}
          </div>
          <p className="text-xs text-slate-400">
            {metrics?.plasticFreePackagingDescription || "Biodegradable mulberry paper & cotton garment bags"}
          </p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Water Recycled in Dyeing</div>
            <div className="text-lg font-bold text-white">
              {metrics?.waterRecycledPercent ?? 85}%
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Recycle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Archival Garments Upcycled</div>
            <div className="text-lg font-bold text-white">
              {(metrics?.totalGarmentsRecycled ?? 1420).toLocaleString()}+ Units
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Active Eco Initiatives</div>
            <div className="text-lg font-bold text-white">
              {stories.length || metrics?.activeEcoInitiativesCount || 4} Published
            </div>
          </div>
        </div>
      </div>

      {/* Initiatives & Certification Logs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Ethical Atelier Stories & Certifications ({stories.length})</span>
          </h2>
        </div>

        {isStoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-zinc-900/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-zinc-900/30 border border-white/5">
            <Leaf className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">No sustainability initiatives yet.</p>
            <button
              onClick={openNewStoryModal}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold"
            >
              Add First Initiative
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="group relative rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-emerald-500/30 p-5 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        story.isPublished
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-slate-400 border border-white/5"
                      }`}
                    >
                      {story.isPublished ? "Live Published" : "Draft"}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-90">
                      <button
                        onClick={() => togglePublishStatus(story)}
                        title={story.isPublished ? "Unpublish" : "Publish"}
                        className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${story.isPublished ? "text-emerald-400" : "text-slate-500"}`} />
                      </button>
                      <button
                        onClick={() => openEditStoryModal(story)}
                        title="Edit Story"
                        className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStory(story.id, story.title)}
                        title="Delete Story"
                        className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                      {story.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {story.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono truncate max-w-[200px]">slug: /{story.slug}</span>
                  <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Metrics Modal */}
      {isMetricsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <span>Update Sustainability Metrics</span>
              </h2>
              <button
                onClick={() => setIsMetricsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMetrics} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Organic Sourcing (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={metricsForm.organicSourcingPercent}
                    onChange={(e) =>
                      setMetricsForm({ ...metricsForm, organicSourcingPercent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-emerald-400 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Carbon Offset (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={metricsForm.carbonOffsetPercent}
                    onChange={(e) =>
                      setMetricsForm({ ...metricsForm, carbonOffsetPercent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-emerald-400 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Organic Sourcing Subtitle</label>
                <input
                  type="text"
                  value={metricsForm.organicSourcingDescription}
                  onChange={(e) =>
                    setMetricsForm({ ...metricsForm, organicSourcingDescription: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Plastic-Free Packaging (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={metricsForm.plasticFreePackagingPercent}
                    onChange={(e) =>
                      setMetricsForm({ ...metricsForm, plasticFreePackagingPercent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-emerald-400 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Water Recycled (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={metricsForm.waterRecycledPercent}
                    onChange={(e) =>
                      setMetricsForm({ ...metricsForm, waterRecycledPercent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-emerald-400 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Garments Recycled Count</label>
                <input
                  type="number"
                  min="0"
                  value={metricsForm.totalGarmentsRecycled}
                  onChange={(e) =>
                    setMetricsForm({ ...metricsForm, totalGarmentsRecycled: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-emerald-400 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMetricsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingMetrics}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingMetrics ? "Saving..." : "Save Metrics"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Story / Initiative Modal */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" />
                <span>{editingStoryId ? "Edit Ethical Initiative" : "New Sustainability Initiative"}</span>
              </h2>
              <button
                onClick={() => setIsStoryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Initiative Title *</label>
                <input
                  type="text"
                  placeholder="e.g. 100% GOTS Certified Organic Heavyweight Cotton"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-emerald-400 outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Summary *</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of this ecological standard..."
                  value={storyForm.summary}
                  onChange={(e) => setStoryForm({ ...storyForm, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-emerald-400 outline-none resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Detailed Content *</label>
                <textarea
                  rows={4}
                  placeholder="In-depth details of materials, certification bodies, and artisan impact..."
                  value={storyForm.content}
                  onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-emerald-400 outline-none resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={storyForm.coverImageUrl}
                  onChange={(e) => setStoryForm({ ...storyForm, coverImageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={storyForm.isPublished}
                  onChange={(e) => setStoryForm({ ...storyForm, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0 focus:outline-none"
                />
                <label htmlFor="isPublished" className="text-xs font-medium text-slate-300 cursor-pointer">
                  Publish immediately to store frontend
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingStory || isUpdatingStory}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingStory || isUpdatingStory ? "Saving..." : editingStoryId ? "Update Initiative" : "Create Initiative"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
