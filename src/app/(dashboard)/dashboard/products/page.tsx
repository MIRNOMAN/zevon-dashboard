"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  Image as ImageIcon,
  PackagePlus,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useGetAdminProductsQuery,
  useGetPublicProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/redux/api/productsApi";
import { useGetCategoriesQuery } from "@/redux/api/categoriesApi";
import type { ProductItem, ProductVariantInput } from "@/types/products";
import { useFormatPrice } from "@/lib/useFormatPrice";
import { getErrorMessage } from "@/lib/utils";
import MultiImageUploader, { type GalleryImage } from "@/components/MultiImageUploader";

function ProductsContent() {
  const searchParams = useSearchParams();
  const { format: formatCurrency } = useFormatPrice();

  const [search, setSearch] = useState("");
  const [selectedGender, setSelectedGender] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Modals state
  const [viewingProduct, setViewingProduct] = useState<ProductItem | null>(null);
  const [viewingImageIndex, setViewingImageIndex] = useState(0);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  // Queries & Mutations
  const { data: adminRes, isLoading: isAdminLoading, refetch: refetchAdmin } = useGetAdminProductsQuery();
  const { data: publicRes, isLoading: isPublicLoading } = useGetPublicProductsQuery();
  const { data: catRes, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

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
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isFeatured, setIsFeatured] = useState(true);
  const [variants, setVariants] = useState<ProductVariantInput[]>([
    { sku: "ZEV-TEE-BLK-S", color: "Onyx Black", colorCode: "#111111", size: "S", stock: 25 },
    { sku: "ZEV-TEE-BLK-M", color: "Onyx Black", colorCode: "#111111", size: "M", stock: 40 },
    { sku: "ZEV-TEE-BLK-L", color: "Onyx Black", colorCode: "#111111", size: "L", stock: 30 },
  ]);

  // Form State for Editing
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editBasePrice, setEditBasePrice] = useState("");
  const [editDiscountPrice, setEditDiscountPrice] = useState("");
  const [editGender, setEditGender] = useState("MEN");
  const [editSeason, setEditSeason] = useState("SS/26");
  const [editFabricSpecs, setEditFabricSpecs] = useState("");
  const [editWashCare, setEditWashCare] = useState("");
  const [editImages, setEditImages] = useState<GalleryImage[]>([]);
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editVariants, setEditVariants] = useState<ProductVariantInput[]>([]);

  const categories = catRes?.data || [];

  // Check query param for auto-opening modal
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  // Auto-select category for create
  useEffect(() => {
    if (categories.length > 0 && categories[0]?.id && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Handle open view modal
  const openViewModal = (product: ProductItem) => {
    setViewingProduct(product);
    setViewingImageIndex(0);
  };

  // Populate edit form when a product is chosen for editing
  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setEditError(null);
    setEditTitle(product.title || "");
    setEditDescription(product.description || "");
    setEditCategoryId(product.categoryId || product.category?.id || (categories[0]?.id ?? ""));
    setEditBasePrice(String(product.basePrice || ""));
    setEditDiscountPrice(product.discountPrice ? String(product.discountPrice) : "");
    setEditGender(product.gender || "MEN");
    setEditSeason(product.season || "SS/26");
    setEditFabricSpecs(product.fabricSpecs || "");
    setEditWashCare(product.washCare || "");
    setEditIsFeatured(!!product.isFeatured);

    // Populate existing images
    if (product.images && product.images.length > 0) {
      setEditImages(
        product.images.map((img, idx) => ({
          id: img.id,
          url: img.url,
          altText: img.altText || `${product.title} - View ${idx + 1}`,
          isPrimary: !!img.isPrimary,
          sortOrder: idx,
        }))
      );
    } else {
      setEditImages([]);
    }

    if (product.variants && product.variants.length > 0) {
      setEditVariants(
        product.variants.map((v) => ({
          sku: v.sku,
          color: v.color,
          colorCode: v.colorCode || "#111111",
          size: v.size,
          stock: v.stock,
        }))
      );
    } else {
      setEditVariants([
        {
          sku: `ZEV-${product.slug?.toUpperCase().slice(0, 8) || "ITEM"}-01`,
          color: "Standard",
          colorCode: "#000000",
          size: "M",
          stock: 10,
        },
      ]);
    }
  };

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

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct(deletingProduct.id).unwrap();
      setActionMessage(`Product "${deletingProduct.title}" has been deleted.`);
      setDeletingProduct(null);
      if (viewingProduct?.id === deletingProduct.id) {
        setViewingProduct(null);
      }
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to delete product. Please try again."));
    }
  };

  // Variant helpers for create
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

  // Variant helpers for edit
  const handleEditVariantChange = (index: number, field: keyof ProductVariantInput, value: string | number) => {
    setEditVariants((prev) => {
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

  const addEditVariant = () => {
    const defaultSku = `ZEV-SKU-${Date.now().toString().slice(-4)}`;
    setEditVariants([
      ...editVariants,
      { sku: defaultSku, color: "Noir Black", colorCode: "#111111", size: "M", stock: 15 },
    ]);
  };

  const removeEditVariant = (index: number) => {
    if (editVariants.length <= 1) {
      alert("A product must have at least 1 variant SKU.");
      return;
    }
    setEditVariants(editVariants.filter((_, i) => i !== index));
  };

  // Handle Create Submit
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

    // Ensure at least one image is primary if images exist
    const finalImages = images.map((img, idx) => ({
      url: img.url.trim(),
      altText: img.altText?.trim() || `${title.trim()} - View ${idx + 1}`,
      isPrimary: images.some((i) => i.isPrimary) ? !!img.isPrimary : idx === 0,
      sortOrder: idx,
    }));

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
      images: finalImages,
    };

    try {
      await createProduct(payload).unwrap();
      setIsCreateModalOpen(false);
      setTitle("");
      setDescription("");
      setBasePrice("");
      setDiscountPrice("");
      setImages([]);
      setActionMessage(`Product "${payload.title}" created & published successfully!`);
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: unknown) {
      setCreateError(getErrorMessage(err, "Failed to create product on backend."));
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditError(null);

    const priceNum = parseFloat(editBasePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setEditError("Please provide a valid base retail price greater than 0.");
      return;
    }

    if (!editCategoryId) {
      setEditError("Please select a parent category.");
      return;
    }

    if (editVariants.length === 0) {
      setEditError("Please configure at least one SKU variant.");
      return;
    }

    // Ensure at least one image is primary if images exist
    const finalImages = editImages.map((img, idx) => ({
      url: img.url.trim(),
      altText: img.altText?.trim() || `${editTitle.trim()} - View ${idx + 1}`,
      isPrimary: editImages.some((i) => i.isPrimary) ? !!img.isPrimary : idx === 0,
      sortOrder: idx,
    }));

    const payload = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      basePrice: priceNum,
      discountPrice: editDiscountPrice ? parseFloat(editDiscountPrice) : undefined,
      categoryId: editCategoryId,
      gender: editGender,
      season: editSeason,
      fabricSpecs: editFabricSpecs.trim() || undefined,
      washCare: editWashCare.trim() || undefined,
      isFeatured: editIsFeatured,
      isPublished: true,
      variants: editVariants.map((v) => ({
        ...v,
        stock: Number(v.stock) || 0,
      })),
      images: finalImages,
    };

    try {
      const updatedRes = await updateProduct({ id: editingProduct.id, data: payload }).unwrap();
      setEditingProduct(null);
      if (viewingProduct?.id === editingProduct.id) {
        if (updatedRes?.data) {
          setViewingProduct(updatedRes.data);
        } else {
          setViewingProduct(null);
        }
      }
      setActionMessage(`Product "${payload.title}" updated successfully!`);
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: unknown) {
      setEditError(getErrorMessage(err, "Failed to update product on backend."));
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
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
                {filteredProducts.map((p) => {
                  const primaryImg = p.images?.find((img) => img.isPrimary) || p.images?.[0];
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => openViewModal(p)}
                            className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0 overflow-hidden cursor-pointer hover:border-amber-400 transition-colors relative group"
                          >
                            {primaryImg?.url ? (
                              <Image
                                src={primaryImg.url}
                                alt={p.title}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              p.title.charAt(0)
                            )}
                            {p.images && p.images.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] font-bold text-amber-400 px-1 rounded-tl">
                                +{p.images.length}
                              </span>
                            )}
                          </div>
                          <div>
                            <div
                              onClick={() => openViewModal(p)}
                              className="font-semibold text-white hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{p.title}</span>
                              {p.images && p.images.length > 1 && (
                                <span className="text-[10px] text-slate-500 font-normal">
                                  ({p.images.length} imgs)
                                </span>
                              )}
                            </div>
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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Product Details */}
                          <button
                            type="button"
                            onClick={() => openViewModal(p)}
                            title="View Product Details"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Product */}
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 border border-white/5 hover:border-sky-500/30 transition-all cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Product */}
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(p)}
                            title="Delete Product"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* ── View Product Modal ─────────────────────────────────── */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-4xl w-full space-y-6 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {viewingProduct.title}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {viewingProduct.id} • Slug: {viewingProduct.slug}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product Imagery & Multi-Image Gallery Carousel */}
              <div className="space-y-3">
                <div className="aspect-[3/4] rounded-xl bg-zinc-950 border border-white/10 overflow-hidden flex items-center justify-center relative group">
                  {viewingProduct.images && viewingProduct.images.length > 0 && viewingProduct.images[viewingImageIndex]?.url ? (
                    <>
                      <Image
                        src={viewingProduct.images[viewingImageIndex].url}
                        alt={viewingProduct.title}
                        fill
                        unoptimized
                        className="object-cover transition-all"
                      />

                      {/* Navigation arrows for images */}
                      {viewingProduct.images.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setViewingImageIndex((prev) =>
                                prev === 0 ? (viewingProduct.images?.length || 1) - 1 : prev - 1
                              )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-amber-500 hover:text-black transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setViewingImageIndex((prev) =>
                                prev === (viewingProduct.images?.length || 1) - 1 ? 0 : prev + 1
                              )
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-amber-500 hover:text-black transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/70 text-[10px] text-white font-mono">
                            {viewingImageIndex + 1} / {viewingProduct.images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-4 text-slate-600">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-xs">No media uploaded</span>
                    </div>
                  )}
                </div>

                {/* Thumbnails strip */}
                {viewingProduct.images && viewingProduct.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {viewingProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setViewingImageIndex(idx)}
                        className={`w-12 h-14 rounded-lg border overflow-hidden shrink-0 transition-all cursor-pointer relative ${
                          viewingImageIndex === idx
                            ? "border-amber-400 ring-2 ring-amber-400/40"
                            : "border-white/10 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image src={img.url} alt="" fill unoptimized className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
                    {viewingProduct.gender}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
                    {viewingProduct.season}
                  </span>
                  {viewingProduct.isFeatured && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Product Specifications & Details */}
              <div className="md:col-span-2 space-y-4 text-xs">
                {/* Pricing & Category Row */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-950 border border-white/5">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Category</span>
                    <span className="font-semibold text-white text-sm">
                      {viewingProduct.category?.name || "Unassigned Category"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Pricing</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-white text-sm">
                        {formatCurrency(viewingProduct.basePrice)}
                      </span>
                      {viewingProduct.discountPrice && (
                        <span className="text-emerald-400 font-semibold text-xs">
                          Sale: {formatCurrency(viewingProduct.discountPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-slate-300 mb-1">Description</h4>
                  <p className="text-slate-400 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-white/5">
                    {viewingProduct.description || "No description provided."}
                  </p>
                </div>

                {/* Fabric & Wash Care */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Fabric Specs</span>
                    <p className="text-slate-300">
                      {viewingProduct.fabricSpecs || "100% Organic Luxury Blend"}
                    </p>
                  </div>
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Wash & Care</span>
                    <p className="text-slate-300">
                      {viewingProduct.washCare || "Cold gentle machine wash."}
                    </p>
                  </div>
                </div>

                {/* Variants List */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Stock Variants & Inventory ({viewingProduct.variants?.length || 0})</span>
                    </h4>
                  </div>

                  {viewingProduct.variants && viewingProduct.variants.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {viewingProduct.variants.map((v) => (
                        <div
                          key={v.id || v.sku}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-white/5 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: v.colorCode || "#111" }}
                              title={v.color}
                            />
                            <div>
                              <span className="font-mono text-slate-300 font-semibold">{v.sku}</span>
                              <span className="text-slate-500 ml-2">({v.color})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 font-bold">
                              Size {v.size}
                            </span>
                            <span
                              className={`font-semibold font-mono ${
                                v.stock > 10 ? "text-emerald-400" : v.stock > 0 ? "text-amber-400" : "text-rose-400"
                              }`}
                            >
                              {v.stock} in stock
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No variants assigned to this product.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const toEdit = viewingProduct;
                  setViewingProduct(null);
                  openEditModal(toEdit);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Product In-Page Modal ──────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-3xl w-full space-y-6 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-amber-400" />
                  <span>Edit Luxury Product</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Update garment information, pricing, live inventory SKUs, and images
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-5 text-xs">
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
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
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
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
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
                    value={editBasePrice}
                    onChange={(e) => setEditBasePrice(e.target.value)}
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
                    value={editDiscountPrice}
                    onChange={(e) => setEditDiscountPrice(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Gender
                  </label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
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
                    value={editSeason}
                    onChange={(e) => setEditSeason(e.target.value)}
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
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Fabric Specs & Wash Care */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Fabric Specifications
                  </label>
                  <input
                    type="text"
                    placeholder="100% Super-Combed Organic Cotton, 380 GSM"
                    value={editFabricSpecs}
                    onChange={(e) => setEditFabricSpecs(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Wash & Care Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="Cold machine wash inside out. Do not tumble dry."
                    value={editWashCare}
                    onChange={(e) => setEditWashCare(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Multi-Image MinIO Uploader */}
              <MultiImageUploader
                images={editImages}
                onChange={(imgs) => setEditImages(imgs)}
                label="Product Imagery & Gallery (Multiple MinIO Uploads)"
                folder="products"
              />

              {/* Variants */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Variant SKUs ({editVariants.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={addEditVariant}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add SKU</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {editVariants.map((v, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-zinc-950 border border-white/10 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
                    >
                      <input
                        type="text"
                        required
                        placeholder="SKU"
                        value={v.sku}
                        onChange={(e) => handleEditVariantChange(index, "sku", e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white font-mono"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Color Name"
                        value={v.color}
                        onChange={(e) => handleEditVariantChange(index, "color", e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={v.colorCode || "#111111"}
                          onChange={(e) => handleEditVariantChange(index, "colorCode", e.target.value)}
                          className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          required
                          value={v.colorCode || "#111111"}
                          onChange={(e) => handleEditVariantChange(index, "colorCode", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          required
                          placeholder="M"
                          value={v.size}
                          onChange={(e) => handleEditVariantChange(index, "size", e.target.value)}
                          className="w-12 px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white text-center font-bold"
                        />
                        <input
                          type="number"
                          min={0}
                          required
                          placeholder="Stock"
                          value={v.stock}
                          onChange={(e) => handleEditVariantChange(index, "stock", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white text-center font-mono"
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => removeEditVariant(index)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
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
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs disabled:opacity-60 flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Custom Delete Confirmation Modal ────────────────────── */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Delete Product?</h3>
                <p className="text-xs text-slate-400">
                  Are you sure you want to permanently remove this product from the luxury catalog? All inventory variants and media links will be erased.
                </p>
              </div>
            </div>

            {/* Product Summary Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0 overflow-hidden relative">
                {deletingProduct.images && deletingProduct.images[0]?.url ? (
                  <Image
                    src={deletingProduct.images[0].url}
                    alt={deletingProduct.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  deletingProduct.title.charAt(0)
                )}
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-white text-xs truncate">{deletingProduct.title}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">{deletingProduct.slug}</div>
                <div className="text-[11px] font-bold text-amber-400 mt-0.5">
                  {formatCurrency(deletingProduct.basePrice)}
                </div>
              </div>
            </div>

            {/* Confirmation Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
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

              {/* Fabric Specs & Wash Care */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Fabric Specifications
                  </label>
                  <input
                    type="text"
                    placeholder="100% Super-Combed Organic Cotton, 380 GSM"
                    value={fabricSpecs}
                    onChange={(e) => setFabricSpecs(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-300">
                    Wash & Care Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="Cold machine wash inside out. Do not tumble dry."
                    value={washCare}
                    onChange={(e) => setWashCare(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Multi-Image MinIO Uploader */}
              <MultiImageUploader
                images={images}
                onChange={(imgs) => setImages(imgs)}
                label="Product Imagery & Gallery (Multiple MinIO Uploads)"
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold cursor-pointer"
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
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs disabled:opacity-60 flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
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
