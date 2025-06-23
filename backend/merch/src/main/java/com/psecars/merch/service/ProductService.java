package com.psecars.merch.service;

import com.psecars.merch.entity.Product;
import com.psecars.merch.entity.Category;
import com.psecars.merch.repository.ProductRepository;
import com.psecars.merch.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    
    @Autowired
    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }
    
    // Existing core methods
    @Transactional(readOnly = true)
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Product> getAvailableProducts(Pageable pageable) {
        return productRepository.findAvailableProducts(pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Product> searchProducts(String keyword, Pageable pageable) {
        return productRepository.findByKeyword(keyword, pageable);
    }
    
    @Transactional(readOnly = true)
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    // NEW: Price filtering methods
    @Transactional(readOnly = true)
    public Page<Product> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByPriceRange(minPrice, maxPrice, pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Product> getProductsByCategoryAndPriceRange(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByCategoryAndPriceRange(categoryId, minPrice, maxPrice, pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Product> searchProductsByPriceRange(String keyword, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByKeywordAndPriceRange(keyword, minPrice, maxPrice, pageable);
    }
    
    // Existing utility methods
    @Transactional(readOnly = true)
    public boolean isProductAvailable(Long productId, Integer quantity) {
        return productRepository.findByIdAndStockQuantityGreaterThan(productId, quantity - 1).isPresent();
    }
    
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
    
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setStockQuantity(productDetails.getStockQuantity());
        
        if (productDetails.getCategory() != null) {
            product.setCategory(productDetails.getCategory());
        }
        
        if (productDetails.getImageUrls() != null) {
            product.setImageUrls(productDetails.getImageUrls());
        }
        
        return productRepository.save(product);
    }
    
    public Product updateStock(Long productId, Integer newStock) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        product.setStockQuantity(newStock);
        return productRepository.save(product);
    }
    
    public boolean reduceStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        if (product.getStockQuantity() >= quantity) {
            product.setStockQuantity(product.getStockQuantity() - quantity);
            productRepository.save(product);
            return true;
        }
        return false;
    }
    
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public List<Product> getLowStockProducts(Integer threshold) {
        return productRepository.findLowStockProducts(threshold);
    }
}