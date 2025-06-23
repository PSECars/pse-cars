package com.psecars.merch.dto;

import com.psecars.merch.entity.OrderItem;
import java.math.BigDecimal;

public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
    
    // Constructor from Entity
    public OrderItemResponse(OrderItem orderItem) {
        this.id = orderItem.getId();
        if (orderItem.getProduct() != null) {
            this.productId = orderItem.getProduct().getId();
            this.productName = orderItem.getProduct().getName();
        }
        this.quantity = orderItem.getQuantity();
        this.price = orderItem.getPrice();
        this.subtotal = orderItem.getSubtotal();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
