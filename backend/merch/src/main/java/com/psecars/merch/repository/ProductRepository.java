package com.psecars.merch.repository;

import com.psecars.merch.entity.Product;
import com.psecars.merch.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Existing category methods
    Page<Product> findByCategory(Category category, Pageable pageable);
    
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    
    // Existing availability methods
    @Query("SELECT p FROM Product p WHERE p.stockQuantity > 0")
    Page<Product> findAvailableProducts(Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.stockQuantity > 0")
    Page<Product> findAvailableProductsByCategory(@Param("categoryId") Long categoryId, Pageable pageable);
    
    // Existing search methods
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Product> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // NEW: Price filtering methods
    @Query("SELECT p FROM Product p WHERE " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> findByPriceRange(@Param("minPrice") BigDecimal minPrice, 
                                   @Param("maxPrice") BigDecimal maxPrice, 
                                   Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> findByCategoryAndPriceRange(@Param("categoryId") Long categoryId,
                                              @Param("minPrice") BigDecimal minPrice, 
                                              @Param("maxPrice") BigDecimal maxPrice, 
                                              Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> findByKeywordAndPriceRange(@Param("keyword") String keyword,
                                             @Param("minPrice") BigDecimal minPrice, 
                                             @Param("maxPrice") BigDecimal maxPrice, 
                                             Pageable pageable);
    
    // Existing utility methods
    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= :threshold")
    List<Product> findLowStockProducts(@Param("threshold") Integer threshold);
    
    Optional<Product> findByIdAndStockQuantityGreaterThan(Long id, Integer stockQuantity);
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId")
    Long countByCategory(@Param("categoryId") Long categoryId);
}