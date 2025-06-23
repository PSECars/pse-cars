#!/bin/bash

# Volume Restoration Script
# Generated: 20250622_113328

echo "🔄 Restoring PSE Cars volumes..."

# Stop services first
echo "⏹️  Stopping services..."
cd "$(dirname "$0")/../../backend/merch"
docker compose down

# Restore volumes
echo "💾 Restoring volume data..."
cd "$(dirname "$0")/../volumes"

for archive in volume_*_data.tar.gz; do
    if [[ -f "$archive" ]]; then
        volume_name=$(echo $archive | sed 's/volume_\(.*\)_data\.tar\.gz/\1/')
        echo "  📦 Restoring volume: $volume_name"
        
        # Create volume if it doesn't exist
        docker volume create $volume_name 2>/dev/null || true
        
        # Restore data
        docker run --rm -v $volume_name:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/$archive"
    fi
done

echo "✅ Volume restoration completed!"
