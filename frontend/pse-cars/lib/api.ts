// lib/api.ts - FIXED FOR DOCKER NETWORKING
import { Product, Category, Cart, ProductFilters, PageableResponse, ApiResponse } from '@/types/merchandise';

// Enhanced environment detection for Docker networking
const getApiBaseUrl = () => {
  // Check if we're in browser (client-side)
  const isClient = typeof window !== 'undefined';
  
  if (isClient) {
    // Browser environment - detect if we're in Docker or local development
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    console.log(`[API Client] Browser environment detected. Hostname: ${hostname}`);
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Local development - use localhost
      console.log('[API Client] Local development mode detected');
      return 'http://localhost:8083/merch/api';
    } else {
      // Docker deployment or production - use same hostname with backend port
      console.log('[API Client] Docker/Production mode detected');
      return `${protocol}//${hostname}:8083/merch/api`;
    }
  }
  
  // Server-side rendering (SSR) or Node.js environment
  const merchUrl = process.env.NEXT_PUBLIC_MERCH_URL;
  
  if (merchUrl) {
    console.log(`[API Client] SSR environment using NEXT_PUBLIC_MERCH_URL: ${merchUrl}`);
    return `${merchUrl}/merch/api`;
  }
  
  // Fallback for local development
  console.log('[API Client] Fallback to localhost for SSR');
  return 'http://localhost:8083/merch/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log(`[API Client] Final API base URL: ${API_BASE_URL}`);

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      console.log(`[API Client] ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // Add CORS headers for Docker networking
          'Accept': 'application/json',
          ...options.headers,
        },
        // Add timeout for better error handling
        signal: AbortSignal.timeout(10000), // 10 second timeout
        ...options,
      });

      console.log(`[API Client] Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API Client] Error ${response.status}:`, errorText);
        
        // Specific error handling for network issues
        if (response.status === 0 || response.status >= 500) {
          throw new Error(`Network error: Unable to connect to backend service. Status: ${response.status}`);
        }
        
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log(`[API Client] Success:`, !!result.success, 'Data type:', typeof result.data);
      
      return result;
    } catch (error) {
      console.error('[API Client] Request failed:', error);
      
      // Enhanced error reporting for debugging
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error(`[API Client] Network connectivity issue. Check if backend is running and accessible at: ${API_BASE_URL}`);
        throw new Error(`Unable to connect to backend service at ${API_BASE_URL}. Please check if the service is running.`);
      }
      
      throw error;
    }
  }

  // ===== CART METHODS =====
  
  async getCart(): Promise<ApiResponse<Cart>> {
    return this.request<Cart>('/cart');
  }

  async getCartSummary(): Promise<ApiResponse<Cart>> {
    return this.request<Cart>('/cart/summary');
  }

  async addToCart(productId: number, quantity: number): Promise<ApiResponse<Cart>> {
    console.log(`[API Client] Adding product ${productId} with quantity ${quantity}`);
    
    const result = await this.request<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    
    if (result.success && result.data) {
      const itemCount = result.data.totalQuantity || result.data.totalItemCount || 0;
      console.log(`[API Client] Cart updated successfully. Total items: ${itemCount}`);
      console.log('[API Client] Cart data preview:', {
        id: result.data.id,
        totalAmount: result.data.totalAmount,
        totalQuantity: result.data.totalQuantity,
        itemCount: result.data.items?.length || 0
      });
    } else {
      console.error('[API Client] Add to cart failed:', result.message);
    }
    
    return result;
  }

  async updateCartItem(productId: number, quantity: number): Promise<ApiResponse<Cart>> {
    console.log(`[API Client] Updating cart item ${productId} to quantity ${quantity}`);
    return this.request<Cart>(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId: number): Promise<ApiResponse<Cart>> {
    console.log(`[API Client] Removing product ${productId} from cart`);
    return this.request<Cart>(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  }

  async getCartItemCount(): Promise<ApiResponse<number>> {
    return this.request<number>('/cart/count');
  }

  // ===== PRODUCT METHODS =====

  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<PageableResponse<Product>>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('keyword', filters.search);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    
    if (filters.sort) {
      const sortParts = filters.sort.split(',');
      params.append('sortBy', sortParts[0]);
      if (sortParts[1]) {
        params.append('sortDir', sortParts[1]);
      }
    }
    
    if (filters.category) {
      try {
        const categoriesResponse = await this.getCategories();
        if (categoriesResponse.success) {
          const category = categoriesResponse.data.find(c => 
            c.name.toLowerCase() === filters.category?.toLowerCase()
          );
          if (category) {
            const queryString = params.toString();
            const endpoint = queryString ? 
              `/products/category/${category.id}?${queryString}` : 
              `/products/category/${category.id}`;
            return this.request<PageableResponse<Product>>(endpoint);
          }
        }
      } catch (error) {
        console.error('[API Client] Category filter error:', error);
      }
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return this.request<PageableResponse<Product>>(endpoint);
  }

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>('/categories');
  }

  async searchProducts(keyword: string, filters: ProductFilters = {}): Promise<ApiResponse<PageableResponse<Product>>> {
    const params = new URLSearchParams();
    params.append('keyword', keyword);
    
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    
    if (filters.sort) {
      const sortParts = filters.sort.split(',');
      params.append('sortBy', sortParts[0]);
      if (sortParts[1]) {
        params.append('sortDir', sortParts[1]);
      }
    }

    const queryString = params.toString();
    return this.request<PageableResponse<Product>>(`/products/search?${queryString}`);
  }

  async clearCart(): Promise<ApiResponse<void>> {
    return this.request<void>('/cart', {
      method: 'DELETE',
    });
  }

  // ===== DEBUGGING METHODS =====
  
  async testConnection(): Promise<boolean> {
    try {
      console.log('[API Client] Testing connection to backend...');
      const response = await fetch(`${API_BASE_URL}/products?size=1`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      console.log(`[API Client] Connection test result: ${response.status}`);
      return response.ok;
    } catch (error) {
      console.error('[API Client] Connection test failed:', error);
      return false;
    }
  }

  getApiBaseUrl(): string {
    return API_BASE_URL;
  }
}

export const apiClient = new ApiClient();

// Add global debugging helpers
if (typeof window !== 'undefined') {
  // @ts-ignore - Adding to window for debugging
  window.debugApi = {
    testConnection: () => apiClient.testConnection(),
    getBaseUrl: () => apiClient.getApiBaseUrl(),
    checkCart: async () => {
      try {
        const cart = await apiClient.getCartSummary();
        console.log('Current cart:', cart);
        return cart;
      } catch (error) {
        console.error('Cart check failed:', error);
        return null;
      }
    }
  };
  
  console.log('[API Client] Debug helpers added to window.debugApi');
}