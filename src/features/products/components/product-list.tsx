import { getProducts } from "../services/product.service";
import { ProductCard } from "./product-card";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Server Component that fetches and renders the product list.
 *
 * Usage:
 * ```tsx
 * import { ProductList } from "@/features/products";
 *
 * export default function ProductsPage() {
 *   return <ProductList />;
 * }
 * ```
 */
export async function ProductList() {
  const { data: products } = await getProducts();

  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-foreground/50">
        <p className="text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
