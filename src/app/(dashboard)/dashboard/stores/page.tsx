"use client";

import React, { useState, useMemo } from "react";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Eye,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  Compass,
  Navigation,
} from "lucide-react";
import {
  useGetStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} from "@/redux/api/storesApi";
import type { StoreItem } from "@/types/stores";
import { getErrorMessage } from "@/lib/utils";

export default function StoresPage() {
  const { data: res, isLoading, isFetching, refetch } = useGetStoresQuery();
  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");

  // Feedback Banner State
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);
  const [viewingStore, setViewingStore] = useState<StoreItem | null>(null);

  // Form State
  const initialFormState = {
    name: "",
    address: "",
    city: "Dhaka",
    phone: "",
    email: "",
    openingHours: "Mon – Sun: 10:00 AM – 10:00 PM BST",
    latitude: 23.7937,
    longitude: 90.4043,
    googleMapsUrl: "",
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  // Extract stores list safely
  const rawData = res?.data;
  let stores: StoreItem[] = [];
  if (Array.isArray(rawData)) {
    stores = rawData;
  } else if (rawData && "stores" in rawData) {
    stores = (rawData as { stores: StoreItem[] }).stores;
  }

  // Get unique cities for filter dropdown
  const cities = useMemo(() => {
    const set = new Set<string>();
    stores.forEach((s) => {
      if (s.city) set.add(s.city);
    });
    return Array.from(set);
  }, [stores]);

  // Filtered stores
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.phone && s.phone.includes(searchTerm));
      const matchesCity = cityFilter === "ALL" || s.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [stores, searchTerm, cityFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingStore(null);
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (store: StoreItem) => {
    setEditingStore(store);
    setFormData({
      name: store.name || "",
      address: store.address || "",
      city: store.city || "Dhaka",
      phone: store.phone || "",
      email: store.email || "",
      openingHours: store.openingHours || "Mon – Sun: 10:00 AM – 10:00 PM BST",
      latitude: store.latitude || 23.7937,
      longitude: store.longitude || 90.4043,
      googleMapsUrl: store.googleMapsUrl || "",
      isActive: store.isActive ?? true,
    });
    setIsFormModalOpen(true);
  };

  // Open View Details Modal
  const handleOpenView = (store: StoreItem) => {
    setViewingStore(store);
  };

  // Submit Form (Create or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim()) {
      showToast("error", "Store Name, Address, and City are required.");
      return;
    }

    try {
      if (editingStore) {
        await updateStore({
          id: editingStore.id,
          data: formData,
        }).unwrap();
        showToast("success", `Store "${formData.name}" updated successfully!`);
      } else {
        await createStore(formData).unwrap();
        showToast("success", `New store "${formData.name}" created successfully!`);
      }
      setIsFormModalOpen(false);
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to save store location"));
    }
  };

  // Delete Store
  const handleDeleteStore = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await deleteStore(id).unwrap();
      showToast("success", `Store "${name}" deleted successfully.`);
      if (viewingStore?.id === id) {
        setViewingStore(null);
      }
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to delete store"));
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (store: StoreItem) => {
    try {
      await updateStore({
        id: store.id,
        data: { isActive: !store.isActive },
      }).unwrap();
      showToast(
        "success",
        `Store "${store.name}" is now ${!store.isActive ? "Active" : "Inactive"}.`
      );
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to update store status"));
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Store className="w-6 h-6 text-amber-400" />
            <span>Physical Flagship Stores</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Manage flagship retail branches, in-store pickup reservations, and boutique hours
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-slate-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Refresh Stores"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-amber-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Flagship Branch</span>
          </button>
        </div>
      </div>

      {/* ── Feedback Notification ─────────────────────────────── */}
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

      {/* ── Search & City Filter Bar ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stores by branch name, address, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-zinc-900 text-white">
                All Cities ({stores.length})
              </option>
              {cities.map((city) => (
                <option key={city} value={city} className="bg-zinc-900 text-white">
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Stores Grid ───────────────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Loading store branches from database...</span>
          </div>
        ) : filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStores.map((s) => (
              <div
                key={s.id}
                className="group relative p-5 rounded-2xl bg-zinc-950/70 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  {/* Title & City Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                        {s.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          s.city.toLowerCase() === "dhaka"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                        }`}
                      >
                        {s.city}
                      </span>
                      {!s.isActive && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">{s.address}</p>

                  {/* Phone & Email */}
                  <div className="pl-6 space-y-1">
                    {s.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{s.phone}</span>
                      </div>
                    )}
                    {s.email && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{s.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Opening Hours */}
                  {s.openingHours && (
                    <p className="text-[11px] text-emerald-400 font-semibold pt-2 border-t border-white/5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Hours: {s.openingHours}</span>
                    </p>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(s)}
                    className={`text-[11px] font-semibold transition cursor-pointer ${
                      s.isActive
                        ? "text-emerald-400 hover:text-emerald-300"
                        : "text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    ● {s.isActive ? "Store Active" : "Store Inactive"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenView(s)}
                      title="View Details"
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white transition cursor-pointer border border-white/5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(s)}
                      title="Edit Store"
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 transition cursor-pointer border border-white/5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStore(s.id, s.name)}
                      title="Delete Store"
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition cursor-pointer border border-white/5"
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
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
            <p>No store locations match your search or filter.</p>
          </div>
        )}
      </div>

      {/* ── Create / Edit Store Modal ──────────────────────────── */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <span>{editingStore ? "Edit Flagship Branch" : "Add Flagship Retail Branch"}</span>
              </h2>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Branch Name * <span className="text-slate-500 font-normal">(e.g. ZEVON Atelier — Banani)</span>
                </label>
                <input
                  type="text"
                  placeholder="ZEVON Atelier — Banani"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">City / Division *</label>
                  <input
                    type="text"
                    placeholder="Dhaka, Chattogram, Sylhet..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Hotline / Phone</label>
                  <input
                    type="text"
                    placeholder="+880 1700-000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Physical Address *</label>
                <textarea
                  rows={2}
                  placeholder="House 42, Road 11, Block D, Banani"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Concierge Email</label>
                  <input
                    type="email"
                    placeholder="banani@zevon.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Opening Hours</label>
                  <input
                    type="text"
                    placeholder="Mon – Sun: 10:00 AM – 10:00 PM BST"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Google Maps URL</label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveStore"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 focus:outline-none"
                />
                <label htmlFor="isActiveStore" className="text-xs font-medium text-slate-300 cursor-pointer">
                  Branch is active and open for customer visits & in-store pickups
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  {isCreating || isUpdating
                    ? "Saving..."
                    : editingStore
                    ? "Update Branch"
                    : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Store Details Modal ──────────────────────────── */}
      {viewingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  {viewingStore.city} Flagship Branch
                </span>
                <h2 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-400" />
                  <span>{viewingStore.name}</span>
                </h2>
              </div>
              <button
                onClick={() => setViewingStore(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Address
                </div>
                <p className="text-white font-medium">{viewingStore.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Hotline
                  </div>
                  <p className="text-white font-medium">{viewingStore.phone || "N/A"}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Concierge Email
                  </div>
                  <p className="text-white font-medium truncate">{viewingStore.email || "N/A"}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Operating Hours
                </div>
                <p className="text-emerald-400 font-semibold">{viewingStore.openingHours || "N/A"}</p>
              </div>

              {viewingStore.googleMapsUrl && (
                <a
                  href={viewingStore.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition"
                >
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    <span className="font-semibold">Open in Google Maps Navigation</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const toEdit = viewingStore;
                  setViewingStore(null);
                  handleOpenEdit(toEdit);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Branch</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingStore(null)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
