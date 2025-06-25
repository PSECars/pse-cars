package com.psecars.merch.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;
    
    @Value("${app.cors.allowed-methods}")
    private String allowedMethods;
    
    @Value("${app.cors.allowed-headers}")
    private String allowedHeaders;
    
    @Value("${app.cors.allow-credentials}")
    private boolean allowCredentials;
    
    @Value("${app.cors.max-age}")
    private long maxAge;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        List<String> methods = Arrays.asList(allowedMethods.split(","));
        
        registry.addMapping("/**")
                .allowedOriginPatterns(origins.toArray(new String[0]))  // Use allowedOriginPatterns
                .allowedMethods(methods.toArray(new String[0]))
                .allowedHeaders(allowCredentials ? 
                    new String[]{"Accept", "Authorization", "Content-Type", "X-Requested-With", "X-CSRF-Token", "Cache-Control", "X-Api-Version"} :
                    new String[]{"*"})  // FIXED: Don't use "*" with credentials
                .allowCredentials(allowCredentials)
                .maxAge(maxAge);
    }
    
    @Bean
    public CorsFilter corsFilter() {
        return new CorsFilter(corsConfigurationSource());
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        
        // FIXED: Use allowedOriginPatterns instead of allowedOrigins when allowCredentials is true
        configuration.setAllowedOriginPatterns(origins);
        
        List<String> methods = Arrays.asList(allowedMethods.split(","));
        configuration.setAllowedMethods(methods);
        
        // FIXED: Handle headers properly - never use "*" with credentials
        if ("*".equals(allowedHeaders)) {
            if (allowCredentials) {
                // When credentials are enabled, specify headers explicitly
                configuration.setAllowedHeaders(Arrays.asList(
                    "Accept",
                    "Authorization", 
                    "Content-Type",
                    "X-Requested-With",
                    "X-CSRF-Token",
                    "Cache-Control",
                    "X-Api-Version"
                ));
            } else {
                configuration.addAllowedHeader("*");
            }
        } else {
            List<String> headers = Arrays.asList(allowedHeaders.split(","));
            configuration.setAllowedHeaders(headers);
        }
        
        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(maxAge);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}