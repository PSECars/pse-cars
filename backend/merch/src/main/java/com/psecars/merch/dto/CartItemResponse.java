package com.psecars.merch.dto;

import com.psecars.merch.entity.CartItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productDescription;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;
    private Integer availableStock;
    private boolean isAvailable;
    private LocalDateTime addedAt;
    private String productImageUrl;
    
    // Constructor from Entity
    public CartItemResponse(CartItem cartItem) {
        this.id = cartItem.getId();
        if (cartItem.getProduct() != null) {
            this.productId = cartItem.getProduct().getId();
            this.productName = cartItem.getProduct().getName();
            this.productDescription = cartItem.getProduct().getDescription();
            this.availableStock = cartItem.getProduct().getStockQuantity();
            
            // Get first image URL if available
            if (cartItem.getProduct().getImageUrls() != null && !cartItem.getProduct().getImageUrls().isEmpty()) {
                this.productImageUrl = cartItem.getProduct().getImageUrls().get(0);
            }
        }
        this.price = cartItem.getPrice();
        this.quantity = cartItem.getQuantity();
        this.subtotal = cartItem.getSubtotal();
        this.isAvailable = cartItem.isAvailable();
        this.addedAt = cartItem.getAddedAt();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    
    public String getProductDescription() { return productDescription; }
    public void setProductDescription(String productDescription) { this.productDescription = productDescription; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    
    public Integer getAvailableStock() { return availableStock; }
    public void setAvailableStock(Integer availableStock) { this.availableStock = availableStock; }
    
    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
    
    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
    
    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }
}