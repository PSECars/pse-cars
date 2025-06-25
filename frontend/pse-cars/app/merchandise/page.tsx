// app/merchandise/page.tsx
"use client";

import { useState, useCallback } from "react";
import { ProductFilters } from "@/types/merchandise";
import { useProducts } from "@/hooks/useProducts";
import ProductGrid from "@/components/merchandise/ProductGrid";
import ProductFilter from "@/components/merchandise/ProductFilter";
import Pagination from "@/components/merchandise/Pagination";
import Button from "@/app/components/Button";
import { apiClient } from "@/lib/api";
import { IconShoppingBag } from "@tabler/icons-react";

export default function MerchandisePage() {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 0,
    size: 12,
    sort: 'name,asc'
  });

  const { products, loading, error, pagination, totalElements } = useProducts(filters);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const handleFiltersChange = useCallback((newFilters: ProductFilters) => {
    setFilters({ ...newFilters, page: 0 });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setFilters(prev => ({ ...prev, sort, page: 0 }));
  }, []);

  const handleAddToCart = useCallback(async (productId: number) => {
    try {
      setAddingToCart(productId);
      const response = await apiClient.addToCart(productId, 1);
      console.log('Product added to cart successfully');
      
      // Only trigger cart update event if operation was successful
      if (response.success) {
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-surface-primary px-10 max-w-400 mx-auto pt-24">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-medium mb-2">Something went wrong</h2>
          <p className="text-font-secondary mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      <main className="px-10 max-w-400 mx-auto pt-24 pb-16">
        <section className="text-center py-16 border-b border-outline-tertiary">
          <div className="flex items-center justify-center gap-4 mb-4">
            <IconShoppingBag size={48} className="text-font-primary" />
          </div>
          <h1 className="text-5xl font-medium text-font-primary mb-4">
            PSE Lifestyle Collection
          </h1>
          <p className="text-xl text-font-secondary max-w-2xl mx-auto">
            Discover the exclusive PSECar Merchandise. From premium electronics to 
            stylish apparel and limited edition collectibles.
          </p>
        </section>

        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-medium">
                {totalElements > 0 && `${totalElements} Products`}
              </h2>
              {!loading && totalElements > 0 && (
                <select
                  value={filters.sort || 'name,asc'}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 bg-surface-secondary border border-outline-tertiary rounded-lg text-font-primary focus:border-outline-primary focus:outline-none"
                >
                  <option value="name,asc">Name A-Z</option>
                  <option value="name,desc">Name Z-A</option>
                  <option value="price,asc">Price Low to High</option>
                  <option value="price,desc">Price High to Low</option>
                  <option value="createdAt,desc">Newest First</option>
                  <option value="createdAt,asc">Oldest First</option>
                </select>
              )}
            </div>
            
            <ProductFilter filters={filters} onFiltersChange={handleFiltersChange} />
          </div>

          {(filters.search || filters.category || filters.minPrice || filters.maxPrice) && (
            <div className="mb-6 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-font-secondary">Active filters:</span>
              {filters.search && (
                <span className="bg-surface-secondary border border-outline-tertiary px-3 py-1 rounded-lg text-sm">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.category && (
                <span className="bg-surface-secondary border border-outline-tertiary px-3 py-1 rounded-lg text-sm">
                  Category: {filters.category}
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="bg-surface-secondary border border-outline-tertiary px-3 py-1 rounded-lg text-sm">
                  Price: €{filters.minPrice || 0} - €{filters.maxPrice || '∞'}
                </span>
              )}
              <Button
                variant="secondary"
                onClick={() => handleFiltersChange({ page: 0, size: 12 })}
                className="text-xs px-2 py-1"
              >
                Clear All
              </Button>
            </div>
          )}
        </section>

        <section>
          <ProductGrid 
            products={products} 
            loading={loading}
            onAddToCart={handleAddToCart}
          />
          
          {pagination && totalElements > 0 && (
            <Pagination
              currentPage={pagination.pageNumber}
              totalPages={Math.ceil(totalElements / pagination.pageSize)}
              totalElements={totalElements}
              pageSize={pagination.pageSize}
              onPageChange={handlePageChange}
            />
          )}
        </section>
      </main>
    </div>
  );
}