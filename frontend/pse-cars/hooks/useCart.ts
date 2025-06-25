// hooks/useCart.ts
import { useState, useEffect } from 'react';
import { Cart } from '@/types/merchandise';
import { apiClient } from '@/lib/api';

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getCartSummary();
      
      if (response.success) {
        setCart(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      const response = await apiClient.addToCart(productId, quantity);
      if (response.success) {
        setCart(response.data);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
      return false;
    }
  };

  const getCartItemCount = () => {
    // Use totalQuantity from backend if available, otherwise calculate from items
    if (!cart) {
      return 0;
    }
    
    // Backend provides totalQuantity field - use it if available
    if (cart.totalQuantity !== undefined) {
      return cart.totalQuantity;
    }
    
    // Fallback to calculating from items array
    if (!cart.items || !Array.isArray(cart.items)) {
      return 0;
    }
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Add refresh function for external components to trigger cart update
  const refreshCart = () => {
    fetchCart();
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Listen for custom cart update events
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    getCartItemCount,
    refreshCart
  };
}