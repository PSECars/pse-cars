package com.psecars.merch.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@EnableCaching
@Profile("!prod")  // FIXED: Use for all profiles EXCEPT production (was only "dev")
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        // Simple in-memory cache manager for development and test
        return new ConcurrentMapCacheManager("products", "categories", "cart");
    }
}