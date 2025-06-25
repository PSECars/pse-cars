package com.psecars.merch.controller;

import com.psecars.merch.dto.*;
import com.psecars.merch.entity.Cart;
import com.psecars.merch.entity.CartItem;
import com.psecars.merch.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    
    private final CartService cartService;
    private static final String CART_SESSION_COOKIE = "CART_SESSION_ID";
    private static final int COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
    
    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = getOrCreateSessionId(request, response);
        
        Optional<Cart> cart = cartService.getCartWithItems(sessionId);
        
        if (cart.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success(new CartResponse(cart.get())));
        } else {
            Cart emptyCart = cartService.getOrCreateCart(sessionId);
            return ResponseEntity.ok(ApiResponse.success(new CartResponse(emptyCart)));
        }
    }
    
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> getCartSummary(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = getOrCreateSessionId(request, response);
        
        Optional<Cart> cart = cartService.getCartWithItems(sessionId);
        
        if (cart.isPresent()) {
            Cart c = cart.get();
            CartSummaryResponse summary = new CartSummaryResponse(
                sessionId, 
                c.getCartItems().size(),
                c.getTotalItemCount(),
                c.getTotalAmount()
            );
            return ResponseEntity.ok(ApiResponse.success(summary));
        } else {
            CartSummaryResponse emptySummary = new CartSummaryResponse(sessionId, 0, 0, java.math.BigDecimal.ZERO);
            return ResponseEntity.ok(ApiResponse.success(emptySummary));
        }
    }
    
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        try {
            String sessionId = getOrCreateSessionId(httpRequest, httpResponse);
            Cart cart = cartService.addItemToCart(sessionId, request.getProductId(), request.getQuantity());
            
            return ResponseEntity.ok(ApiResponse.success("Item added to cart successfully", new CartResponse(cart)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to add item to cart: " + e.getMessage()));
        }
    }
    
    @PutMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Long productId,
            @Valid @RequestBody UpdateCartItemRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        try {
            String sessionId = getOrCreateSessionId(httpRequest, httpResponse);
            Cart cart = cartService.updateItemQuantity(sessionId, productId, request.getQuantity());
            
            return ResponseEntity.ok(ApiResponse.success("Cart item updated successfully", new CartResponse(cart)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update cart item: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @PathVariable Long productId,
            HttpServletRequest request,
            HttpServletResponse response) {
        
        try {
            String sessionId = getOrCreateSessionId(request, response);
            Cart cart = cartService.removeItemFromCart(sessionId, productId);
            
            return ResponseEntity.ok(ApiResponse.success("Item removed from cart successfully", new CartResponse(cart)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to remove item from cart: " + e.getMessage()));
        }
    }
    
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(HttpServletRequest request, HttpServletResponse response) {
        try {
            String sessionId = getOrCreateSessionId(request, response);
            cartService.clearCart(sessionId);
            
            return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to clear cart: " + e.getMessage()));
        }
    }
    
    @PutMapping("/customer")
    public ResponseEntity<ApiResponse<CartResponse>> updateCustomerInfo(
            @Valid @RequestBody UpdateCustomerInfoRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        try {
            String sessionId = getOrCreateSessionId(httpRequest, httpResponse);
            Cart cart = cartService.updateCustomerInfo(sessionId, request.getCustomerEmail(), request.getCustomerName());
            
            return ResponseEntity.ok(ApiResponse.success("Customer information updated successfully", new CartResponse(cart)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update customer information: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Integer>> getCartItemCount(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = getOrCreateSessionId(request, response);
        Integer count = cartService.getCartItemCount(sessionId);
        
        return ResponseEntity.ok(ApiResponse.success(count != null ? count : 0));
    }
    
    @GetMapping("/quantity")
    public ResponseEntity<ApiResponse<Integer>> getTotalQuantity(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = getOrCreateSessionId(request, response);
        Integer quantity = cartService.getTotalQuantity(sessionId);
        
        return ResponseEntity.ok(ApiResponse.success(quantity != null ? quantity : 0));
    }
    
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<List<CartItemResponse>>> validateCart(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = getOrCreateSessionId(request, response);
        List<CartItem> unavailableItems = cartService.getUnavailableItems(sessionId);
        
        List<CartItemResponse> unavailableItemResponses = unavailableItems.stream()
                .map(CartItemResponse::new)
                .toList();
        
        if (unavailableItemResponses.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("All cart items are available", unavailableItemResponses));
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Some cart items are no longer available", unavailableItemResponses));
        }
    }
    
    @GetMapping("/checkout")
    public ResponseEntity<ApiResponse<CartResponse>> prepareCheckout(HttpServletRequest request, HttpServletResponse response) {
        try {
            String sessionId = getOrCreateSessionId(request, response);
            Cart cart = cartService.getCartForCheckout(sessionId);
            
            return ResponseEntity.ok(ApiResponse.success("Cart is ready for checkout", new CartResponse(cart)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to prepare cart for checkout: " + e.getMessage()));
        }
    }
    
    // FIXED: Improved session management with cookies for persistence across requests
    private String getOrCreateSessionId(HttpServletRequest request, HttpServletResponse response) {
        // First try to get session ID from cookie
        String sessionId = getSessionIdFromCookie(request);
        
        if (sessionId != null) {
            return sessionId;
        }
        
        // Try to get from HTTP session as fallback
        HttpSession session = request.getSession(false); // No need to create new session automatically
        if (session != null) {
            sessionId = (String) session.getAttribute("cartSessionId");
            if (sessionId != null) {
                // Store in cookie for future requests
                setSessionIdCookie(response, sessionId);
                return sessionId;
            }
        }
        
        // Generate new session ID if none found
        sessionId = cartService.generateSessionId();
        
        // Store in both HTTP session and cookie
        HttpSession newSession = request.getSession(true);
        newSession.setAttribute("cartSessionId", sessionId);
        setSessionIdCookie(response, sessionId);
        
        return sessionId;
    }
    
    private String getSessionIdFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        
        for (Cookie cookie : request.getCookies()) {
            if (CART_SESSION_COOKIE.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
    
    private void setSessionIdCookie(HttpServletResponse response, String sessionId) {
        Cookie cookie = new Cookie(CART_SESSION_COOKIE, sessionId);
        cookie.setMaxAge(COOKIE_MAX_AGE);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        response.addCookie(cookie);
    }
}