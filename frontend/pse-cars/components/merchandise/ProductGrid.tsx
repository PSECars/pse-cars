// components/merchandise/ProductGrid.tsx
"use client";

import { Product } from "@/types/merchandise";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onAddToCart?: (productId: number) => void;
}

export default function ProductGrid({ products, loading, onAddToCart }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-surface-secondary border border-outline-tertiary rounded-lg overflow-hidden animate-pulse">
            <div className="h-64 bg-surface-tertiary" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-surface-tertiary rounded w-3/4" />
              <div className="h-3 bg-surface-tertiary rounded w-1/2" />
              <div className="h-8 bg-surface-tertiary rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-medium mb-2">No products found</h3>
        <p className="text-font-secondary">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}