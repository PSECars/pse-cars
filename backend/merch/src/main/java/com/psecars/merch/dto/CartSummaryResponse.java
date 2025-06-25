package com.psecars.merch.dto;

import java.math.BigDecimal;

public class CartSummaryResponse {
    private String sessionId;
    private Integer totalItems;
    private Integer totalQuantity;
    private BigDecimal totalAmount;
    private boolean isEmpty;
    
    // Constructor
    public CartSummaryResponse(String sessionId, Integer totalItems, Integer totalQuantity, BigDecimal totalAmount) {
        this.sessionId = sessionId;
        this.totalItems = totalItems;
        this.totalQuantity = totalQuantity;
        this.totalAmount = totalAmount;
        this.isEmpty = (totalItems == null || totalItems == 0);
    }
    
    // Getters and Setters
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    
    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }
    
    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public boolean isEmpty() { return isEmpty; }
    public void setEmpty(boolean empty) { isEmpty = empty; }
}
