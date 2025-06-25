package com.psecars.merch.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateStockRequest {
    
    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;
    
    // Constructors
    public UpdateStockRequest() {}
    
    public UpdateStockRequest(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
    
    // Getters and Setters
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
}