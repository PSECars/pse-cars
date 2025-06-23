package com.psecars.merch.repository;

import com.psecars.merch.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    Optional<Cart> findBySessionId(String sessionId);
    
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems ci LEFT JOIN FETCH ci.product WHERE c.sessionId = :sessionId")
    Optional<Cart> findBySessionIdWithItems(@Param("sessionId") String sessionId);
    
    @Query("SELECT c FROM Cart c WHERE c.expiresAt < :currentTime")
    List<Cart> findExpiredCarts(@Param("currentTime") LocalDateTime currentTime);
    
    @Query("SELECT c FROM Cart c WHERE c.updatedAt < :cutoffTime")
    List<Cart> findInactiveCarts(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    void deleteBySessionId(String sessionId);
    
    void deleteByExpiresAtBefore(LocalDateTime currentTime);
    
    boolean existsBySessionId(String sessionId);
    
    @Query("SELECT COUNT(ci) FROM Cart c JOIN c.cartItems ci WHERE c.sessionId = :sessionId")
    Integer getCartItemCount(@Param("sessionId") String sessionId);
    
    @Query("SELECT SUM(ci.quantity) FROM Cart c JOIN c.cartItems ci WHERE c.sessionId = :sessionId")
    Integer getTotalItemQuantity(@Param("sessionId") String sessionId);
}