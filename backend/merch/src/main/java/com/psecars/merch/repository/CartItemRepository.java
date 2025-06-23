package com.psecars.merch.repository;

import com.psecars.merch.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByCartId(Long cartId);
    
    List<CartItem> findByCartSessionId(String sessionId);
    
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.sessionId = :sessionId AND ci.product.id = :productId")
    Optional<CartItem> findBySessionIdAndProductId(@Param("sessionId") String sessionId, 
                                                   @Param("productId") Long productId);
    
    @Query("SELECT ci FROM CartItem ci JOIN ci.product p WHERE ci.cart.sessionId = :sessionId AND p.stockQuantity < ci.quantity")
    List<CartItem> findUnavailableItemsBySessionId(@Param("sessionId") String sessionId);
    
    @Modifying
    void deleteByCartId(Long cartId);
    
    @Modifying
    void deleteByCartSessionId(String sessionId);
    
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.sessionId = :sessionId AND ci.product.id = :productId")
    void deleteBySessionIdAndProductId(@Param("sessionId") String sessionId, @Param("productId") Long productId);
    
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.cart.sessionId = :sessionId")
    Integer countBySessionId(@Param("sessionId") String sessionId);
    
    @Query("SELECT SUM(ci.quantity) FROM CartItem ci WHERE ci.cart.sessionId = :sessionId")
    Integer sumQuantityBySessionId(@Param("sessionId") String sessionId);
}