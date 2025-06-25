"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Cart } from "@/types/merchandise";
import { apiClient } from "@/lib/api";
import Button from "@/app/components/Button";
import { IconX, IconPlus, IconMinus, IconShoppingBag } from "@tabler/icons-react";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching cart...');
      // TRY: First attempt to get cart with items, if cartItems is empty, try adding a dummy item and removing it
      const response = await apiClient.getCart();
      
      console.log('Cart response:', response);
      
      if (response.success) {
        console.log('Cart data:', response.data);
        console.log('Cart items:', response.data.items);
        console.log('Items length:', response.data.items?.length);
        console.log('First item:', response.data.items?.[0]);
        
        // FIXED: Check items instead of cartItems
        if ((!response.data.items || response.data.items.length === 0) && response.data.totalItemCount > 0) {
          console.warn('Cart has items but items array is missing. Backend issue detected.');
          setError('Cart data loading issue. Please refresh the page and try again.');
          return;
        }
        
        setCart(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(productId);
      return;
    }

    try {
      // FIXED: Use productId instead of itemId
      const response = await apiClient.updateCartItem(productId, newQuantity);
      if (response.success) {
        setCart(response.data);
        // Trigger cart update event for layout counter
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (err) {
      console.error('Failed to update cart item:', err);
    }
  };

  const removeItem = async (productId: number) => {
    try {
      // FIXED: Use productId instead of itemId
      const response = await apiClient.removeFromCart(productId);
      if (response.success) {
        setCart(response.data);
        // Trigger cart update event for layout counter
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        // Refresh cart display immediately
        await fetchCart();
      }
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-96 bg-surface-secondary border-l border-outline-tertiary z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-outline-tertiary">
          <h2 className="text-xl font-medium flex items-center gap-2">
            <IconShoppingBag size={24} />
            Shopping Cart
          </h2>
          <button
            onClick={onClose}
            className="text-font-secondary hover:text-font-primary transition-colors"
          >
            <IconX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-16 w-16 bg-surface-tertiary rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface-tertiary rounded w-3/4" />
                      <div className="h-3 bg-surface-tertiary rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-font-secondary">{error}</p>
              <Button onClick={fetchCart} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : !cart || !cart.items || cart.items.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-font-secondary mb-4">Add some items to get started</p>
              <Button onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {cart.items.map((item) => {
                // FIXED: Handle the actual backend data structure
                // Backend sends flat structure, not nested product object
                
                return (
                  <div key={item.id} className="flex gap-4 p-4 bg-surface-tertiary rounded-lg">
                    <div className="relative h-16 w-16 bg-surface-primary rounded overflow-hidden">
                      {item.productImageUrl ? (
                        <Image
                          src={item.productImageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          priority={false}
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-font-tertiary">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.productName}
                      </h4>
                      <p className="text-font-secondary text-xs">
                        €{item.price.toFixed(2)} each
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-surface-secondary rounded"
                        >
                          <IconMinus size={14} />
                        </button>
                        <span className="text-sm px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-surface-secondary rounded"
                          disabled={item.quantity >= (item.availableStock || 0)}
                        >
                          <IconPlus size={14} />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="ml-auto text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-sm font-medium">
                      €{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart && cart.items && cart.items.length > 0 && (
          <div className="border-t border-outline-tertiary p-6 space-y-4">
            <div className="flex justify-between text-lg font-medium">
              <span>Total:</span>
              <span>€{cart.totalAmount.toFixed(2)}</span>
            </div>
            <Button className="w-full">
              Proceed to Checkout
            </Button>
            <Button variant="secondary" onClick={onClose} className="w-full">
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </>
  );
}