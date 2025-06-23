echo "📊 PSE Cars Merchandise Service Monitor"
echo "======================================"

while true; do
    clear
    echo "📊 PSE Cars Merchandise Service Monitor - $(date)"
    echo "=============================================="
    
    # Service status
    echo ""
    echo "🐳 Container Status:"
    docker-compose ps
    
    echo ""
    echo "🏥 Health Status:"
    if curl -f -s http://localhost:8083/merch/actuator/health > /dev/null; then
        echo "✅ Application: HEALTHY"
    else
        echo "❌ Application: DOWN"
    fi
    
    if docker-compose exec merch-db pg_isready -U merch_user -d merch_db 2>/dev/null; then
        echo "✅ PostgreSQL: HEALTHY"
    else
        echo "❌ PostgreSQL: DOWN"
    fi
    
    if docker-compose exec merch-redis redis-cli ping 2>/dev/null | grep -q PONG; then
        echo "✅ Redis: HEALTHY"
    else
        echo "❌ Redis: DOWN"
    fi
    
    # Resource usage
    echo ""
    echo "💻 Resource Usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" merch-service merch-postgres merch-redis 2>/dev/null || echo "Could not get stats"
    
    # Database info
    echo ""
    echo "📊 Database Info:"
    PRODUCT_COUNT=$(curl -s http://localhost:8083/merch/api/products 2>/dev/null | jq '.data.totalElements' 2>/dev/null || echo "N/A")
    echo "Products: $PRODUCT_COUNT"
    
    echo ""
    echo "Press Ctrl+C to stop monitoring..."
    sleep 5
done