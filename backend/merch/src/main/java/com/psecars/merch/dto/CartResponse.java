package com.psecars.merch.dto;

import com.psecars.merch.entity.Cart;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class CartResponse {
    private Long id;
    private String sessionId;
    private String customerEmail;
    private String customerName;
    private BigDecimal totalAmount;
    private Integer totalItemCount;
    private Integer totalQuantity;
    private List<CartItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;
    private boolean isEmpty;
    
    // Constructor from Entity
    public CartResponse(Cart cart) {
        this.id = cart.getId();
        this.sessionId = cart.getSessionId();
        this.customerEmail = cart.getCustomerEmail();
        this.customerName = cart.getCustomerName();
        this.totalAmount = cart.getTotalAmount();
        this.totalItemCount = cart.getCartItems().size();
        this.totalQuantity = cart.getTotalItemCount();
        this.items = cart.getCartItems().stream()
                .map(CartItemResponse::new)
                .collect(Collectors.toList());
        this.createdAt = cart.getCreatedAt();
        this.updatedAt = cart.getUpdatedAt();
        this.expiresAt = cart.getExpiresAt();
        this.isEmpty = cart.isEmpty();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public Integer getTotalItemCount() { return totalItemCount; }
    public void setTotalItemCount(Integer totalItemCount) { this.totalItemCount = totalItemCount; }
    
    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }
    
    public List<CartItemResponse> getItems() { return items; }
    public void setItems(List<CartItemResponse> items) { this.items = items; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    
    public boolean isEmpty() { return isEmpty; }
    public void setEmpty(boolean empty) { isEmpty = empty; }
}
