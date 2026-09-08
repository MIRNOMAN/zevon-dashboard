"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-amber-400" />
            <span>Product Catalog</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Manage your store apparel, luxury collections, stock, and SKUs
          </p>
        </div>

        <Link
          href="/dashboard/products/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* ── Filters & Search ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU, tags..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "OUTERWEAR", "TOPS", "BOTTOMS", "FOOTWEAR"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                selectedCategory === cat
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Products Table ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Inventory</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {mockProducts.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                        {p.title.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{p.title}</div>
                        <div className="text-[10px] text-slate-500">{p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{p.sku}</td>
                  <td className="py-3 px-3 font-bold text-white">${p.price.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        p.stock > 10
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : p.stock > 0
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const mockProducts = [
  { id: "1", title: "Handwoven Silk Blazer", category: "Outerwear", sku: "ZEV-BLZ-01", price: 340.0, stock: 14 },
  { id: "2", title: "Cashmere Knit Crewneck", category: "Tops", sku: "ZEV-KNT-08", price: 195.0, stock: 4 },
  { id: "3", title: "Italian Wool Pleated Trousers", category: "Bottoms", sku: "ZEV-TRS-03", price: 210.0, stock: 22 },
  { id: "4", title: "Handcrafted Leather Chelsea Boots", category: "Footwear", sku: "ZEV-BOT-11", price: 420.0, stock: 2 },
  { id: "5", title: "Double-Breasted Wool Trench", category: "Outerwear", sku: "ZEV-TRN-05", price: 580.0, stock: 8 },
];
