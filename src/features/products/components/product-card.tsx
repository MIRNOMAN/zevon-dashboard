import Link from "next/link";
import type { Product } from "../types/product.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductCardProps {
  product: Product;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      {/* Image placeholder */}
      <div className="flex aspect-video items-center justify-center rounded-t-xl bg-foreground/5 text-4xl">
        📦
      </div>

      <CardHeader>
        <div className="mb-1">
          <span className="inline-block rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider">
            {product.category}
          </span>
        </div>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-auto">
        <p className="text-xl font-semibold">
          ${(product.price / 100).toFixed(2)}
        </p>
      </CardContent>

      <CardFooter>
        <Link href={`/products/${product.slug}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
