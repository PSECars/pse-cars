#!/bin/bash
# PSE Cars Merchandise - Minimal Setup
# Creates directory structure, empty files, and installs dependencies only

set -e

# Check if we're in a Next.js project
if [ ! -f "package.json" ] || ! grep -q "next" package.json; then
    echo "❌ Error: Run this from your Next.js project root"
    exit 1
fi

echo "🚀 Creating PSE Cars Merchandise structure..."

# Create directories
mkdir -p app/merchandise/\[id\]
mkdir -p components/merchandise
mkdir -p hooks
mkdir -p types
mkdir -p lib

# Create empty files
touch types/merchandise.ts
touch lib/api.ts
touch hooks/useProducts.ts
touch hooks/useCategories.ts
touch hooks/useCart.ts
touch components/merchandise/ProductCard.tsx
touch components/merchandise/ProductFilter.tsx
touch components/merchandise/ProductGrid.tsx
touch components/merchandise/Pagination.tsx
touch components/merchandise/CartSidebar.tsx
touch app/merchandise/page.tsx
touch app/merchandise/\[id\]/page.tsx

# Install dependencies
npm install @tabler/icons-react

echo "✅ Structure created, dependencies installed"
echo "📁 Ready for file content copying!"