"use client";

import React, { useState } from "react";
import { FolderTree, Plus, Edit, Loader2, CheckCircle2 } from "lucide-react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  type CategoryItem,
} from "@/redux/api/dashboardApi";

export default function CategoriesPage() {
  const { data: res, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const categories: CategoryItem[] = res?.data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createCategory({
        name: name.trim(),
        description: description.trim() || undefined,
      }).unwrap();

      setFeedback(`Category "${name}" created successfully!`);
      setName("");
      setDescription("");
      setShowModal(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert("Failed to create category. Please check backend authorization.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-amber-400" />
            <span>Categories & Taxonomy</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Live taxonomy tree from /categories ({categories.length} categories loaded)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-xs">Loading taxonomy from server...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md flex items-center justify-between"
            >
              <div>
                <h3 className="text-sm font-bold text-white">{c.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono text-[11px]">
                  slug: /{c.slug}
                </p>
                {c.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {c.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {c.isActive ? "Active" : "Hidden"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Simple Modal ────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Category</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Knitwear"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short taxonomy summary..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5"
                >
                  {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
