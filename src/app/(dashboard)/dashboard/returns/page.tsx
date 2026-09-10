"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Truck,
  DollarSign,
  Eye,
  Copy,
  Check,
  Package,
  ArrowRight,
  Sparkles,
  Inbox,
  ShieldAlert,
  Calendar,
  User,
  ShoppingBag,
  ExternalLink,
  Info,
  RefreshCw,
} from "lucide-react";
import {
  useGetReturnsQuery,
  useApproveReturnMutation,
  useRejectReturnMutation,
  useReceiveReturnMutation,
  useRefundReturnMutation,
  type ReturnRequestItem,
  type ReturnStatus,
  type ReturnResolution,
} from "@/redux/api/dashboardApi";

export default function ReturnsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedResolution, setSelectedResolution] = useState<string>("ALL");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequestItem | null>(null);
  const [activeModalAction, setActiveModalAction] = useState<
    "VIEW" | "APPROVE" | "REJECT" | "RECEIVE" | "REFUND" | null
  >(null);

  // Modal Action Form States
  const [actionTrackingNumber, setActionTrackingNumber] = useState("");
  const [actionAdminNotes, setActionAdminNotes] = useState("");
  const [actionRejectionReason, setActionRejectionReason] = useState("");
  const [actionRefundAmount, setActionRefundAmount] = useState<number | string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeProofImage, setActiveProofImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // RTK Queries & Mutations
  const { data: res, isLoading, isFetching, refetch } = useGetReturnsQuery({
    search: searchQuery || undefined,
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
    resolution: selectedResolution !== "ALL" ? selectedResolution : undefined,
  });

  const [approveReturn, { isLoading: isApproving }] = useApproveReturnMutation();
  const [rejectReturn, { isLoading: isRejecting }] = useRejectReturnMutation();
  const [receiveReturn, { isLoading: isReceiving }] = useReceiveReturnMutation();
  const [refundReturn, { isLoading: isRefunding }] = useRefundReturnMutation();

  const isActionLoading = isApproving || isRejecting || isReceiving || isRefunding;

  // Extract raw returns safely
  const rawData = res?.data;
  const returnsList: ReturnRequestItem[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (rawData && "returns" in rawData && Array.isArray(rawData.returns)) {
      return rawData.returns;
    }
    return [];
  }, [rawData]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = returnsList.length;
    const requested = returnsList.filter((r) => r.status === "REQUESTED").length;
    const approved = returnsList.filter((r) => r.status === "APPROVED").length;
    const received = returnsList.filter((r) => r.status === "RECEIVED").length;
    const refunded = returnsList.filter((r) => r.status === "REFUNDED").length;
    const rejected = returnsList.filter((r) => r.status === "REJECTED").length;

    const totalRefundValue = returnsList.reduce((acc, curr) => {
      if (curr.status === "REFUNDED") {
        return acc + Number(curr.refundAmount || curr.orderItem?.totalPrice || 0);
      }
      return acc;
    }, 0);

    return { total, requested, approved, received, refunded, rejected, totalRefundValue };
  }, [returnsList]);

  // Modal open helpers
  const openActionModal = (
    item: ReturnRequestItem,
    action: "VIEW" | "APPROVE" | "REJECT" | "RECEIVE" | "REFUND"
  ) => {
    setSelectedReturn(item);
    setActiveModalAction(action);
    setActionTrackingNumber(item.trackingNumber || "");
    setActionAdminNotes(item.adminNotes || "");
    setActionRejectionReason("");
    setActionRefundAmount(item.refundAmount || item.orderItem?.totalPrice || "");
    setActiveProofImage(item.proofImages?.[0] || null);
  };

  const closeModal = () => {
    setSelectedReturn(null);
    setActiveModalAction(null);
  };

  // Action Submissions
  const handleApproveSubmit = async () => {
    if (!selectedReturn) return;
    try {
      await approveReturn({
        id: selectedReturn.id,
        data: {
          adminNotes: actionAdminNotes.trim() || undefined,
          trackingNumber: actionTrackingNumber.trim() || undefined,
        },
      }).unwrap();
      showNotification(`Return request ${selectedReturn.returnReference} approved successfully.`);
      closeModal();
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || "Failed to approve return";
      showNotification(errorMsg, "error");
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedReturn) return;
    if (!actionRejectionReason.trim()) {
      showNotification("Please provide a reason for rejection.", "error");
      return;
    }
    try {
      await rejectReturn({
        id: selectedReturn.id,
        data: {
          reason: actionRejectionReason.trim(),
        },
      }).unwrap();
      showNotification(`Return claim ${selectedReturn.returnReference} rejected.`);
      closeModal();
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || "Failed to reject return";
      showNotification(errorMsg, "error");
    }
  };

  const handleReceiveSubmit = async () => {
    if (!selectedReturn) return;
    try {
      await receiveReturn({
        id: selectedReturn.id,
        data: {
          adminNotes: actionAdminNotes.trim() || undefined,
        },
      }).unwrap();
      showNotification(
        `Item received at warehouse. Inventory for ${selectedReturn.orderItem?.sku || "item"} automatically restocked.`
      );
      closeModal();
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || "Failed to mark item received";
      showNotification(errorMsg, "error");
    }
  };

  const handleRefundSubmit = async () => {
    if (!selectedReturn) return;
    const amount = actionRefundAmount !== "" ? Number(actionRefundAmount) : undefined;
    try {
      await refundReturn({
        id: selectedReturn.id,
        data: {
          refundAmount: amount,
          adminNotes: actionAdminNotes.trim() || undefined,
        },
      }).unwrap();
      showNotification(
        `Refund of $${amount?.toFixed(2) || "total"} finalized for ${selectedReturn.returnReference}.`
      );
      closeModal();
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || "Failed to finalize refund";
      showNotification(errorMsg, "error");
    }
  };

  // Status Badge Formatter
  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case "REQUESTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Truck className="w-3 h-3" />
            Approved / Return In Transit
          </span>
        );
      case "RECEIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Package className="w-3 h-3" />
            Item Received at Hub
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Settled / Refunded
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-300">
            {status}
          </span>
        );
    }
  };

  // Resolution Badge
  const getResolutionBadge = (resolution: ReturnResolution) => {
    if (resolution === "EXCHANGE") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
          <RefreshCw className="w-2.5 h-2.5" />
          EXCHANGE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <DollarSign className="w-2.5 h-2.5" />
        REFUND
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Reverse Logistics
            </span>
            <span className="text-xs text-zinc-500">Self-Service & RMAs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1 flex items-center gap-2.5">
            <RotateCcw className="w-7 h-7 text-amber-400" />
            <span>Returns & Refund Management</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Review customer claims, verify defect proofs, authorize reverse shipments, and restock inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-white/10 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-amber-400" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* ── Toast / Notification ─────────────────────────────────── */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* ── KPI Overview Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Pending Review */}
        <div
          onClick={() => setSelectedStatus("REQUESTED")}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all duration-200 ${
            selectedStatus === "REQUESTED"
              ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
              : "bg-zinc-900/60 border-white/10 hover:border-white/20 hover:bg-zinc-900/80"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Action Required</span>
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{kpis.requested}</div>
          <div className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1 font-medium">
            <span>Pending inspection & approval</span>
          </div>
        </div>

        {/* Approved / In Transit */}
        <div
          onClick={() => setSelectedStatus("APPROVED")}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all duration-200 ${
            selectedStatus === "APPROVED"
              ? "bg-sky-500/10 border-sky-500/50 shadow-lg shadow-sky-500/5 ring-1 ring-sky-500/30"
              : "bg-zinc-900/60 border-white/10 hover:border-white/20 hover:bg-zinc-900/80"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">In Transit</span>
            <span className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{kpis.approved}</div>
          <div className="text-[11px] text-sky-400/80 mt-1 flex items-center gap-1 font-medium">
            <span>Awaiting warehouse delivery</span>
          </div>
        </div>

        {/* Received / Restocked */}
        <div
          onClick={() => setSelectedStatus("RECEIVED")}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all duration-200 ${
            selectedStatus === "RECEIVED"
              ? "bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/30"
              : "bg-zinc-900/60 border-white/10 hover:border-white/20 hover:bg-zinc-900/80"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">At Warehouse</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{kpis.received}</div>
          <div className="text-[11px] text-indigo-400/80 mt-1 flex items-center gap-1 font-medium">
            <span>Restocked, ready for refund</span>
          </div>
        </div>

        {/* Completed Refunds */}
        <div
          onClick={() => setSelectedStatus("REFUNDED")}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all duration-200 ${
            selectedStatus === "REFUNDED"
              ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30"
              : "bg-zinc-900/60 border-white/10 hover:border-white/20 hover:bg-zinc-900/80"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Refunded / Settled</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{kpis.refunded}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1 font-medium">
            <span>${kpis.totalRefundValue.toFixed(2)} refunded</span>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/50 p-3.5 rounded-2xl border border-white/10">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search return reference (e.g. RET-...), order #, customer name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: "All Claims" },
            { id: "REQUESTED", label: "Requested" },
            { id: "APPROVED", label: "Approved" },
            { id: "RECEIVED", label: "Received" },
            { id: "REFUNDED", label: "Refunded" },
            { id: "REJECTED", label: "Declined" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedStatus === tab.id
                  ? "bg-amber-400 text-zinc-950 font-semibold shadow-md shadow-amber-400/10"
                  : "bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Resolution Dropdown */}
          <select
            value={selectedResolution}
            onChange={(e) => setSelectedResolution(e.target.value)}
            className="px-3 py-1.5 bg-zinc-800/60 border border-white/10 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-400/50 cursor-pointer"
          >
            <option value="ALL">All Resolutions</option>
            <option value="REFUND">Refund</option>
            <option value="EXCHANGE">Exchange</option>
          </select>
        </div>
      </div>

      {/* ── Returns Table / List ─────────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 overflow-hidden backdrop-blur-md">
        {isLoading ? (
          <div className="py-20 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <div className="text-sm font-medium text-white">Fetching Return Claims</div>
            <p className="text-xs text-zinc-500">Connecting to server reverse-logistics registry...</p>
          </div>
        ) : returnsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-zinc-950/40 text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Claim Reference</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Returned Item</th>
                  <th className="py-3.5 px-4">Reason & Proof</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {returnsList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Return Reference & Order */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white text-xs tracking-tight">
                          {item.returnReference}
                        </span>
                        <button
                          onClick={() => handleCopy(item.returnReference, item.id)}
                          className="text-zinc-500 hover:text-amber-400 transition-colors p-1"
                          title="Copy Return Reference"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <ShoppingBag className="w-3 h-3 text-zinc-500" />
                        <span>Order: </span>
                        <span className="font-mono text-zinc-200">
                          {item.order?.orderNumber || item.orderId?.slice(0, 8)}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-medium text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.user?.name || "Customer"}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{item.user?.email || "No email"}</div>
                      {item.user?.phone && (
                        <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">{item.user.phone}</div>
                      )}
                    </td>

                    {/* Item details */}
                    <td className="py-4 px-4 align-top max-w-xs">
                      <div className="font-semibold text-white truncate">
                        {item.orderItem?.productTitle || "Product Item"}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400">
                        {item.orderItem?.sku && (
                          <span className="font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {item.orderItem.sku}
                          </span>
                        )}
                        {item.orderItem?.size && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            Size: {item.orderItem.size}
                          </span>
                        )}
                        {item.orderItem?.color && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            Color: {item.orderItem.color}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] font-bold text-amber-400">
                        Value: ${Number(item.orderItem?.totalPrice || item.refundAmount || 0).toFixed(2)}
                      </div>
                    </td>

                    {/* Reason & Proof Photos */}
                    <td className="py-4 px-4 align-top max-w-xs">
                      <p className="text-zinc-300 text-xs line-clamp-2 italic">
                        &quot;{item.reason}&quot;
                      </p>
                      {item.proofImages && item.proofImages.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5">
                          {item.proofImages.slice(0, 3).map((imgUrl, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedReturn(item);
                                setActiveProofImage(imgUrl);
                                setActiveModalAction("VIEW");
                              }}
                              className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 hover:border-amber-400 transition-all shrink-0"
                            >
                              <Image
                                src={imgUrl}
                                alt="Proof preview"
                                fill
                                sizes="32px"
                                className="object-cover"
                                unoptimized
                              />
                            </button>
                          ))}
                          {item.proofImages.length > 3 && (
                            <span className="text-[10px] text-zinc-500 font-medium">
                              +{item.proofImages.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Type / Resolution */}
                    <td className="py-4 px-4 align-top">
                      {getResolutionBadge(item.resolution)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 align-top whitespace-nowrap">
                      {getStatusBadge(item.status)}
                      {item.trackingNumber && (
                        <div className="mt-1.5 text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                          <Truck className="w-2.5 h-2.5 text-sky-400" />
                          <span>Track: {item.trackingNumber}</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openActionModal(item, "VIEW")}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1 border border-white/5"
                          title="View Complete Claim Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Details</span>
                        </button>

                        {item.status === "REQUESTED" && (
                          <>
                            <button
                              onClick={() => openActionModal(item, "APPROVE")}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors border border-emerald-500/30"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openActionModal(item, "REJECT")}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-colors border border-rose-500/30"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {item.status === "APPROVED" && (
                          <button
                            onClick={() => openActionModal(item, "RECEIVE")}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors border border-indigo-500/30 flex items-center gap-1"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>Receive & Restock</span>
                          </button>
                        )}

                        {item.status === "RECEIVED" && (
                          <button
                            onClick={() => openActionModal(item, "REFUND")}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors border border-emerald-500/30 flex items-center gap-1"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Issue Refund</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-amber-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-white">No Return Claims Found</div>
            <p className="text-xs text-zinc-500 max-w-sm">
              {searchQuery || selectedStatus !== "ALL" || selectedResolution !== "ALL"
                ? "No return requests matched your active filters. Try clearing search or status filters."
                : "Customer return requests and warranty claims will appear here for review and reverse-logistics dispatch."}
            </p>
            {(searchQuery || selectedStatus !== "ALL" || selectedResolution !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("ALL");
                  setSelectedResolution("ALL");
                }}
                className="mt-1 px-3.5 py-1.5 rounded-xl bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 text-xs font-semibold transition-colors border border-amber-400/20"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Interactive Modal: View & Process Return ──────────────── */}
      {selectedReturn && activeModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-amber-400">
                    {selectedReturn.returnReference}
                  </span>
                  {getStatusBadge(selectedReturn.status)}
                  {getResolutionBadge(selectedReturn.resolution)}
                </div>
                <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                  <span>Return Claim Details</span>
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Indicator */}
            {selectedReturn.status !== "REJECTED" ? (
              <div className="bg-zinc-900/80 p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Return Lifecycle Progress</span>
                  <span className="text-amber-400 capitalize font-medium">{selectedReturn.status.toLowerCase()}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: "REQUESTED", label: "Claim Filed", icon: Info },
                    { key: "APPROVED", label: "Approved", icon: Truck },
                    { key: "RECEIVED", label: "Hub Received", icon: Package },
                    { key: "REFUNDED", label: "Settled", icon: CheckCircle2 },
                  ].map((step, idx) => {
                    const statusOrder = ["REQUESTED", "APPROVED", "RECEIVED", "REFUNDED"];
                    const currentIdx = statusOrder.indexOf(selectedReturn.status);
                    const isPassed = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.key}
                        className={`p-2.5 rounded-xl text-center flex flex-col items-center gap-1.5 transition-all ${
                          isPassed
                            ? "bg-amber-400/10 border border-amber-400/30 text-amber-400"
                            : "bg-zinc-950/60 border border-white/5 text-zinc-600"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? "bg-amber-400 text-zinc-950 ring-4 ring-amber-400/20"
                              : isPassed
                                ? "bg-amber-400/20 text-amber-400"
                                : "bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold leading-tight">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
                <div className="font-bold text-xs flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Return Claim Rejected</span>
                </div>
                <p className="text-xs text-rose-200/90 italic">
                  &quot;{selectedReturn.adminNotes || "Claim does not qualify under return policy guidelines."}&quot;
                </p>
              </div>
            )}

            {/* Product & Order Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Product Returned</span>
                </div>
                <div className="font-semibold text-white text-sm">
                  {selectedReturn.orderItem?.productTitle || "Product Item"}
                </div>
                <div className="text-xs text-zinc-400 space-y-1">
                  <div>
                    SKU: <span className="font-mono text-zinc-200">{selectedReturn.orderItem?.sku || "N/A"}</span>
                  </div>
                  <div>
                    Variant: <span className="text-zinc-200">{selectedReturn.orderItem?.size || "Default"} / {selectedReturn.orderItem?.color || "Standard"}</span>
                  </div>
                  <div className="font-bold text-amber-400 pt-1">
                    Value: ${Number(selectedReturn.orderItem?.totalPrice || selectedReturn.refundAmount || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Customer & Pickup</span>
                </div>
                <div className="font-semibold text-white text-sm">
                  {selectedReturn.user?.name || "Customer"}
                </div>
                <div className="text-xs text-zinc-400 space-y-1">
                  <div>Email: <span className="text-zinc-200">{selectedReturn.user?.email}</span></div>
                  <div>Phone: <span className="font-mono text-zinc-200">{selectedReturn.user?.phone || "N/A"}</span></div>
                  <div className="text-[11px] text-zinc-500 pt-1">
                    Order Ref: <span className="font-mono text-zinc-300">#{selectedReturn.order?.orderNumber || selectedReturn.orderId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reason */}
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-1.5">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Customer Reason & Statement
              </div>
              <p className="text-xs text-zinc-200 bg-zinc-950/60 p-3 rounded-xl border border-white/5">
                {selectedReturn.reason}
              </p>
            </div>

            {/* Proof Images Gallery */}
            {selectedReturn.proofImages && selectedReturn.proofImages.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Customer Inspection Proof Photos ({selectedReturn.proofImages.length})
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {selectedReturn.proofImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveProofImage(img)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        activeProofImage === img
                          ? "border-amber-400 ring-2 ring-amber-400/30"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Proof photo ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>

                {activeProofImage && (
                  <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-white/10 mt-3 bg-zinc-950">
                    <Image
                      src={activeProofImage}
                      alt="Selected Proof Enlarged"
                      fill
                      sizes="100vw"
                      className="object-contain"
                      unoptimized
                    />
                    <a
                      href={activeProofImage}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-sm hover:bg-black"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Full Image</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* ── Form Actions Based on Active Modal State ────────────── */}

            {/* APPROVE ACTION VIEW */}
            {activeModalAction === "APPROVE" && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorize Return & Issue Courier Pickup Label</span>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-300">
                    Pickup Courier Tracking Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. STE-98214-BD or REDX-7819"
                    value={actionTrackingNumber}
                    onChange={(e) => setActionTrackingNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-300">
                    Admin Instructions / Notes for Customer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Return approved. Please keep package intact for courier pickup."
                    value={actionAdminNotes}
                    onChange={(e) => setActionAdminNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalAction("VIEW")}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveSubmit}
                    disabled={isActionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    {isActionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm Approval</span>
                  </button>
                </div>
              </div>
            )}

            {/* REJECT ACTION VIEW */}
            {activeModalAction === "REJECT" && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3 animate-in fade-in">
                <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  <span>Decline Customer Return Claim</span>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-300">
                    Mandatory Rejection Reason (Will be sent to customer) *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Return policy requires claims within 14 days of delivery, or item tags appear detached."
                    value={actionRejectionReason}
                    onChange={(e) => setActionRejectionReason(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalAction("VIEW")}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectSubmit}
                    disabled={isActionLoading || !actionRejectionReason.trim()}
                    className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-lg shadow-rose-500/20"
                  >
                    {isActionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm Rejection</span>
                  </button>
                </div>
              </div>
            )}

            {/* RECEIVE ACTION VIEW */}
            {activeModalAction === "RECEIVE" && (
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3 animate-in fade-in">
                <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Mark Item Received at Warehouse & Auto-Restock</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  Confirming arrival will automatically restore stock for SKU:{" "}
                  <strong className="text-amber-400">{selectedReturn.orderItem?.sku || "Product Variant"}</strong> in the central warehouse catalog.
                </p>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-300">
                    Warehouse Quality Inspection Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Package inspected, tags intact, approved for restock."
                    value={actionAdminNotes}
                    onChange={(e) => setActionAdminNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalAction("VIEW")}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReceiveSubmit}
                    disabled={isActionLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
                  >
                    {isActionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Mark Received & Restock</span>
                  </button>
                </div>
              </div>
            )}

            {/* REFUND ACTION VIEW */}
            {activeModalAction === "REFUND" && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Finalize Customer Refund / Settle Claim</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-zinc-300">
                      Refund Amount ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={actionRefundAmount}
                      onChange={(e) => setActionRefundAmount(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-zinc-300">
                      Refund Method Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Refunded to original card / bKash"
                      value={actionAdminNotes}
                      onChange={(e) => setActionAdminNotes(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalAction("VIEW")}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRefundSubmit}
                    disabled={isActionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    {isActionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Issue ${Number(actionRefundAmount || 0).toFixed(2)} Refund</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions (When in VIEW mode) */}
            {activeModalAction === "VIEW" && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors border border-white/10"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {selectedReturn.status === "REQUESTED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveModalAction("REJECT")}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold transition-colors border border-rose-500/30"
                      >
                        Decline Claim
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModalAction("APPROVE")}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                      >
                        <span>Authorize Return</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {selectedReturn.status === "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => setActiveModalAction("RECEIVE")}
                      className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 text-xs font-bold transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Mark Received & Restock</span>
                    </button>
                  )}

                  {selectedReturn.status === "RECEIVED" && (
                    <button
                      type="button"
                      onClick={() => setActiveModalAction("REFUND")}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Issue Refund</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
