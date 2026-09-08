"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PackagePlus,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    categoryId: "outerwear",
    stock: "10",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    router.push("/dashboard/products");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <PackagePlus className="w-6 h-6 text-amber-400" />
            <span>Create New Garment / Product</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Fill in the details to publish a new luxury item to the catalog
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Product Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Silk Cashmere Overcoat"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                SKU Code *
              </label>
              <input
                type="text"
                required
                placeholder="ZEV-CT-09"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="299.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Compare At Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="380.00"
                value={formData.compareAtPrice}
                onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                placeholder="10"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Description & Craftsmanship
            </label>
            <textarea
              rows={4}
              placeholder="Describe the fabric, tailoring, weave, fit, and model sizing..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl bg-zinc-950/80 border border-white/10 p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Image Upload Zone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Garment Photography
            </label>
            <div className="border-2 border-dashed border-white/10 hover:border-amber-400/40 rounded-2xl p-8 text-center bg-zinc-950/40 cursor-pointer transition-colors">
              <UploadCloud className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">Click or drag images to upload</p>
              <p className="text-[10px] text-slate-500 mt-1">PNG, JPG or WebP up to 10MB</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Link
              href="/dashboard/products"
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              Publish Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
