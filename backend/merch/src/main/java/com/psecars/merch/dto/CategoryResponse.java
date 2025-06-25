package com.psecars.merch.dto;

import com.psecars.merch.entity.Category;

public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private Integer productCount;
    
    // Constructor from Entity
    public CategoryResponse(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.description = category.getDescription();
        // Safe product count without triggering lazy loading
        this.productCount = (category.getProducts() != null) ? category.getProducts().size() : 0;
    }
    
    // Default constructor
    public CategoryResponse() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getProductCount() { return productCount; }
    public void setProductCount(Integer productCount) { this.productCount = productCount; }
}