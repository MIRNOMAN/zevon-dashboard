"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Sparkles,
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
  Package,
  RefreshCw,
  Tag,
  MapPin,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  useGetAdminLookbooksQuery,
  useCreateLookbookMutation,
  useUpdateLookbookMutation,
  useDeleteLookbookMutation,
  useToggleLookbookStatusMutation,
} from "@/redux/api/lookbooksApi";
import { useGetAdminProductsQuery } from "@/redux/api/productsApi";
import ImageUploader from "@/components/ImageUploader";
import { useFormatPrice } from "@/lib/useFormatPrice";
import { getErrorMessage } from "@/lib/utils";
import type { LookbookItem, LookbookHotspot } from "@/types/lookbooks";
import type { ProductItem } from "@/types/products";

const PRESET_TAGS = [
  "Streetwear",
  "Casual",
  "Minimalist",
  "Winter",
  "Summer",
  "Formal",
  "Luxury",
  "Outerwear",
  "Festive",
];

export default function LookbooksPage() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const {
    data: adminRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminLookbooksQuery();

  const { data: productsRes } = useGetAdminProductsQuery({ limit: 100 });

  const [createLookbook, { isLoading: isCreating }] = useCreateLookbookMutation();
  const [updateLookbook, { isLoading: isUpdating }] = useUpdateLookbookMutation();
  const [deleteLookbook, { isLoading: isDeleting }] = useDeleteLookbookMutation();
  const [toggleLookbookStatus] = useToggleLookbookStatusMutation();

  const { format: formatCurrency } = useFormatPrice();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLookbook, setEditingLookbook] = useState<LookbookItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LookbookItem | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>(["Streetwear"]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [hotspots, setHotspots] = useState<Array<{ xPercent: number; yPercent: number; productId: string }>>([]);

  // Hotspot interactive placement state
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Extract products list for hotspot selector
  const availableProducts: ProductItem[] = useMemo(() => {
    if (!productsRes?.data) return [];
    if (Array.isArray(productsRes.data)) return productsRes.data;
    if ("products" in productsRes.data && Array.isArray(productsRes.data.products)) {
      return productsRes.data.products;
    }
    return [];
  }, [productsRes]);

  // Extract lookbooks list safely
  const lookbooks: LookbookItem[] = useMemo(() => {
    if (!adminRes?.data) return [];
    if (Array.isArray(adminRes.data)) return adminRes.data;
    if ("lookbooks" in adminRes.data && Array.isArray(adminRes.data.lookbooks)) {
      return adminRes.data.lookbooks;
    }
    return [];
  }, [adminRes]);

  // KPI Statistics
  const stats = useMemo(() => {
    const total = lookbooks.length;
    const activeCount = lookbooks.filter((l) => l.isActive).length;
    const hiddenCount = total - activeCount;
    const totalHotspots = lookbooks.reduce((acc, l) => acc + (l.hotspots?.length || 0), 0);
    return { total, activeCount, hiddenCount, totalHotspots };
  }, [lookbooks]);

  // Filtered lookbooks
  const filteredLookbooks = useMemo(() => {
    return lookbooks.filter((l) => {
      // Status filter
      if (statusFilter === "ACTIVE" && !l.isActive) return false;
      if (statusFilter === "HIDDEN" && l.isActive) return false;

      // Tag filter
      if (selectedTag !== "ALL") {
        if (!l.tags || !l.tags.includes(selectedTag)) return false;
      }

      // Search query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = l.title.toLowerCase().includes(query);
        const matchesSlug = l.slug.toLowerCase().includes(query);
        const matchesDesc = l.description ? l.description.toLowerCase().includes(query) : false;
        const matchesTags = l.tags ? l.tags.some((t) => t.toLowerCase().includes(query)) : false;
        return matchesTitle || matchesSlug || matchesDesc || matchesTags;
      }

      return true;
    });
  }, [lookbooks, statusFilter, selectedTag, search]);

  // Auto-slug generator
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!editingLookbook) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  };

  // Tag helpers
  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customTagInput.trim()) {
      e.preventDefault();
      const newTag = customTagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setCustomTagInput("");
    }
  };

  // Hotspot image click handler
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedProductId) {
      setFormError("Please select a product from the dropdown first, then click on the photo to place the hotspot pin.");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = Math.round((x / rect.width) * 1000) / 10;
    const yPercent = Math.round((y / rect.height) * 1000) / 10;

    setHotspots([
      ...hotspots,
      {
        xPercent,
        yPercent,
        productId: selectedProductId,
      },
    ]);
    setFormError(null);
  };

  const handleRemoveHotspot = (index: number) => {
    setHotspots(hotspots.filter((_, i) => i !== index));
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingLookbook(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setCoverImageUrl("");
    setTags(["Streetwear"]);
    setCustomTagInput("");
    setIsActive(true);
    setSortOrder(0);
    setHotspots([]);
    setSelectedProductId(availableProducts[0]?.id || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (lb: LookbookItem) => {
    setEditingLookbook(lb);
    setTitle(lb.title);
    setSlug(lb.slug);
    setDescription(lb.description || "");
    setCoverImageUrl(lb.coverImageUrl || lb.imageUrl || "");
    setTags(lb.tags || []);
    setCustomTagInput("");
    setIsActive(lb.isActive);
    setSortOrder(lb.sortOrder || 0);
    setHotspots(
      lb.hotspots?.map((h) => ({
        xPercent: h.xPercent,
        yPercent: h.yPercent,
        productId: h.productId || (h.product?.id as string),
      })) || [],
    );
    setSelectedProductId(availableProducts[0]?.id || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Lookbook title is required.");
      return;
    }
    if (!coverImageUrl.trim()) {
      setFormError("Editorial cover image is required.");
      return;
    }

    try {
      if (editingLookbook) {
        await updateLookbook({
          id: editingLookbook.id,
          data: {
            title: title.trim(),
            slug: slug.trim() || undefined,
            description: description.trim() || undefined,
            coverImageUrl: coverImageUrl.trim(),
            tags,
            isActive,
            sortOrder: Number(sortOrder) || 0,
            hotspots,
          },
        }).unwrap();

        showFeedback("success", `Lookbook "${title}" updated successfully!`);
      } else {
        await createLookbook({
          title: title.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          coverImageUrl: coverImageUrl.trim(),
          tags,
          isActive,
          sortOrder: Number(sortOrder) || 0,
          hotspots,
        }).unwrap();

        showFeedback("success", `Lookbook "${title}" published successfully!`);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to save lookbook."));
    }
  };

  // Delete Confirm
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteLookbook(deleteTarget.id).unwrap();
      showFeedback("success", `Lookbook "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      showFeedback("error", getErrorMessage(err, "Failed to delete lookbook."));
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (lb: LookbookItem) => {
    try {
      await toggleLookbookStatus(lb.id).unwrap();
      showFeedback("success", `Lookbook status updated.`);
    } catch (err: unknown) {
      showFeedback("error", getErrorMessage(err, "Failed to toggle status."));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>Shoppable Lookbooks & Outfits</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Interactive editorial campaigns with pinned shoppable garment overlays
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh lookbook feed"
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
            <span>New Lookbook</span>
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

      {/* ── KPI Summary Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Campaigns
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.total}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Editorial collections</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active on Store
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{stats.activeCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Public & shoppable</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Hidden Drafts
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-500/10 text-slate-400 flex items-center justify-center">
              <EyeOff className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-300 mt-2">{stats.hiddenCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Unpublished</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tagged Garments
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-300 mt-2">{stats.totalHotspots}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Interactive hotspot pins</p>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lookbooks by title, slug, or tags..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {["ALL", "Streetwear", "Casual", "Minimalist", "Winter", "Formal"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-950/60 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content View ───────────────────────────────────────── */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-900/30 border border-white/5">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs font-medium">Loading shoppable lookbooks from server...</span>
        </div>
      ) : filteredLookbooks.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-white/10 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Lookbooks Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search
                ? `No lookbooks match "${search}". Try resetting your search query.`
                : "Create interactive shoppable outfit editorials to elevate customer conversion."}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold text-xs shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Lookbook</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLookbooks.map((lb) => {
            const cover = lb.coverImageUrl || lb.imageUrl;
            const hotspotCount = lb.hotspots?.length || 0;

            return (
              <div
                key={lb.id}
                className={`group rounded-2xl bg-zinc-900/60 border ${
                  lb.isActive
                    ? "border-white/10 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5"
                    : "border-rose-500/20 opacity-75 hover:opacity-100"
                } overflow-hidden backdrop-blur-md flex flex-col justify-between transition-all`}
              >
                {/* Image Container with Hotspot Pins */}
                <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                  {cover ? (
                    <img
                      src={cover}
                      alt={lb.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Sparkles className="w-10 h-10" />
                    </div>
                  )}

                  {/* Hotspot Visual Pins overlay on card */}
                  {lb.hotspots?.map((pin, i) => (
                    <div
                      key={i}
                      style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-400/90 text-black flex items-center justify-center text-[10px] font-bold shadow-lg shadow-black/80 ring-2 ring-black cursor-pointer group/pin hover:scale-125 transition-transform"
                      title={pin.product?.title ? `Tagged: ${pin.product.title}` : `Hotspot #${i + 1}`}
                    >
                      <span>{i + 1}</span>
                    </div>
                  ))}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30 flex items-center gap-1.5 pointer-events-auto">
                      <MapPin className="w-3 h-3" />
                      <span>{hotspotCount} {hotspotCount === 1 ? "Product" : "Products"}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(lb)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1 pointer-events-auto ${
                        lb.isActive
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 backdrop-blur-md"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 backdrop-blur-md"
                      }`}
                    >
                      {lb.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{lb.isActive ? "Live" : "Draft"}</span>
                    </button>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {lb.title}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">/{lb.slug}</p>
                  </div>

                  {lb.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {lb.description}
                    </p>
                  )}

                  {/* Tags */}
                  {lb.tags && lb.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {lb.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-slate-300"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                    <span className="text-[10px] text-slate-500">
                      Sort: {lb.sortOrder || 0}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(lb)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title="Edit Lookbook & Pins"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(lb)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Lookbook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Lookbook Modal with Interactive Hotspot Studio ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-zinc-950/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center text-black font-bold shadow-md">
                  {editingLookbook ? <Edit3 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingLookbook ? "Edit Shoppable Lookbook" : "Create Shoppable Lookbook"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Upload editorial imagery and pin tagged garments for interactive &quot;Shop The Look&quot;
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
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 text-xs">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Weekend Minimalist Streetwear"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="weekend-minimalist-streetwear"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Editorial Story / Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Curated oversized streetwear looks styled with drop-shoulder tees and heavy cargo trousers..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Cover Image Upload */}
              <ImageUploader
                value={coverImageUrl}
                onChange={(url) => setCoverImageUrl(url)}
                label="Editorial High-Res Cover Imagery"
                folder="lookbooks"
              />

              {/* ── Interactive Hotspot Pinning Studio ──────────────── */}
              {coverImageUrl && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>Interactive Hotspot Pinning Studio</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        1. Select garment from dropdown → 2. Click anywhere on the image below to place a pin
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold self-start sm:self-auto">
                      {hotspots.length} {hotspots.length === 1 ? "Pin Placed" : "Pins Placed"}
                    </span>
                  </div>

                  {/* Product Selector Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-300 shrink-0">
                      Active Product:
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="">-- Choose Product To Tag --</option>
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (SKU: {p.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clickable Image Canvas */}
                  <div
                    ref={imageContainerRef}
                    onClick={handleImageClick}
                    className="relative w-full max-h-96 aspect-[16/9] sm:aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/15 cursor-crosshair group/canvas"
                    title="Click anywhere to drop a shoppable product pin"
                  >
                    <img
                      src={coverImageUrl}
                      alt="Hotspot studio canvas"
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />

                    {/* Rendered Pins */}
                    {hotspots.map((pin, index) => {
                      const matchedProd = availableProducts.find((p) => p.id === pin.productId);
                      return (
                        <div
                          key={index}
                          style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 group/pin"
                        >
                          <div className="w-6 h-6 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center shadow-xl ring-2 ring-black animate-in zoom-in duration-150">
                            {index + 1}
                          </div>
                          {matchedProd && (
                            <div className="hidden group-hover/pin:block absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-black/90 backdrop-blur-md border border-amber-400/40 text-[10px] text-white shadow-xl z-20">
                              {matchedProd.title}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Hotspots List with Remove Button */}
                  {hotspots.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Pinned Products Summary:
                      </span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                        {hotspots.map((pin, i) => {
                          const product = availableProducts.find((p) => p.id === pin.productId);
                          return (
                            <div
                              key={i}
                              className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {i + 1}
                                </span>
                                <span className="text-white font-medium truncate">
                                  {product?.title || `Product ID: ${pin.productId}`}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                  ({pin.xPercent}%, {pin.yPercent}%)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveHotspot(i)}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                                title="Remove Pin"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tags Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Categorization Tags
                </label>
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {PRESET_TAGS.map((t) => {
                    const isSelected = tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleToggleTag(t)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                            : "bg-zinc-950 border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {isSelected ? `✓ ${t}` : `+ ${t}`}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  placeholder="Type custom tag and press Enter..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Sort Order & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-white/10 cursor-pointer hover:border-amber-500/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-zinc-900 border-white/20 accent-amber-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-white block">Active Campaign</span>
                      <span className="text-[10px] text-slate-400 block">
                        Live in customer lookbook feed
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-medium"
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
                      <span>Saving Campaign...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingLookbook ? "Save Changes" : "Publish Lookbook"}</span>
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
              <h3 className="text-base font-bold text-white">Delete Lookbook Campaign?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete{" "}
                <span className="text-amber-400 font-semibold">&quot;{deleteTarget.title}&quot;</span>?
                All pinned hotspot links will be removed.
              </p>
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
