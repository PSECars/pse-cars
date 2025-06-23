echo " Quick PSE Cars Merchandise API Test"
echo "======================================"

BASE_URL="http://localhost:8083/merch"

echo ""
echo "1.  Health Check:"
curl -s "$BASE_URL/actuator/health" | jq '.' || echo " Health check failed"

echo ""
echo "2.  Categories:"
curl -s "$BASE_URL/api/categories" | jq '.data[] | {id, name, description}' || echo " Categories failed"

echo ""
echo "3.  Products (first 3):"
curl -s "$BASE_URL/api/products?size=3" | jq '.data.content[] | {id, name, price, stockQuantity}' || echo " Products failed"

echo ""
echo "4.  Cart Summary:"
curl -s "$BASE_URL/api/cart/summary" | jq '.' || echo " Cart failed"

echo ""
echo "5.  Product Count:"
TOTAL=$(curl -s "$BASE_URL/api/products" | jq '.data.totalElements')
echo "Total products: $TOTAL"

echo ""
echo " API test completed!"
