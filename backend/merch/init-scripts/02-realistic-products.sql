-- 02-realistic-products.sql
-- Complete PSE Cars Merchandise Database Setup with Local Images
-- This script creates the complete schema and populates it with realistic data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in correct order (foreign keys first)
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create Categories Table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Products Table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    category_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create Product Images Table
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create Carts Table
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Create Cart Items Table
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(cart_id, product_id)
);

-- Create Orders Table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    shipping_address TEXT NOT NULL,
    billing_address TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Order Items Table
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Insert Categories
INSERT INTO categories (name, description) VALUES 
('Electronics', 'Cutting-edge automotive electronics and tech accessories for modern PSE Cars'),
('Apparel', 'Premium PSE Cars branded clothing and fashion accessories'),
('Collectibles', 'Exclusive limited edition PSE Cars collectible items and memorabilia'),
('Performance', 'High-performance automotive parts and tuning accessories'),
('Lifestyle', 'Daily lifestyle products featuring the iconic PSE Cars brand'),
('Accessories', 'Essential car accessories and interior enhancements');

-- ELECTRONICS CATEGORY PRODUCTS
INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Pro Dashboard Camera 4K', 
    'Professional-grade 4K dashboard camera with night vision, GPS tracking, and smartphone connectivity. Features collision detection, parking mode, and 170° wide-angle lens. Essential for PSE Cars owners who demand the best in vehicle security and monitoring.', 
    449.99, 
    35, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Electronics';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/dash-cam.webp' 
FROM products p WHERE p.name = 'PSE Pro Dashboard Camera 4K';

INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Wireless Charging Pad', 
    'Premium qi-enabled wireless charging pad designed specifically for PSE Cars interiors. Features anti-slip surface, LED charging indicators, and fast-charge capability up to 15W. Compatible with all modern smartphones and perfectly matches your PSE Cars aesthetic.', 
    89.99, 
    50, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Electronics';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/wireless-charging-pad.webp' 
FROM products p WHERE p.name = 'PSE Wireless Charging Pad';

INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Smart OBD Scanner', 
    'Advanced OBD-II diagnostic scanner with Bluetooth connectivity and dedicated PSE Cars app integration. Real-time engine diagnostics, performance monitoring, and maintenance alerts. Essential tool for PSE Cars enthusiasts and professional mechanics.', 
    199.99, 
    25, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Electronics';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/obd-scanner.webp' 
FROM products p WHERE p.name = 'PSE Smart OBD Scanner';

-- APPAREL CATEGORY PRODUCTS
INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Racing Team Jacket', 
    'Official PSE Cars racing team jacket featuring premium materials, water-resistant coating, and embroidered team logos. Includes ventilation zippers, multiple pockets, and reflective safety elements. Worn by professional PSE racing drivers worldwide.', 
    189.99, 
    40, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Apparel';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/racing-jacket.webp' 
FROM products p WHERE p.name = 'PSE Racing Team Jacket';

INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Premium Polo Shirt', 
    'Elegant polo shirt crafted from high-quality cotton blend with moisture-wicking technology. Features subtle PSE Cars embroidery, premium buttons, and comfortable athletic fit. Perfect for casual outings or PSE Cars events and gatherings.', 
    79.99, 
    60, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Apparel';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/premium-polo-shirt.webp' 
FROM products p WHERE p.name = 'PSE Premium Polo Shirt';

INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Classic Baseball Cap', 
    'Iconic PSE Cars baseball cap featuring adjustable strap, breathable mesh panels, and embroidered logo. Made from durable cotton twill with UV protection. A timeless accessory that represents the PSE Cars lifestyle and community.', 
    34.99, 
    80, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Apparel';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/baseball-cap.webp' 
FROM products p WHERE p.name = 'PSE Classic Baseball Cap';

-- COLLECTIBLES CATEGORY PRODUCTS
INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Heritage Model Car Collection 1:18', 
    'Limited edition 1:18 scale die-cast model featuring the iconic PSE Cars design. Hand-painted details, opening doors and hood, detailed engine bay, and premium display case included. Only 500 units produced worldwide. Certificate of authenticity included.', 
    149.99, 
    15, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Collectibles';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/model-car.webp' 
FROM products p WHERE p.name = 'PSE Heritage Model Car Collection 1:18';

INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Vintage Poster Set', 
    'Exclusive collection of three vintage-style PSE Cars racing posters featuring classic designs from the golden era of motorsport. High-quality prints on premium paper, ready for framing. Perfect for garages, offices, or any PSE Cars enthusiast space.', 
    59.99, 
    30, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Collectibles';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/vintage-poster-set.webp' 
FROM products p WHERE p.name = 'PSE Vintage Poster Set';

-- PERFORMANCE CATEGORY PRODUCTS
INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Performance Air Filter', 
    'High-flow performance air filter engineered specifically for PSE Cars engines. Increases horsepower and torque while improving fuel efficiency. Washable and reusable design with lifetime warranty. Professional installation recommended.', 
    129.99, 
    20, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Performance';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/air-filter.webp' 
FROM products p WHERE p.name = 'PSE Performance Air Filter';

INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Sport Exhaust System', 
    'Premium sport exhaust system delivering enhanced performance and distinctive PSE Cars sound signature. Constructed from high-grade stainless steel with ceramic coating. Improves power output while maintaining emissions compliance.', 
    899.99, 
    12, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Performance';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/exhaust-system.webp' 
FROM products p WHERE p.name = 'PSE Sport Exhaust System';

-- LIFESTYLE CATEGORY PRODUCTS
INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Travel Mug Set', 
    'Premium stainless steel travel mug set featuring double-wall insulation and leak-proof design. Keeps beverages hot for 8 hours or cold for 12 hours. Includes PSE Cars logo laser engraving and comes in an elegant gift box.', 
    49.99, 
    45, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Lifestyle';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/mug-set.webp' 
FROM products p WHERE p.name = 'PSE Travel Mug Set';

INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Leather Wallet', 
    'Handcrafted genuine leather wallet featuring the PSE Cars logo embossed in gold. Multiple card slots, cash compartment, and RFID blocking technology for security. Comes in premium gift packaging, perfect for PSE Cars enthusiasts.', 
    89.99, 
    35, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Lifestyle';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/leather-wallet.webp' 
FROM products p WHERE p.name = 'PSE Leather Wallet';

-- ACCESSORIES CATEGORY PRODUCTS
INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Premium Floor Mats', 
    'Custom-fit all-weather floor mats designed specifically for PSE Cars models. Durable rubber construction with raised edges for maximum protection. Features PSE Cars logo and non-slip backing. Easy to clean and maintain.', 
    159.99, 
    28, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Accessories';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/floor-mat.webp' 
FROM products p WHERE p.name = 'PSE Premium Floor Mats';

INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Steering Wheel Cover', 
    'Luxurious leather steering wheel cover with PSE Cars embossing. Provides enhanced grip and comfort during driving. Easy installation with no modifications required. Available in black with contrasting stitching that matches PSE Cars interior design.', 
    69.99, 
    40, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Accessories';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/steering-wheel-cover.webp' 
FROM products p WHERE p.name = 'PSE Steering Wheel Cover';

INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Key Fob Leather Case', 
    'Premium leather protective case for PSE Cars key fobs. Handcrafted from genuine leather with precise cutouts for all buttons and features. Includes detachable key ring and comes in elegant PSE Cars packaging.', 
    39.99, 
    55, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Accessories';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/key-cover.webp' 
FROM products p WHERE p.name = 'PSE Key Fob Leather Case';

-- Add some seasonal/special products
INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Limited Edition Hoodie', 
    'Exclusive limited edition hoodie celebrating PSE Cars heritage. Premium cotton blend with embroidered vintage logos, kangaroo pocket, and adjustable drawstring hood. Only 200 pieces available worldwide. Includes numbered certificate of authenticity.', 
    119.99, 
    18, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Apparel';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/hoodie.webp' 
FROM products p WHERE p.name = 'PSE Limited Edition Hoodie';

INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Car Care Kit', 
    'Complete professional car care kit with PSE Cars branded microfiber cloths, premium car wash soap, tire shine, interior cleaner, and applicator pads. Everything needed to keep your PSE Cars looking showroom fresh.', 
    79.99, 
    32, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Accessories';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/care-kit.webp' 
FROM products p WHERE p.name = 'PSE Car Care Kit';

-- Add one premium/luxury item
INSERT INTO products (name, description, price, stock_quantity, category_id, created_at, updated_at) 
SELECT 
    'PSE Titanium Watch', 
    'Exclusive PSE Cars titanium chronograph watch with Swiss movement. Features racing-inspired design, sapphire crystal, and water resistance to 100m. Limited production of only 100 pieces. Includes premium presentation box and lifetime warranty.', 
    1299.99, 
    8, 
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Collectibles';

INSERT INTO product_images (product_id, image_url) 
SELECT p.id, '/images/products/titanium-watch.webp' 
FROM products p WHERE p.name = 'PSE Titanium Watch';

-- Insert some sample data for testing orders and carts
INSERT INTO carts (session_id, user_id, created_at, expires_at) VALUES 
('demo-session-1', 'demo-user-1', NOW(), NOW() + INTERVAL '7 days'),
('demo-session-2', 'demo-user-2', NOW(), NOW() + INTERVAL '7 days');

-- Add sample cart items
INSERT INTO cart_items (cart_id, product_id, quantity, price) 
SELECT 1, p.id, 2, p.price FROM products p WHERE p.name = 'PSE Classic Baseball Cap';

INSERT INTO cart_items (cart_id, product_id, quantity, price) 
SELECT 1, p.id, 1, p.price FROM products p WHERE p.name = 'PSE Wireless Charging Pad';

-- Summary information
SELECT 
    'Database initialization completed successfully' as status,
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM product_images) as images_count,
    (SELECT COUNT(*) FROM carts) as carts_count,
    (SELECT COUNT(*) FROM cart_items) as cart_items_count;