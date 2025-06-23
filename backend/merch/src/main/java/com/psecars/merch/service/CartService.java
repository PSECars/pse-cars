package com.psecars.merch.service;

import com.psecars.merch.entity.Cart;
import com.psecars.merch.entity.CartItem;
import com.psecars.merch.entity.Product;
import com.psecars.merch.repository.CartRepository;
import com.psecars.merch.repository.CartItemRepository;
import com.psecars.merch.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CartService {
    
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    
    @Autowired
    public CartService(CartRepository cartRepository, 
                      CartItemRepository cartItemRepository,
                      ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }
    
    public Cart getOrCreateCart(String sessionId) {
        final String finalSessionId;
        if (sessionId == null || sessionId.trim().isEmpty()) {
            finalSessionId = generateSessionId();
        } else {
            finalSessionId = sessionId;
        }
        
        return cartRepository.findBySessionId(finalSessionId)
                .orElseGet(() -> {
                    Cart newCart = new Cart(finalSessionId);
                    return cartRepository.save(newCart);
                });
    }
    
    // REMOVED @Cacheable - caching entities causes circular reference issues
    @Transactional(readOnly = true)
    public Optional<Cart> getCartWithItems(String sessionId) {
        return cartRepository.findBySessionIdWithItems(sessionId);
    }
    
    // REMOVED @CacheEvict - no longer caching entities
    public Cart addItemToCart(String sessionId, Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        Cart cart = getOrCreateCart(sessionId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }
        
        Optional<CartItem> existingItem = cartItemRepository
                .findBySessionIdAndProductId(sessionId, productId);
        
        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + quantity;
            
            if (product.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
        } else {
            CartItem cartItem = new CartItem(cart, product, quantity);
            cart.addItem(cartItem);
            cartItemRepository.save(cartItem);
        }
        
        cart.calculateTotalAmount();
        return cartRepository.save(cart);
    }
    
    // REMOVED @CacheEvict - no longer caching entities
    public Cart updateItemQuantity(String sessionId, Long productId, Integer quantity) {
        if (quantity <= 0) {
            return removeItemFromCart(sessionId, productId);
        }
        
        Cart cart = cartRepository.findBySessionIdWithItems(sessionId)
                .orElseThrow(() -> new RuntimeException("Cart not found for session: " + sessionId));
        
        CartItem cartItem = cartItemRepository.findBySessionIdAndProductId(sessionId, productId)
                .orElseThrow(() -> new RuntimeException("Cart item not found for product: " + productId));
        
        Product product = cartItem.getProduct();
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }
        
        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        
        cart.calculateTotalAmount();
        return cartRepository.save(cart);
    }
    
    // REMOVED @CacheEvict - no longer caching entities
    public Cart removeItemFromCart(String sessionId, Long productId) {
        Cart cart = cartRepository.findBySessionIdWithItems(sessionId)
                .orElseThrow(() -> new RuntimeException("Cart not found for session: " + sessionId));
        
        cartItemRepository.deleteBySessionIdAndProductId(sessionId, productId);
        
        cart = cartRepository.findBySessionIdWithItems(sessionId).orElse(cart);
        cart.calculateTotalAmount();
        return cartRepository.save(cart);
    }
    
    // REMOVED @CacheEvict - no longer caching entities
    public void clearCart(String sessionId) {
        cartItemRepository.deleteByCartSessionId(sessionId);
        cartRepository.deleteBySessionId(sessionId);
    }
    
    @Transactional(readOnly = true)
    public Integer getCartItemCount(String sessionId) {
        return cartItemRepository.countBySessionId(sessionId);
    }
    
    @Transactional(readOnly = true)
    public Integer getTotalQuantity(String sessionId) {
        return cartItemRepository.sumQuantityBySessionId(sessionId);
    }
    
    @Transactional(readOnly = true)
    public List<CartItem> getUnavailableItems(String sessionId) {
        return cartItemRepository.findUnavailableItemsBySessionId(sessionId);
    }
    
    // REMOVED @CacheEvict - no longer caching entities
    public Cart updateCustomerInfo(String sessionId, String customerEmail, String customerName) {
        Cart cart = getOrCreateCart(sessionId);
        cart.setCustomerEmail(customerEmail);
        cart.setCustomerName(customerName);
        return cartRepository.save(cart);
    }
    
    public Cart updateCustomerInfo(String sessionId, String customerEmail, String customerName, String customerAddress) {
        Cart cart = getOrCreateCart(sessionId);
        cart.setCustomerEmail(customerEmail);
        cart.setCustomerName(customerName);
        cart.setCustomerAddress(customerAddress);
        return cartRepository.save(cart);
    }
    
    @Transactional(readOnly = true)
    public Cart getCartForCheckout(String sessionId) {
        Cart cart = cartRepository.findBySessionIdWithItems(sessionId)
                .orElseThrow(() -> new RuntimeException("Cart not found for session: " + sessionId));
        
        if (cart.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }
        
        List<CartItem> unavailableItems = getUnavailableItems(sessionId);
        if (!unavailableItems.isEmpty()) {
            throw new RuntimeException("Some items in the cart are no longer available");
        }
        
        return cart;
    }
    
    public String generateSessionId() {
        return UUID.randomUUID().toString();
    }
    
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void cleanupExpiredCarts() {
        LocalDateTime now = LocalDateTime.now();
        List<Cart> expiredCarts = cartRepository.findExpiredCarts(now);
        
        for (Cart cart : expiredCarts) {
            cartItemRepository.deleteByCartId(cart.getId());
        }
        
        cartRepository.deleteByExpiresAtBefore(now);
        
        if (!expiredCarts.isEmpty()) {
            System.out.println("Cleaned up " + expiredCarts.size() + " expired carts");
        }
    }
    
    @Transactional
    public int cleanupInactiveCarts(int daysInactive) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusDays(daysInactive);
        List<Cart> inactiveCarts = cartRepository.findInactiveCarts(cutoffTime);
        
        for (Cart cart : inactiveCarts) {
            cartItemRepository.deleteByCartId(cart.getId());
            cartRepository.delete(cart);
        }
        
        return inactiveCarts.size();
    }
}