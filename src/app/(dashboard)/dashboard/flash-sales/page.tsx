"use client";

import React, { useState, useMemo } from "react";
import {
  Zap,
  Plus,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Power,
  Edit2,
  Eye,
  Search,
  Sparkles,
  ShoppingBag,
  Percent,
  X,
  Package,
} from "lucide-react";
import {
  useGetFlashSalesQuery,
  useGetFlashSaleByIdQuery,
  useCreateFlashSaleMutation,
  useUpdateFlashSaleMutation,
  useDeleteFlashSaleMutation,
  useToggleFlashSaleStatusMutation,
  useGetAdminProductsQuery,
  type FlashSaleItem,
  type CreateFlashSaleItemInput,
  type ProductItem,
} from "@/redux/api/dashboardApi";
import { getErrorMessage } from "@/lib/utils";
import { useFormatPrice } from "@/lib/useFormatPrice";
import ImageUploader from "@/components/ImageUploader";
import Image from "next/image";

export default function FlashSalesPage() {
  const { format: formatCurrency, symbol } = useFormatPrice();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "LIVE" | "UPCOMING" | "ENDED" | "INACTIVE"
  >("ALL");

  // API Queries
  const {
    data: res,
    isLoading,
    isFetching,
    refetch,
  } = useGetFlashSalesQuery(
    {
      search: searchTerm.trim() || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    },
    { refetchOnMountOrArgChange: true }
  );

  const { data: productsRes } = useGetAdminProductsQuery({ limit: 100 });

  const [createFlashSale, { isLoading: isCreating }] = useCreateFlashSaleMutation();
  const [updateFlashSale, { isLoading: isUpdating }] = useUpdateFlashSaleMutation();
  const [deleteFlashSale, { isLoading: isDeleting }] = useDeleteFlashSaleMutation();
  const [toggleFlashSaleStatus, { isLoading: isToggling }] = useToggleFlashSaleStatusMutation();

  // Modals & View States
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<FlashSaleItem | null>(null);
  const [viewingCampaignId, setViewingCampaignId] = useState<string | null>(null);

  // Single campaign query for detailed viewing
  const { data: singleCampaignRes, isLoading: isLoadingSingle } = useGetFlashSaleByIdQuery(
    viewingCampaignId || "",
    { skip: !viewingCampaignId }
  );

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [discountPercent, setDiscountPercent] = useState("50");
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [isActive, setIsActive] = useState(true);

  // Attached products in campaign
  const [selectedItems, setSelectedItems] = useState<
    {
      productId: string;
      productTitle: string;
      basePrice: number;
      discountPrice: number;
      discountPercent?: number;
      quantityLimit: number;
    }[]
  >([]);

  // Product selector helper state in modal
  const [productSearch, setProductSearch] = useState("");

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // Parse campaigns data
  const rawData = res?.data;
  let campaigns: FlashSaleItem[] = [];
  if (Array.isArray(rawData)) {
    campaigns = rawData;
  } else if (rawData && "campaigns" in rawData && Array.isArray(rawData.campaigns)) {
    campaigns = rawData.campaigns;
  }

  // Parse available store products
  const rawProducts = productsRes?.data;
  let storeProducts: ProductItem[] = [];
  if (Array.isArray(rawProducts)) {
    storeProducts = rawProducts;
  } else if (rawProducts && "products" in rawProducts && Array.isArray(rawProducts.products)) {
    storeProducts = rawProducts.products;
  }

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const openCreateModal = () => {
    setEditingCampaign(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setBannerUrl("");
    setDiscountPercent("50");

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setStartTime(now.toISOString().slice(0, 16));

    const end = new Date();
    end.setDate(end.getDate() + 2);
    end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
    setEndTime(end.toISOString().slice(0, 16));

    setIsActive(true);
    setSelectedItems([]);
    setProductSearch("");
    setShowModal(true);
  };

  const openEditModal = async (campaign: FlashSaleItem) => {
    setEditingCampaign(campaign);
    setTitle(campaign.title);
    setSlug(campaign.slug || "");
    setDescription(campaign.description || "");
    setBannerUrl(campaign.bannerUrl || "");
    setDiscountPercent(String(campaign.discountPercent ?? campaign.discountPercentage ?? 50));

    if (campaign.startTime) {
      const start = new Date(campaign.startTime);
      start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
      setStartTime(start.toISOString().slice(0, 16));
    }
    if (campaign.endTime) {
      const end = new Date(campaign.endTime);
      end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
      setEndTime(end.toISOString().slice(0, 16));
    }
    setIsActive(campaign.isActive);

    // If items already present
    if (campaign.items && campaign.items.length > 0) {
      setSelectedItems(
        campaign.items.map((item) => ({
          productId: item.productId,
          productTitle: item.product?.title || "Store Product",
          basePrice: Number(item.product?.basePrice || item.discountPrice * 1.5),
          discountPrice: Number(item.discountPrice),
          discountPercent: item.discountPercent,
          quantityLimit: item.quantityLimit,
        }))
      );
    } else {
      setSelectedItems([]);
    }

    setProductSearch("");
    setShowModal(true);
  };

  const handleAddProductToSale = (prod: ProductItem) => {
    if (selectedItems.some((i) => i.productId === prod.id)) return;
    const baseP = Number(prod.basePrice);
    const discPct = parseInt(discountPercent, 10) || 50;
    const discPrice = Math.round(baseP * (1 - discPct / 100));

    setSelectedItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productTitle: prod.title,
        basePrice: baseP,
        discountPrice: discPrice > 0 ? discPrice : baseP,
        discountPercent: discPct,
        quantityLimit: 50,
      },
    ]);
  };

  const handleRemoveProductFromSale = (productId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleItemPriceChange = (productId: string, newPrice: number) => {
    setSelectedItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? {
              ...i,
              discountPrice: newPrice,
              discountPercent:
                i.basePrice > 0 ? Math.round(((i.basePrice - newPrice) / i.basePrice) * 100) : 0,
            }
          : i
      )
    );
  };

  const handleItemQuantityChange = (productId: string, newQty: number) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantityLimit: newQty } : i))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showFeedback("error", "Campaign title is required.");
      return;
    }

    const startIso = new Date(startTime).toISOString();
    const endIso = new Date(endTime).toISOString();

    if (new Date(startIso) >= new Date(endIso)) {
      showFeedback("error", "Campaign start time must be before end time.");
      return;
    }

    const itemsPayload: CreateFlashSaleItemInput[] = selectedItems.map((item) => ({
      productId: item.productId,
      discountPrice: Number(item.discountPrice),
      discountPercent: item.discountPercent,
      quantityLimit: Number(item.quantityLimit) || 50,
      soldCount: 0,
    }));

    try {
      if (editingCampaign) {
        await updateFlashSale({
          id: editingCampaign.id,
          data: {
            title: title.trim(),
            slug: slug.trim() || undefined,
            description: description.trim() || undefined,
            bannerUrl: bannerUrl.trim() || undefined,
            discountPercent: discountPercent ? parseInt(discountPercent, 10) : undefined,
            startTime: startIso,
            endTime: endIso,
            isActive,
            items: itemsPayload,
          },
        }).unwrap();
        showFeedback("success", `Flash sale "${title}" updated successfully!`);
      } else {
        await createFlashSale({
          title: title.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          bannerUrl: bannerUrl.trim() || undefined,
          discountPercent: discountPercent ? parseInt(discountPercent, 10) : undefined,
          startTime: startIso,
          endTime: endIso,
          isActive,
          items: itemsPayload,
        }).unwrap();
        showFeedback("success", `Flash sale campaign "${title}" launched successfully!`);
      }

      setShowModal(false);
    } catch (err: any) {
      showFeedback("error", getErrorMessage(err, "Failed to save flash sale campaign."));
    }
  };

  const handleToggle = async (campaign: FlashSaleItem) => {
    try {
      setActionInProgressId(campaign.id);
      await toggleFlashSaleStatus(campaign.id).unwrap();
      showFeedback(
        "success",
        `Flash sale "${campaign.title}" is now ${!campaign.isActive ? "Active" : "Disabled"}.`
      );
    } catch (err: any) {
      showFeedback("error", getErrorMessage(err, "Failed to toggle campaign status."));
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDelete = async (campaign: FlashSaleItem) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete flash sale "${campaign.title}"?`
      )
    ) {
      return;
    }

    try {
      setActionInProgressId(campaign.id);
      await deleteFlashSale(campaign.id).unwrap();
      showFeedback("success", `Flash sale "${campaign.title}" deleted.`);
    } catch (err: any) {
      showFeedback("error", getErrorMessage(err, "Failed to delete campaign."));
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleQuickSeed = async () => {
    try {
      const now = new Date();
      const end = new Date(Date.now() + 48 * 60 * 60 * 1000);

      // Attach first 2 products if available
      const sampleItems: CreateFlashSaleItemInput[] = storeProducts.slice(0, 2).map((p) => ({
        productId: p.id,
        discountPrice: Math.round(Number(p.basePrice) * 0.5),
        discountPercent: 50,
        quantityLimit: 100,
        soldCount: 0,
      }));

      await createFlashSale({
        title: "Midnight Drop - 50% Off Everything",
        slug: `midnight-drop-${Date.now().toString().slice(-4)}`,
        description: "Exclusive limited-time seasonal luxury drop with real-time deal countdown.",
        discountPercent: 50,
        startTime: now.toISOString(),
        endTime: end.toISOString(),
        isActive: true,
        items: sampleItems,
      }).unwrap();

      showFeedback("success", "Quick Flash Sale campaign created!");
    } catch (err: any) {
      showFeedback("error", getErrorMessage(err, "Failed to create quick flash sale."));
    }
  };

  // Filtered store products for selector
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return storeProducts.slice(0, 10);
    return storeProducts
      .filter((p) => p.title.toLowerCase().includes(productSearch.toLowerCase()))
      .slice(0, 10);
  }, [storeProducts, productSearch]);

  const liveCount = useMemo(
    () =>
      campaigns.filter(
        (c) =>
          c.status === "LIVE" ||
          (c.isActive &&
            new Date(c.endTime) > new Date() &&
            new Date(c.startTime) <= new Date())
      ).length,
    [campaigns]
  );

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-400" />
            <span>Flash Sales & Timed Drops</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Configure countdown campaigns, limited volume drops, and live deal timers ({campaigns.length} campaigns, {liveCount} live)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Flash Sale</span>
        </button>
      </div>

      {/* ── Feedback Banner ───────────────────────────────────── */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ── Search & Filter Tabs ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns by title or slug..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-zinc-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-zinc-950 rounded-xl border border-white/10 text-xs">
          {(["ALL", "LIVE", "UPCOMING", "ENDED", "INACTIVE"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? "bg-amber-500 text-black font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "ALL"
                ? "All Deals"
                : tab === "LIVE"
                ? "Live Now"
                : tab === "UPCOMING"
                ? "Upcoming"
                : tab === "ENDED"
                ? "Ended"
                : "Disabled"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Flash Sales Campaign List ─────────────────────────── */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-zinc-900/40 rounded-2xl border border-white/10">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs font-medium">Fetching flash sale campaigns from backend...</span>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((sale) => {
            const now = new Date();
            const start = new Date(sale.startTime);
            const end = new Date(sale.endTime);
            const isLive = sale.isActive && now >= start && now <= end;
            const isUpcoming = sale.isActive && now < start;
            const isEnded = now > end;
            const isProcessing = actionInProgressId === sale.id;

            const claimPct = sale.overallClaimProgressPercentage ?? 0;
            const allocated = sale.totalAllocatedStock ?? 0;
            const claimed = sale.totalClaimedStock ?? 0;
            const productCount = sale.productCount ?? sale.items?.length ?? 0;
            const disc = sale.discountPercent ?? sale.discountPercentage ?? 50;

            return (
              <div
                key={sale.id}
                className={`group relative rounded-2xl border backdrop-blur-md overflow-hidden transition-all flex flex-col justify-between ${
                  isLive
                    ? "bg-zinc-900/70 border-amber-500/30 shadow-lg shadow-amber-500/5 hover:border-amber-500/60"
                    : "bg-zinc-950/60 border-white/10 opacity-85 hover:border-white/20"
                }`}
              >
                {/* Banner Thumbnail with Increased Height & Rich Overlay */}
                {sale.bannerUrl ? (
                  <div className="h-72 w-full relative overflow-hidden bg-zinc-900 border-b border-white/5">
                    <Image
                      fill
                      unoptimized
                      src={sale.bannerUrl}
                      alt={sale.title}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/25 to-transparent" />
                  </div>
                ) : null}

                <div className="p-5 space-y-3.5 flex-1">
                  {/* Status Badges & Discount */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isLive
                            ? "bg-emerald-400 animate-pulse"
                            : isUpcoming
                            ? "bg-sky-400"
                            : "bg-zinc-600"
                        }`}
                      />
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isLive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : isUpcoming
                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            : isEnded
                            ? "bg-zinc-800 text-slate-400 border border-white/5"
                            : "bg-zinc-800 text-slate-500"
                        }`}
                      >
                        {isLive ? "LIVE NOW" : isUpcoming ? "UPCOMING" : isEnded ? "ENDED" : "DISABLED"}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30 text-xs font-black font-mono">
                      {disc}% OFF
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {sale.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
                      {sale.description || "Limited-time flash drop campaign with exclusive discount allocations."}
                    </p>
                  </div>

                  {/* Stock Claim Progress Bar */}
                  {allocated > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Claimed Volume</span>
                        <span className="font-mono font-semibold text-white">
                          {claimed} / {allocated} ({claimPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, claimPct)}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {/* Products & Dates Meta */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-amber-400" />
                        <span>Allocated Products:</span>
                      </span>
                      <strong className="text-white font-mono">{productCount} items</strong>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {new Date(sale.startTime).toLocaleDateString()} {new Date(sale.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(sale.endTime).toLocaleDateString()} {new Date(sale.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-zinc-950/60 border-t border-white/5 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setViewingCampaignId(sale.id)}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Deals</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sale)}
                      title="Edit Campaign"
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-slate-300 hover:text-white transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggle(sale)}
                      disabled={isProcessing || isToggling}
                      title={sale.isActive ? "Disable Campaign" : "Enable Campaign"}
                      className={`p-1.5 rounded-lg transition-all ${
                        sale.isActive
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          : "bg-zinc-800/80 hover:bg-zinc-700 text-slate-400"
                      }`}
                    >
                      {isProcessing && isToggling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Power className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(sale)}
                      disabled={isProcessing || isDeleting}
                      title="Delete Campaign"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                    >
                      {isProcessing && isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty State ──────────────────────────────────────── */
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No flash sales currently active on backend</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Create a new flash sale campaign to schedule countdown drops with product stock limits.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Campaign</span>
            </button>
            <button
              onClick={handleQuickSeed}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center gap-1.5 border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick: 48H Midnight Flash Drop</span>
            </button>
          </div>
        </div>
      )}

      {/* ── View Campaign Details Drawer/Modal ─────────────────── */}
      {viewingCampaignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Flash Sale Campaign Overview
                </h3>
              </div>
              <button
                onClick={() => setViewingCampaignId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingSingle ? (
              <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs">Loading campaign allocations...</span>
              </div>
            ) : singleCampaignRes?.data ? (
              (() => {
                const c = singleCampaignRes.data;
                const items = c.items || [];
                return (
                  <div className="space-y-4">
                    {/* Header Details with Banner Preview */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-3">
                      {c.bannerUrl && (
                        <div className="h-44 w-full relative rounded-xl overflow-hidden bg-zinc-900 border border-white/10">
                          <Image
                            fill
                            unoptimized
                            src={c.bannerUrl}
                            alt={c.title}
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{c.title}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {c.discountPercent ?? c.discountPercentage ?? 50}% OFF
                        </span>
                      </div>
                      {c.description && <p className="text-xs text-slate-400">{c.description}</p>}
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 pt-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {new Date(c.startTime).toLocaleString()} – {new Date(c.endTime).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Allocated Products List */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-amber-400" />
                        <span>Allocated Flash Products ({items.length})</span>
                      </h4>

                      {items.length > 0 ? (
                        <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-zinc-950/60 max-h-60 overflow-y-auto">
                          {items.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="p-3 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-3">
                                {item.product?.images?.[0]?.url ? (
                                  <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shrink-0">
                                    <Image
                                      fill
                                      unoptimized
                                      src={item.product.images[0].url}
                                      alt={item.product.title || "Product"}
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
                                    <ShoppingBag className="w-4 h-4" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-white">
                                    {item.product?.title || "Product"}
                                  </p>
                                  <p className="text-[11px] text-slate-400 font-mono">
                                    Original: {item.product?.basePrice ? formatCurrency(item.product.basePrice) : "—"}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right font-mono">
                                <span className="text-emerald-400 font-bold text-xs">
                                  Deal: {formatCurrency(item.discountPrice)}
                                </span>
                                <p className="text-[11px] text-slate-400">
                                  Claimed: {item.soldCount || 0} / {item.quantityLimit} units
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-500 bg-zinc-950/40 rounded-xl border border-white/5">
                          No specific individual products allocated to this campaign yet.
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          const current = singleCampaignRes.data;
                          setViewingCampaignId(null);
                          if (current) openEditModal(current);
                        }}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Campaign</span>
                      </button>
                      <button
                        onClick={() => setViewingCampaignId(null)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : null}
          </div>
        </div>
      )}

      {/* ── Add / Edit Flash Sale Modal ───────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingCampaign ? `Edit Flash Sale (${editingCampaign.title})` : "Launch New Flash Sale"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campaign Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Midnight Flash Drop"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Campaign URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. midnight-flash-drop (optional)"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Headline Discount (%) */}
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Headline Discount (%) *
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="50"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                  <Percent className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              {/* Promotional Banner Image Uploader */}
              <div>
                <ImageUploader
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  folder="flash-sales"
                  label="Promotional Campaign Banner (Import / Upload)"
                />
              </div>

              {/* Date & Time (Start & End) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Description / Marketing Copy
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Exclusive 48-hour deal drop on oversized shirts and accessories"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Product Allocation Section */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Attach Store Products ({selectedItems.length} added)</span>
                  </label>
                </div>

                {/* Product search box */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search store inventory to add product to flash sale..."
                    className="w-full pl-8 pr-3.5 py-1.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Quick Add Suggestions */}
                {filteredProducts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-zinc-950/50 border border-white/5">
                    {filteredProducts.map((p) => {
                      const isAdded = selectedItems.some((i) => i.productId === p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleAddProductToSale(p)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
                            isAdded
                              ? "bg-zinc-800 text-slate-500 cursor-not-allowed"
                              : "bg-zinc-800/80 hover:bg-amber-500 hover:text-black text-slate-300 border border-white/5"
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span className="line-clamp-1 max-w-[140px]">{p.title}</span>
                          <span className="font-mono text-[10px] opacity-75">{formatCurrency(p.basePrice)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected Products Table */}
                {selectedItems.length > 0 ? (
                  <div className="border border-white/10 rounded-xl overflow-hidden bg-zinc-950/80 max-h-48 overflow-y-auto divide-y divide-white/5">
                    {selectedItems.map((item) => (
                      <div
                        key={item.productId}
                        className="p-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{item.productTitle}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Base: {formatCurrency(item.basePrice)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400">Deal ({symbol})</label>
                            <input
                              type="number"
                              min="1"
                              value={item.discountPrice}
                              onChange={(e) =>
                                handleItemPriceChange(item.productId, parseFloat(e.target.value) || 0)
                              }
                              className="w-20 px-2 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white font-mono text-center focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400">Stock Limit</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantityLimit}
                              onChange={(e) =>
                                handleItemQuantityChange(item.productId, parseInt(e.target.value, 10) || 1)
                              }
                              className="w-16 px-2 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white font-mono text-center focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveProductFromSale(item.productId)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors mt-3"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    Tip: Add individual products to configure exclusive flash price allocations.
                  </p>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCampaignToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-white/20 bg-zinc-950 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="isActiveCampaignToggle"
                  className="text-xs text-slate-300 font-medium cursor-pointer"
                >
                  Activate campaign immediately upon start time
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  <span>{editingCampaign ? "Save Changes" : "Launch Flash Sale"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
