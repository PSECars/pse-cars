// components/merchandise/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/merchandise";
import Button from "@/app/components/Button";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;

  const handleAddToCart = () => {
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(product.id);
    }
  };

  return (
    <Link href={`/merchandise/${product.id}`} className="group">
      <div className="bg-surface-secondary border border-outline-tertiary rounded-lg overflow-hidden hover:border-outline-primary transition-colors">
        <div className="relative h-64 bg-surface-tertiary">
          {product.imageUrls.length > 0 ? (
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-tertiary">
              <div className="text-font-tertiary">No Image</div>
            </div>
          )}
          
          {isOutOfStock && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
              Out of Stock
            </div>
          )}
          {isLowStock && (
            <div className="absolute top-2 right-2 bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium">
              Low Stock
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs text-font-secondary bg-surface-tertiary px-2 py-1 rounded">
              {product.category.name}
            </span>
          </div>
          
          <h3 className="text-lg font-medium text-font-primary mb-2 group-hover:text-font-secondary transition-colors">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-font-secondary mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-font-primary">
              €{product.price.toFixed(2)}
            </div>
            
            {/* Conditional rendering instead of disabled prop */}
            <div onClick={(e) => e.preventDefault()}>
              {isOutOfStock ? (
                <div className="opacity-50 cursor-not-allowed px-4 py-2 bg-surface-tertiary text-font-tertiary rounded text-sm">
                  Out of Stock
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-2 text-xs text-font-tertiary">
            {product.stockQuantity} in stock
          </div>
        </div>
      </div>
    </Link>
  );
}