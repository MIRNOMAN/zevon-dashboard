"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
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
  Edit3,
  Layers,
  Sparkles,
  Package,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Folder,
  FolderOpen,
  ChevronRight,
  Link as LinkIcon,
  Hash,
  AlertTriangle,
} from "lucide-react";
import {
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
} from "@/redux/api/categoriesApi";
import type { CategoryItem } from "@/types/categories";
import ImageUploader from "@/components/ImageUploader";
import { getErrorMessage } from "@/lib/utils";

type FilterTab = "ALL" | "ROOT" | "SUB" | "ACTIVE" | "HIDDEN";
type ViewMode = "GRID" | "TREE";

export default function CategoriesPage() {
  const {
    data: adminRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminCategoriesQuery();

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [toggleCategoryStatus] = useToggleCategoryStatusMutation();

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("GRID");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    parentId: "",
    isActive: true,
    sortOrder: 0,
  });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Extract categories list safely
  const categories: CategoryItem[] = useMemo(() => {
    if (!adminRes?.data) return [];
    if (Array.isArray(adminRes.data)) return adminRes.data;
    if ("categories" in adminRes.data && Array.isArray(adminRes.data.categories)) {
      return adminRes.data.categories;
    }
    return [];
  }, [adminRes]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = categories.length;
    const rootCount = categories.filter((c) => !c.parentId).length;
    const subCount = categories.filter((c) => !!c.parentId).length;
    const activeCount = categories.filter((c) => c.isActive).length;
    const totalProductsCount = categories.reduce((sum, c) => sum + (c._count?.products || 0), 0);

    return { total, rootCount, subCount, activeCount, totalProductsCount };
  }, [categories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Tab filter
      if (activeTab === "ROOT" && cat.parentId) return false;
      if (activeTab === "SUB" && !cat.parentId) return false;
      if (activeTab === "ACTIVE" && !cat.isActive) return false;
      if (activeTab === "HIDDEN" && cat.isActive) return false;

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = cat.name.toLowerCase().includes(query);
        const matchesSlug = cat.slug.toLowerCase().includes(query);
        const matchesDesc = cat.description ? cat.description.toLowerCase().includes(query) : false;
        const matchesParent = cat.parent?.name ? cat.parent.name.toLowerCase().includes(query) : false;
        return matchesName || matchesSlug || matchesDesc || matchesParent;
      }

      return true;
    });
  }, [categories, activeTab, search]);

  // Hierarchical tree data
  const categoryTree = useMemo(() => {
    const roots = categories.filter((c) => !c.parentId);
    return roots.map((root) => {
      const children = categories.filter((c) => c.parentId === root.id);
      return {
        ...root,
        childrenList: children,
      };
    });
  }, [categories]);

  // Helper to auto-generate slug
  const handleNameChange = (newName: string) => {
    const isNewCategory = !editingCategory;
    setFormData((prev) => {
      const generatedSlug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      return {
        ...prev,
        name: newName,
        slug: isNewCategory || !prev.slug ? generatedSlug : prev.slug,
      };
    });
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      parentId: "",
      isActive: true,
      sortOrder: 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (category: CategoryItem) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
      parentId: category.parentId || "",
      isActive: category.isActive,
      sortOrder: category.sortOrder || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory({
          id: editingCategory.id,
          data: {
            name: formData.name.trim(),
            slug: formData.slug.trim() || undefined,
            description: formData.description.trim() || undefined,
            imageUrl: formData.imageUrl.trim() || undefined,
            parentId: formData.parentId ? formData.parentId : null,
            isActive: formData.isActive,
            sortOrder: Number(formData.sortOrder) || 0,
          },
        }).unwrap();

        showFeedback("success", `Category "${formData.name}" updated successfully!`);
      } else {
        // Create new category
        await createCategory({
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim() || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
          parentId: formData.parentId ? formData.parentId : null,
          isActive: formData.isActive,
          sortOrder: Number(formData.sortOrder) || 0,
        }).unwrap();

        showFeedback("success", `Category "${formData.name}" created successfully!`);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to save category. Please check your inputs."));
    }
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteCategory(deleteTarget.id).unwrap();
      showFeedback("success", `Category "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      showFeedback("error", getErrorMessage(err, "Failed to delete category."));
      setDeleteTarget(null);
    }
  };

  // Toggle Visibility Status
  const handleToggleStatus = async (category: CategoryItem) => {
    try {
      await toggleCategoryStatus(category.id).unwrap();
      showFeedback(
        "success",
        `Category "${category.name}" is now ${category.isActive ? "hidden" : "visible"}.`,
      );
    } catch (err: unknown) {
      showFeedback("error", getErrorMessage(err, "Failed to toggle status."));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <FolderTree className="w-5 h-5" />
            </div>
            <span>Categories & Taxonomy</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Manage hierarchical mega-menu taxonomy, subcategories, imagery, and product assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh category feed"
            className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-amber-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* ── Feedback Notification ──────────────────────────────── */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── KPI Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Categories
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FolderTree className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.total}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">In catalog taxonomy</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Root Categories
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Folder className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.rootCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Top-level navigation</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Sub-Categories
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.subCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Nested child nodes</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active / Visible
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.activeCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Public on store</p>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by category name, slug, or parent..."
            className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {(
            [
              { id: "ALL", label: `All (${categories.length})` },
              { id: "ROOT", label: `Root (${stats.rootCount})` },
              { id: "SUB", label: `Subcategories (${stats.subCount})` },
              { id: "ACTIVE", label: `Active (${stats.activeCount})` },
              { id: "HIDDEN", label: `Hidden (${categories.length - stats.activeCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-950/60 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center ml-2 pl-2 border-l border-white/10 gap-1">
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "GRID"
                  ? "bg-white/10 text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Grid View"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TREE")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "TREE"
                  ? "bg-white/10 text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Hierarchy Tree View"
            >
              <FolderTree className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content View ───────────────────────────────────────── */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-900/30 border border-white/5">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs font-medium">Fetching live category taxonomy...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-white/10 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No categories found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search
                ? `No categories match "${search}". Try adjusting your search query or filters.`
                : "Get started by creating your first root or subcategory taxonomy."}
            </p>
          </div>
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white hover:bg-white/10"
            >
              Clear Search
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold text-xs shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          )}
        </div>
      ) : viewMode === "TREE" && activeTab === "ALL" && !search ? (
        /* ── Hierarchy Tree View ───────────────────────────────── */
        <div className="space-y-4">
          {categoryTree.map((root) => (
            <div
              key={root.id}
              className="rounded-2xl bg-zinc-900/60 border border-white/10 overflow-hidden backdrop-blur-md"
            >
              {/* Root Row */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/80 border-b border-white/5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                    {root.imageUrl ? (
                      <Image
                        src={root.imageUrl}
                        alt={root.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <FolderOpen className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{root.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase">
                        Root
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono text-[11px] text-slate-400">/{root.slug}</span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-300">
                        {root._count?.products || 0} products
                      </span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-300">
                        {root.childrenList.length} subcategories
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(root)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                      root.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                    }`}
                  >
                    {root.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{root.isActive ? "Active" : "Hidden"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(root)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
                    title="Edit Category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(root)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories List */}
              {root.childrenList.length > 0 ? (
                <div className="p-3 sm:p-4 divide-y divide-white/5 space-y-1">
                  {root.childrenList.map((sub) => (
                    <div
                      key={sub.id}
                      className="py-2.5 px-3 rounded-xl hover:bg-white/[0.02] flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 pl-4 border-l-2 border-amber-500/40">
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                          {sub.imageUrl ? (
                            <Image
                              src={sub.imageUrl}
                              alt={sub.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <Layers className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{sub.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">/{sub.slug}</span>
                          </div>
                          {sub.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {sub.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(sub)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            sub.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {sub.isActive ? "Active" : "Hidden"}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(sub)}
                          className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-white/5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(sub)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 italic">
                  No subcategories assigned. Click edit or &quot;New Category&quot; to add children.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ── Grid View ─────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredCategories.map((cat) => {
            const isRoot = !cat.parentId;
            const productCount = cat._count?.products || 0;
            const childCount = cat._count?.children || (cat.children ? cat.children.length : 0);

            return (
              <div
                key={cat.id}
                className={`group rounded-2xl bg-zinc-900/60 border ${
                  cat.isActive
                    ? "border-white/10 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5"
                    : "border-rose-500/20 opacity-75 hover:opacity-100"
                } p-5 backdrop-blur-md flex flex-col justify-between gap-4 transition-all`}
              >
                {/* Top Row: Icon/Image + Name + Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform relative">
                        {cat.imageUrl ? (
                          <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <Folder className={`w-6 h-6 ${isRoot ? "text-amber-400" : "text-slate-400"}`} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-white truncate">{cat.name}</h3>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isRoot
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            }`}
                          >
                            {isRoot ? "Root" : "Sub"}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                          slug: /{cat.slug}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(cat)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 shrink-0 ${
                        cat.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                      }`}
                      title="Click to toggle visibility"
                    >
                      {cat.isActive ? (
                        <Eye className="w-2.5 h-2.5" />
                      ) : (
                        <EyeOff className="w-2.5 h-2.5" />
                      )}
                      <span>{cat.isActive ? "Active" : "Hidden"}</span>
                    </button>
                  </div>

                  {/* Parent Badge if Sub */}
                  {cat.parent && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] text-slate-300">
                      <ChevronRight className="w-3 h-3 text-amber-400" />
                      <span className="text-slate-400">Parent:</span>
                      <span className="font-semibold text-white">{cat.parent.name}</span>
                    </div>
                  )}

                  {/* Description */}
                  {cat.description ? (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No description provided</p>
                  )}
                </div>

                {/* Footer Meta & Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-slate-500" />
                      <span>{productCount} items</span>
                    </span>
                    {isRoot && (
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <span>{childCount} subs</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      title="Edit Category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Category Modal ──────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-zinc-950/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black font-bold shadow-md">
                  {editingCategory ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingCategory ? "Edit Category Details" : "Create New Category"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingCategory
                      ? `Updating taxonomy for "${editingCategory.name}"`
                      : "Define a root department or nested subcategory"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Alert */}
            {formError && (
              <div className="mx-6 mt-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Outerwear & Coats"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    URL Slug
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">
                      /
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="outerwear-coats"
                      className="w-full pl-6 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Parent Category (Hierarchy Level)
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="">None — Top-Level Root Category</option>
                  {categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.parentId ? `↳ ${cat.name} (Subcategory)` : `📂 ${cat.name} (Root)`}
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Root categories appear in the main navigation; child categories nest in mega-menus.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of products, fabrics, styles, or SEO meta description..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Category Image */}
              <ImageUploader
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                label="Category Cover Imagery"
                folder="categories"
              />

              {/* Sort Order & Visibility Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Lower number displays first (e.g. 0, 1, 2)</p>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-white/10 cursor-pointer hover:border-amber-500/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-zinc-900 border-white/20 accent-amber-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-white block">Active on Store</span>
                      <span className="text-[10px] text-slate-400 block">
                        Visible to customers in storefront
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Category...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Category?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete{" "}
                <span className="text-amber-400 font-semibold">&quot;{deleteTarget.name}&quot;</span>?
              </p>
              {(deleteTarget._count?.products ?? 0) > 0 && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] text-left flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    Warning: This category currently has{" "}
                    <strong>{deleteTarget._count?.products} products</strong> linked. Deleting it may
                    uncategorize these products.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
