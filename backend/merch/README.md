# PSE Cars Merchandise Backend

Complete Spring Boot microservice for managing merchandise shop with shopping cart functionality.

## 🚀 Quick Start

### Development Mode (H2 Database)
```bash
cd backend/merch
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Production Mode (PostgreSQL + Redis)
```bash
cd backend/merch
docker-compose up -d
```

## 📊 API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `GET /api/products/category/{categoryId}` - Products by category
- `GET /api/products/search?keyword=...` - Search products

### Shopping Cart
- `GET /api/cart` - Get current cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{productId}` - Update item quantity
- `DELETE /api/cart/items/{productId}` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders/from-cart` - Create order from cart
- `GET /api/orders` - List orders
- `GET /api/orders/{id}` - Get order details

### Categories
- `GET /api/categories` - List all categories

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats

## 🔍 Health Check
http://localhost:8083/merch/actuator/health

## 🛠️ Development Database Console
http://localhost:8083/merch/h2-console (dev profile only)

## ✨ Features
- ✅ Product catalog with categories
- ✅ Session-based shopping cart
- ✅ Order management system  
- ✅ Redis caching for performance
- ✅ Stock management and validation
- ✅ Admin dashboard functionality
- ✅ Docker containerization
- ✅ Comprehensive error handling
- ✅ API documentation

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:8083/merch/actuator/health

# Get all products
curl http://localhost:8083/merch/api/products

# Get categories
curl http://localhost:8083/merch/api/categories

# Add item to cart
curl -X POST http://localhost:8083/merch/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'

# Get cart
curl http://localhost:8083/merch/api/cart
```

## 📦 Dependencies
- Java 17+
- Maven 3.6+
- PostgreSQL 15+ (production)
- Redis 7+ (production)
- Docker & Docker Compose (optional)
