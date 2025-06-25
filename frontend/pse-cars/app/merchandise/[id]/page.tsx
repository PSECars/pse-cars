// app/merchandise/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/merchandise";
import { apiClient } from "@/lib/api";
import Button from "@/app/components/Button";
import { IconArrowLeft, IconShoppingCart, IconTruck, IconShield, IconRefresh } from "@tabler/icons-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getProduct(Number(params.id));
        
        if (response.success) {
          setProduct(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      const response = await apiClient.addToCart(product.id, quantity);
      console.log('Product added to cart successfully');
      
      // Only trigger cart update event if operation was successful
      if (response.success) {
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-primary">
        <main className="px-10 max-w-400 mx-auto pt-24">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-secondary rounded w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="h-96 bg-surface-secondary rounded-lg" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 w-20 bg-surface-secondary rounded" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-surface-secondary rounded w-3/4" />
                <div className="h-4 bg-surface-secondary rounded w-1/2" />
                <div className="h-12 bg-surface-secondary rounded w-1/4" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-4 bg-surface-secondary rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-surface-primary">
        <main className="px-10 max-w-400 mx-auto pt-24">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-medium mb-2">Product not found</h2>
            <p className="text-font-secondary mb-4">{error || 'The product you are looking for does not exist.'}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.back()}>
                Go Back
              </Button>
              <Button variant="secondary" onClick={() => router.push('/merchandise')}>
                Browse All Products
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;

  return (
    <div className="min-h-screen bg-surface-primary">
      <main className="px-10 max-w-400 mx-auto pt-24 pb-16">
        <Link 
          href="/merchandise" 
          className="inline-flex items-center gap-2 text-font-secondary hover:text-font-primary mb-8 transition-colors"
        >
          <IconArrowLeft size={16} />
          Back to Merchandise
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative h-96 lg:h-[500px] bg-surface-secondary rounded-lg overflow-hidden">
              {product.imageUrls.length > 0 ? (
                <Image
                  src={product.imageUrls[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-font-tertiary">No Image Available</div>
                </div>
              )}
            </div>
            
            {product.imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 w-20 bg-surface-secondary rounded overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-outline-primary' : 'border-outline-tertiary'
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-block bg-surface-tertiary text-font-secondary px-3 py-1 rounded-lg text-sm">
                {product.category?.name || product.categoryName || 'Uncategorized'}
              </span>
            </div>

            <div>
              <h1 className="text-4xl font-medium text-font-primary mb-4">
                {product.name}
              </h1>
              <div className="text-3xl font-semibold text-font-primary">
                €{product.price.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <span className="text-red-400 font-medium">Out of Stock</span>
              ) : isLowStock ? (
                <span className="text-yellow-400 font-medium">
                  Only {product.stockQuantity} left in stock
                </span>
              ) : (
                <span className="text-green-400 font-medium">In Stock ({product.stockQuantity} available)</span>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-font-secondary leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-font-primary font-medium">Quantity:</label>
                <div className="flex items-center border border-outline-tertiary rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-surface-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-outline-tertiary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-3 py-2 hover:bg-surface-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= product.stockQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Conditional rendering instead of disabled prop */}
              {isOutOfStock ? (
                <div className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-surface-tertiary text-font-tertiary rounded-lg">
                  <IconShoppingCart size={20} />
                  Out of Stock
                </div>
              ) : addingToCart ? (
                <div className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-surface-tertiary text-font-secondary rounded-lg">
                  <IconShoppingCart size={20} />
                  Adding to Cart...
                </div>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <IconShoppingCart size={20} />
                  Add to Cart
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-outline-tertiary">
              <div className="flex items-center gap-3">
                <IconTruck className="text-font-secondary" size={20} />
                <span className="text-sm text-font-secondary">Free Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <IconShield className="text-font-secondary" size={20} />
                <span className="text-sm text-font-secondary">PSE Warranty</span>
              </div>
              <div className="flex items-center gap-3">
                <IconRefresh className="text-font-secondary" size={20} />
                <span className="text-sm text-font-secondary">30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}