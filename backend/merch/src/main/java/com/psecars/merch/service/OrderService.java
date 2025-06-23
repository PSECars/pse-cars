package com.psecars.merch.service;

import com.psecars.merch.entity.Order;
import com.psecars.merch.entity.OrderItem;
import com.psecars.merch.entity.OrderStatus;
import com.psecars.merch.entity.Product;
import com.psecars.merch.entity.Cart;
import com.psecars.merch.entity.CartItem;
import com.psecars.merch.repository.OrderRepository;
import com.psecars.merch.repository.OrderItemRepository;
import com.psecars.merch.dto.CreateOrderRequest;
import com.psecars.merch.dto.OrderItemRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductService productService;
    private final CartService cartService;
    
    @Autowired
    public OrderService(OrderRepository orderRepository, 
                       OrderItemRepository orderItemRepository,
                       ProductService productService,
                       CartService cartService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productService = productService;
        this.cartService = cartService;
    }
    
    @Transactional(readOnly = true)
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Order> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Order> getOrdersByCustomer(String customerEmail, Pageable pageable) {
        return orderRepository.findByCustomerEmailOrderByCreatedAtDesc(customerEmail, pageable);
    }
    
    @Transactional(readOnly = true)
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findByIdWithItems(id);
    }
    
    public Order createOrderFromCart(String sessionId) {
        Cart cart = cartService.getCartForCheckout(sessionId);
        
        if (cart.getCustomerEmail() == null || cart.getCustomerName() == null) {
            throw new RuntimeException("Customer information is required for checkout");
        }
        
        Order order = new Order(cart.getCustomerEmail(), 
                               cart.getCustomerName(), 
                               cart.getCustomerAddress());
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            
            if (!productService.isProductAvailable(product.getId(), cartItem.getQuantity())) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            if (!productService.reduceStock(product.getId(), cartItem.getQuantity())) {
                throw new RuntimeException("Failed to reduce stock for product: " + product.getName());
            }
            
            OrderItem orderItem = new OrderItem(order, product, cartItem.getQuantity(), cartItem.getPrice());
            order.getOrderItems().add(orderItem);
            
            totalAmount = totalAmount.add(orderItem.getSubtotal());
        }
        
        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        
        cartService.clearCart(sessionId);
        
        return savedOrder;
    }
    
    public Order createOrder(CreateOrderRequest request) {
        Order order = new Order(request.getCustomerEmail(), 
                               request.getCustomerName(), 
                               request.getCustomerAddress());
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        for (OrderItemRequest itemRequest : request.getOrderItems()) {
            Product product = productService.getProductById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));
            
            if (!productService.isProductAvailable(itemRequest.getProductId(), itemRequest.getQuantity())) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            if (!productService.reduceStock(itemRequest.getProductId(), itemRequest.getQuantity())) {
                throw new RuntimeException("Failed to reduce stock for product: " + product.getName());
            }
            
            OrderItem orderItem = new OrderItem(order, product, itemRequest.getQuantity(), product.getPrice());
            order.getOrderItems().add(orderItem);
            
            totalAmount = totalAmount.add(orderItem.getSubtotal());
        }
        
        order.setTotalAmount(totalAmount);
        return orderRepository.save(order);
    }
    
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
    
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.SHIPPED) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }
        
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
    
    @Transactional(readOnly = true)
    public List<Order> getOrdersBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findOrdersBetweenDates(startDate, endDate);
    }
    
    @Transactional(readOnly = true)
    public Long getOrderCountByStatus(OrderStatus status) {
        return orderRepository.countByStatus(status);
    }
}