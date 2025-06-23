set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║               PSE CARS MERCHANDISE DEPLOYMENT                   ║"
    echo "║                Production PostgreSQL + Redis                    ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed!"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed!"
        exit 1
    fi
    
    print_status "Prerequisites check passed"
}

# Create directory structure
setup_directories() {
    print_info "Setting up directory structure..."
    
    mkdir -p init-scripts
    mkdir -p logs
    mkdir -p data/postgres
    mkdir -p data/redis
    
    print_status "Directory structure created"
}

# Deploy the enhanced data
deploy_data() {
    print_info "Deploying enhanced product data..."
    
    # Ensure init scripts are in place
    if [ ! -f "init-scripts/01-init-db.sql" ]; then
        print_warning "Original init script not found, creating basic one..."
        cat > init-scripts/01-init-db.sql << 'EOF'
-- Basic schema initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF
    fi
    
    if [ ! -f "init-scripts/02-realistic-products.sql" ]; then
        print_error "Enhanced product data script not found!"
        print_info "Please copy the 02-realistic-products.sql from the artifacts"
        exit 1
    fi
    
    print_status "Data scripts ready"
}

# Start services
start_services() {
    print_info "Starting PostgreSQL and Redis services..."
    
    # Stop any existing services
    docker-compose down --remove-orphans
    
    # Start with production profile
    export SPRING_PROFILES_ACTIVE=prod
    docker-compose up -d merch-db merch-redis
    
    print_info "Waiting for databases to be ready..."
    sleep 30
    
    # Check database health
    if docker-compose exec merch-db pg_isready -U merch_user -d merch_db; then
        print_status "PostgreSQL is ready"
    else
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    
    # Check Redis health
    if docker-compose exec merch-redis redis-cli ping | grep -q PONG; then
        print_status "Redis is ready"
    else
        print_error "Redis failed to start"
        exit 1
    fi
}

# Start the Spring Boot service
start_application() {
    print_info "Starting PSE Cars Merchandise Service..."
    
    docker-compose up -d merch-service
    
    print_info "Waiting for application to start..."
    sleep 45
    
    # Wait for health check
    for i in {1..12}; do
        if curl -f -s http://localhost:8083/merch/actuator/health > /dev/null; then
            print_status "Application is healthy"
            break
        else
            print_info "Waiting for application... ($i/12)"
            sleep 10
        fi
        
        if [ $i -eq 12 ]; then
            print_error "Application failed to start properly"
            print_info "Check logs with: docker-compose logs merch-service"
            exit 1
        fi
    done
}

# Test the deployment
test_deployment() {
    print_info "Testing deployment..."
    
    # Test health endpoint
    if curl -f -s http://localhost:8083/merch/actuator/health | grep -q '"status":"UP"'; then
        print_status "Health check passed"
    else
        print_error "Health check failed"
        return 1
    fi
    
    # Test categories endpoint
    if curl -f -s http://localhost:8083/merch/api/categories | grep -q '"success":true'; then
        print_status "Categories API working"
    else
        print_error "Categories API failed"
        return 1
    fi
    
    # Test products endpoint
    if curl -f -s http://localhost:8083/merch/api/products | grep -q '"success":true'; then
        print_status "Products API working"
    else
        print_error "Products API failed"
        return 1
    fi
    
    # Count products
    PRODUCT_COUNT=$(curl -s http://localhost:8083/merch/api/products | grep -o '"totalElements":[0-9]*' | cut -d: -f2)
    if [ "$PRODUCT_COUNT" -gt 0 ]; then
        print_status "Found $PRODUCT_COUNT products in database"
    else
        print_warning "No products found - data may not have loaded"
    fi
}

# Show deployment info
show_info() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  🎉 DEPLOYMENT SUCCESSFUL! 🎉                   ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📊 Service Information:${NC}"
    echo -e "${GREEN}   🐘 PostgreSQL: localhost:5433${NC}"
    echo -e "${GREEN}   🔴 Redis: localhost:6380${NC}"
    echo -e "${GREEN}   🚀 Merchandise API: http://localhost:8083/merch${NC}"
    echo ""
    echo -e "${BLUE}🔗 Useful URLs:${NC}"
    echo -e "${GREEN}   📊 Health Check: http://localhost:8083/merch/actuator/health${NC}"
    echo -e "${GREEN}   📦 Products API: http://localhost:8083/merch/api/products${NC}"
    echo -e "${GREEN}   🏷️ Categories API: http://localhost:8083/merch/api/categories${NC}"
    echo -e "${GREEN}   🛒 Cart API: http://localhost:8083/merch/api/cart/summary${NC}"
    echo ""
    echo -e "${BLUE}🛠️ Management Tools (optional):${NC}"
    echo -e "${YELLOW}   Start with: docker-compose --profile tools up -d${NC}"
    echo -e "${GREEN}   🔧 pgAdmin: http://localhost:8082 (admin@psecars.com / admin123)${NC}"
    echo -e "${GREEN}   🔧 Redis Commander: http://localhost:8081 (admin / admin123)${NC}"
    echo ""
    echo -e "${BLUE}📋 Useful Commands:${NC}"
    echo -e "${GREEN}   View logs: docker-compose logs -f merch-service${NC}"
    echo -e "${GREEN}   Stop all: docker-compose down${NC}"
    echo -e "${GREEN}   Restart: docker-compose restart merch-service${NC}"
    echo ""
    echo -e "${PURPLE}🛒 Your PSE Cars Merchandise Store is ready for production! 🚗✨${NC}"
}

# Main deployment flow
main() {
    print_header
    
    check_prerequisites
    setup_directories
    deploy_data
    start_services
    start_application
    
    if test_deployment; then
        show_info
    else
        print_error "Deployment test failed"
        print_info "Check logs with: docker-compose logs"
        exit 1
    fi
}

# Run main function
main "$@"
