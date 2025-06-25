// components/merchandise/ProductFilter.tsx
"use client";

import { useState, useEffect } from "react";
import { ProductFilters } from "@/types/merchandise";
import { useCategories } from "@/hooks/useCategories";
import Button from "@/app/components/Button";
import { IconFilter, IconX } from "@tabler/icons-react";

interface ProductFilterProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export default function ProductFilter({ filters, onFiltersChange }: ProductFilterProps) {
  const { categories } = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = { page: 0, size: 12 };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setIsOpen(false);
  };

  const hasActiveFilters = localFilters.category || localFilters.search || 
                          localFilters.minPrice || localFilters.maxPrice;

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <IconFilter size={16} />
        Filters
        {hasActiveFilters && (
          <span className="bg-font-primary text-surface-primary text-xs px-2 py-0.5 rounded-full">
            {[localFilters.category, localFilters.search, localFilters.minPrice, localFilters.maxPrice]
              .filter(Boolean).length}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-80 bg-surface-secondary border border-outline-tertiary rounded-lg p-6 z-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Filters</h3>
              <button onClick={() => setIsOpen(false)}>
                <IconX size={20} className="text-font-secondary hover:text-font-primary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <input
                  type="text"
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 bg-surface-tertiary border border-outline-tertiary rounded-lg text-font-primary focus:border-outline-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={localFilters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  className="w-full px-3 py-2 bg-surface-tertiary border border-outline-tertiary rounded-lg text-font-primary focus:border-outline-primary focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={localFilters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Min €"
                    className="w-full px-3 py-2 bg-surface-tertiary border border-outline-tertiary rounded-lg text-font-primary focus:border-outline-primary focus:outline-none"
                  />
                  <input
                    type="number"
                    value={localFilters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Max €"
                    className="w-full px-3 py-2 bg-surface-tertiary border border-outline-tertiary rounded-lg text-font-primary focus:border-outline-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleApplyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="secondary" onClick={handleClearFilters} className="flex-1">
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}