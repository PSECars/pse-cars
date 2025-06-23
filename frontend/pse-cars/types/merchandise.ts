// types/merchandise.ts - CORRECTED VERSION
export interface Category {
  id: number;
  name: string;
  description?: string;
  productCount?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  categoryName: string;
  categoryId: number;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  inStock: boolean;
  
  // For frontend compatibility - created by the useProducts hook
  category: {
    id: number;
    name: string;
  };
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productDescription?: string;
  quantity: number;
  price: number;
  subtotal: number;
  availableStock: number;
  isAvailable: boolean;
  productImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  sessionId: string;
  customerEmail?: string;
  customerName?: string;
  customerAddress?: string;
  totalAmount: number;
  totalItemCount: number;
  totalQuantity: number;
  items: CartItem[];  // FIXED: Backend uses 'items' not 'cartItems'
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isEmpty: boolean;
}

export interface PageableResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  empty: boolean;
  numberOfElements: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}