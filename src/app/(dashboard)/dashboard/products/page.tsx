"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  Image as ImageIcon,
  PackagePlus,
} from "lucide-react";
import {
  useGetAdminProductsQuery,
  useGetPublicProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
  useGetCategoriesQuery,
  type ProductItem,
  type ProductVariantInput,
} from "@/redux/api/dashboardApi";
import { useFormatPrice } from "@/lib/useFormatPrice";
import { getErrorMessage } from "@/lib/utils";
import ImageUploader from "@/components/ImageUploader";

function ProductsContent() {
  const searchParams = useSearchParams();
  const { format: formatCurrency } = useFormatPrice();

  const [search, setSearch] = useState("");
  const [selectedGender, setSelectedGender] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Queries & Mutations
  const { data: adminRes, isLoading: isAdminLoading } = useGetAdminProductsQuery();
  const { data: publicRes, isLoading: isPublicLoading } = useGetPublicProductsQuery();
  const { data: catRes, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form State for In-Page Creation
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [gender, setGender] = useState("MEN");
  const [season, setSeason] = useState("SS/26");
  const [fabricSpecs, setFabricSpecs] = useState("100% Super-Combed Organic Cotton, 380 GSM Heavy Interlock Weave");
  const [washCare, setWashCare] = useState("Cold machine wash inside out. Do not tumble dry.");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);

  const [variants, setVariants] = useState<ProductVariantInput[]>([
    { sku: "ZEV-TEE-BLK-S", color: "Onyx Black", colorCode: "#111111", size: "S", stock: 25 },
    { sku: "ZEV-TEE-BLK-M", color: "Onyx Black", colorCode: "#111111", size: "M", stock: 40 },
    { sku: "ZEV-TEE-BLK-L", color: "Onyx Black", colorCode: "#111111", size: "L", stock: 30 },
  ]);

  const categories = catRes?.data || [];

  // Check query param for auto-opening modal
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  // Auto-select category
  useEffect(() => {
    if (categories.length > 0 && categories[0]?.id && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Extract products list safely
  const rawAdminData = adminRes?.data;
  const rawPublicData = publicRes?.data;

  let products: ProductItem[] = [];
  if (Array.isArray(rawAdminData)) {
    products = rawAdminData;
  } else if (rawAdminData && "products" in rawAdminData) {
    products = rawAdminData.products;
  } else if (Array.isArray(rawPublicData)) {
    products = rawPublicData;
  } else if (rawPublicData && "products" in rawPublicData) {
    products = rawPublicData.products;
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesGender =
      selectedGender === "ALL" ||
      (p.gender && p.gender.toUpperCase() === selectedGender);
    return matchesSearch && matchesGender;
  });

  const handleDelete = async (id: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${productTitle}"?`)) return;
    try {
      await deleteProduct(id).unwrap();
      setActionMessage(`Product "${productTitle}" deleted successfully.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch {
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleVariantChange = (index: number, field: keyof ProductVariantInput, value: string | number) => {
    setVariants((prev) => {
      const updated = [...prev];
      const target = updated[index];
      if (!target) return prev;
      updated[index] = {
        ...target,
        [field]: field === "stock" ? parseInt(String(value) || "0", 10) : value,
      };
      return updated;
    });
  };

  const addVariant = () => {
    const defaultSku = `ZEV-VAR-${Date.now().toString().slice(-4)}`;
    setVariants([
      ...variants,
      { sku: defaultSku, color: "Vintage Olive", colorCode: "#4B5320", size: "M", stock: 20 },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      alert("A product must have at least 1 variant SKU.");
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const priceNum = parseFloat(basePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setCreateError("Please provide a valid base retail price greater than 0.");
      return;
    }

    if (!categoryId) {
      setCreateError("Please select a parent category.");
      return;
    }

    if (variants.length === 0) {
      setCreateError("Please configure at least one SKU variant.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      basePrice: priceNum,
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      categoryId,
      gender,
      season,
      fabricSpecs: fabricSpecs.trim() || undefined,
      washCare: washCare.trim() || undefined,
      isFeatured,
      isPublished: true,
      variants: variants.map((v) => ({
        ...v,
        stock: Number(v.stock) || 0,
      })),
      images: imageUrl
        ? [{ url: imageUrl.trim(), altText: title.trim(), isPrimary: true }]
        : [],
    };

    try {
      await createProduct(payload).unwrap();
      setIsCreateModalOpen(false);
      setTitle("");
      setDescription("");
      setBasePrice("");
      setDiscountPrice("");
      setActionMessage(`Product "${payload.title}" created & published successfully!`);
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: unknown) {
      setCreateError(getErrorMessage(err, "Failed to create product on backend."));
    }
  };

  const isLoading = isAdminLoading && isPublicLoading;

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
            Live products from /products/admin/all ({filteredProducts.length} items loaded)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* ── Filters & Search ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "MEN", "WOMEN", "UNISEX"].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                selectedGender === g
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* ── Products Table ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Fetching catalog from zevon-server...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Season / Gender</th>
                  <th className="py-3 px-3">Variants</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0 overflow-hidden">
                          {p.images && p.images[0]?.url ? (
                            <img
                              src={p.images[0].url}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            p.title.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{p.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-medium">
                      {p.category?.name || "Apparel"}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {formatCurrency(p.basePrice)}
                      {p.discountPrice && (
                        <span className="block text-[10px] text-emerald-400 font-normal">
                          Sale: {formatCurrency(p.discountPrice)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300">
                        {p.gender} • {p.season}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {p.variants?.length || p._count?.variants || "Multiple"} SKUs
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          disabled={isDeleting}
                          title="Delete Product"
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-slate-400 space-y-2">
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
            <p>No products found matching your search query.</p>
          </div>
        )}
      </div>

      {/* ── Add Product In-Page Modal ──────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-3xl w-full space-y-6 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-amber-400" />
                  <span>Create New Luxury Product</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Publish garment specs, variants, pricing, and live stock allocations
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-5 text-xs">
              {/* General Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Silk Cashmere Overcoat"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Category *
                  </label>
                  {isCategoriesLoading ? (
                    <div className="h-10 bg-zinc-950 rounded-xl animate-pulse flex items-center px-4 text-xs text-slate-500">
                      Loading categories...
                    </div>
                  ) : (
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Base Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2450.00"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Discount Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1950.00"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="UNISEX">Unisex</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Season
                  </label>
                  <input
                    type="text"
                    placeholder="SS/26"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block font-semibold uppercase tracking-wider text-slate-300">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Architectural boxy cut crafted with super-combed organic yarn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* MinIO Image Uploader */}
              <ImageUploader
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                label="Product Imagery (MinIO S3 Cloud)"
                folder="products"
              />

              {/* Variants */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Variant SKUs ({variants.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add SKU</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-zinc-950 border border-white/10 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
                    >
                      <input
                        type="text"
                        required
                        placeholder="SKU"
                        value={v.sku}
                        onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white font-mono"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Color Name"
                        value={v.color}
                        onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={v.colorCode}
                          onChange={(e) => handleVariantChange(index, "colorCode", e.target.value)}
                          className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          required
                          value={v.colorCode}
                          onChange={(e) => handleVariantChange(index, "colorCode", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          required
                          placeholder="M"
                          value={v.size}
                          onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                          className="w-12 px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white text-center font-bold"
                        />
                        <input
                          type="number"
                          min={0}
                          required
                          placeholder="Stock"
                          value={v.stock}
                          onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white text-center font-mono"
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs disabled:opacity-60 flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
