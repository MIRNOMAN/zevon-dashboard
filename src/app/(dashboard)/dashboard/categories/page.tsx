"use client";

import React, { useState } from "react";
import {
  FolderTree,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
  type CategoryItem,
} from "@/redux/api/dashboardApi";
import { getErrorMessage } from "@/lib/utils";

export default function CategoriesPage() {
  const { data: res, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [toggleCategoryStatus] = useToggleCategoryStatusMutation();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories: CategoryItem[] = res?.data || [];

  const filteredCategories = categories.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name.trim()) return;

    try {
      await createCategory({
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: parentId || undefined,
        isActive: true,
      }).unwrap();

      setFeedback(`Category "${name}" created successfully!`);
      setName("");
      setDescription("");
      setParentId("");
      setShowModal(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Failed to create category."));
    }
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete category "${categoryName}"?`)) return;
    try {
      await deleteCategory(id).unwrap();
      setFeedback(`Category "${categoryName}" deleted successfully.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert("Failed to delete category.");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleCategoryStatus(id).unwrap();
    } catch {
      alert("Failed to toggle category visibility.");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
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
          onClick={() => setIsOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ── Search Bar ─────────────────────────────────────────── */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories by name or slug..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-xs">Loading taxonomy from server...</span>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((c) => (
            <div
              key={c.id}
              className={`p-5 rounded-2xl bg-zinc-900/60 border ${
                c.isActive ? "border-white/10" : "border-rose-500/20 opacity-70"
              } backdrop-blur-md flex flex-col justify-between gap-3`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{c.name}</h3>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(c.id)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                      c.isActive
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {c.isActive ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                    <span>{c.isActive ? "Active" : "Hidden"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono text-[11px]">
                  slug: /{c.slug}
                </p>
                {c.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {c.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                <span className="text-slate-500">
                  {c.children && c.children.length > 0
                    ? `${c.children.length} subcategories`
                    : "Root Category"}
                </span>

                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.name)}
                  disabled={isDeleting}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 rounded-2xl bg-zinc-900/40 border border-white/10 text-center text-xs text-slate-400 space-y-2">
          <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
          <p>No categories found. Click &quot;New Category&quot; above to add taxonomy items.</p>
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create New Category</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Oversized Knitwear"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Parent Category (Optional - Root if empty)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">None (Top-Level Root Category)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short taxonomy summary..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold flex items-center gap-1.5"
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

  function setIsOpenModal() {
    setErrorMessage(null);
    setShowModal(true);
  }
}

