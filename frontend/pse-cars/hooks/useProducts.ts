// hooks/useProducts.ts - CORRECTED VERSION
import { useState, useEffect } from 'react';
import { Product, ProductFilters, PageableResponse } from '@/types/merchandise';
import { apiClient } from '@/lib/api';

export function useProducts(filters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PageableResponse<Product>['pageable'] | null>(null);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching products with filters:', filters); // Debug log
        
        let response;
        
        // Use search endpoint if search term exists
        if (filters.search && filters.search.trim()) {
          response = await apiClient.searchProducts(filters.search, filters);
        } else {
          response = await apiClient.getProducts(filters);
        }
        
        console.log('Products API response:', response); // Debug log
        
        if (response.success && response.data) {
          // Transform backend data to match frontend expectations
          const transformedProducts = response.data.content.map((product: any) => ({
            ...product,
            // Ensure category object exists
            category: {
              id: product.categoryId || product.category?.id,
              name: product.categoryName || product.category?.name || 'Unknown'
            }
          }));
          
          setProducts(transformedProducts);
          setPagination(response.data.pageable);
          setTotalElements(response.data.totalElements || 0);
        } else {
          console.error('API response not successful:', response);
          setError(response.message || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(filters)]);

  return { products, loading, error, pagination, totalElements };
}