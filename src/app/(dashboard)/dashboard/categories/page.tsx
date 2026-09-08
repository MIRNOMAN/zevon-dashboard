"use client";

import React from "react";
import { FolderTree, Plus, Edit, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-amber-400" />
            <span>Categories & Taxonomy</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Organize garments by collections, gender, season, and departments
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit">
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.name} className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">{c.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{c.items} Products Active</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white">
                <Edit className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const categories = [
  { name: "Outerwear & Coats", items: 24 },
  { name: "Silk & Cashmere Tops", items: 42 },
  { name: "Tailored Trousers", items: 18 },
  { name: "Footwear & Boots", items: 15 },
  { name: "Accessories & Belts", items: 31 },
  { name: "Summer Lookbook 2026", items: 12 },
];
