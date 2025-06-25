package com.psecars.merch.controller;

import com.psecars.merch.dto.ApiResponse;
import com.psecars.merch.dto.ProductResponse;
import com.psecars.merch.entity.Product;
import com.psecars.merch.entity.OrderStatus;
import com.psecars.merch.service.ProductService;
import com.psecars.merch.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    private final ProductService productService;
    private final OrderService orderService;
    
    @Autowired
    public AdminController(ProductService productService, OrderService orderService) {
        this.productService = productService;
        this.orderService = orderService;
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboardStats() {
        DashboardStats stats = new DashboardStats();
        
        stats.setPendingOrders(orderService.getOrderCountByStatus(OrderStatus.PENDING));
        stats.setProcessingOrders(orderService.getOrderCountByStatus(OrderStatus.PROCESSING));
        stats.setShippedOrders(orderService.getOrderCountByStatus(OrderStatus.SHIPPED));
        stats.setDeliveredOrders(orderService.getOrderCountByStatus(OrderStatus.DELIVERED));
        
        List<Product> lowStockProducts = productService.getLowStockProducts(10);
        stats.setLowStockProducts(lowStockProducts.stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList()));
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @GetMapping("/products/low-stock")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStockProducts(
            @RequestParam(defaultValue = "10") Integer threshold) {
        
        List<Product> lowStockProducts = productService.getLowStockProducts(threshold);
        List<ProductResponse> productResponses = lowStockProducts.stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(productResponses));
    }
    
    public static class DashboardStats {
        private Long pendingOrders;
        private Long processingOrders;
        private Long shippedOrders;
        private Long deliveredOrders;
        private List<ProductResponse> lowStockProducts;
        
        public Long getPendingOrders() { return pendingOrders; }
        public void setPendingOrders(Long pendingOrders) { this.pendingOrders = pendingOrders; }
        
        public Long getProcessingOrders() { return processingOrders; }
        public void setProcessingOrders(Long processingOrders) { this.processingOrders = processingOrders; }
        
        public Long getShippedOrders() { return shippedOrders; }
        public void setShippedOrders(Long shippedOrders) { this.shippedOrders = shippedOrders; }
        
        public Long getDeliveredOrders() { return deliveredOrders; }
        public void setDeliveredOrders(Long deliveredOrders) { this.deliveredOrders = deliveredOrders; }
        
        public List<ProductResponse> getLowStockProducts() { return lowStockProducts; }
        public void setLowStockProducts(List<ProductResponse> lowStockProducts) { this.lowStockProducts = lowStockProducts; }
    }
}