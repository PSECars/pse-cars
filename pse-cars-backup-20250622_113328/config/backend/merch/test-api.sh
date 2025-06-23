#!/bin/bash
echo "🧪 Testing PSE Cars Merchandise API..."
echo ""

BASE_URL="http://localhost:8083/merch"

echo "1. Health Check:"
curl -s "$BASE_URL/actuator/health" | head -1
echo ""

echo "2. Get Categories:"
curl -s "$BASE_URL/api/categories" | head -1
echo ""

echo "3. Get Products:"
curl -s "$BASE_URL/api/products" | head -1
echo ""

echo "4. Get Cart Summary:"
curl -s "$BASE_URL/api/cart/summary" | head -1
echo ""

echo "✅ API tests completed!"
