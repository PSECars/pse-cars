package com.psecars.merch.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UpdateCustomerInfoRequest {
    
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String customerEmail;
    
    @Size(max = 200, message = "Customer name must not exceed 200 characters")
    private String customerName;
    
    @Size(max = 500, message = "Customer address must not exceed 500 characters")
    private String customerAddress;
    
    // Constructors
    public UpdateCustomerInfoRequest() {}
    
    public UpdateCustomerInfoRequest(String customerEmail, String customerName) {
        this.customerEmail = customerEmail;
        this.customerName = customerName;
    }
    
    public UpdateCustomerInfoRequest(String customerEmail, String customerName, String customerAddress) {
        this.customerEmail = customerEmail;
        this.customerName = customerName;
        this.customerAddress = customerAddress;
    }
    
    // Getters and Setters
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    
    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }
}