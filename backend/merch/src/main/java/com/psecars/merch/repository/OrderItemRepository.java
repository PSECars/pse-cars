package com.psecars.merch.repository;

import com.psecars.merch.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByOrderId(Long orderId);
    
    List<OrderItem> findByProductId(Long productId);
    
    @Query("SELECT oi FROM OrderItem oi JOIN oi.order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    List<OrderItem> findItemsBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT oi.product.id, SUM(oi.quantity) FROM OrderItem oi " +
           "JOIN oi.order o WHERE o.status = 'DELIVERED' " +
           "GROUP BY oi.product.id ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findBestSellingProducts();
    
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.product.id = :productId")
    Long getTotalSoldQuantityByProduct(@Param("productId") Long productId);
}