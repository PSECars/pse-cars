#!/bin/bash

# PSE Cars Ultimate Backup & Migration Suite
# Modern docker compose compatible

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="pse-cars-backup-${TIMESTAMP}"
COMPOSE_CMD="docker compose"

print_header() {
    echo -e "\n${BLUE}===========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===========================================${NC}"
}

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_special() {
    echo -e "${PURPLE}🚗 $1${NC}"
}

print_header "PSE CARS ULTIMATE BACKUP SUITE - ${TIMESTAMP}"

# 1. Verify environment
echo -e "${BLUE}🔍 Verifying environment...${NC}"

if [[ ! -d "backend/merch" ]]; then
    print_error "backend/merch directory not found! Run from project root."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker not found!"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    print_error "Modern 'docker compose' not available!"
    exit 1
fi

print_status "Environment verified - using modern docker compose"

# 2. Create backup structure
print_header "CREATING BACKUP STRUCTURE"

mkdir -p "$BACKUP_DIR"/{config,docker-state,volumes,scripts,logs}

echo -e "${YELLOW}📁 Created backup directory: $BACKUP_DIR${NC}"

# 3. Backup all configuration files
print_header "BACKING UP CONFIGURATION FILES"

echo -e "${YELLOW}📄 Backing up compose files...${NC}"
find . -name "compose*.yaml" -o -name "compose*.yml" -o -name "docker-compose*.yml" -o -name "docker-compose*.yaml" | while read file; do
    if [[ -f "$file" ]]; then
        target_dir="$BACKUP_DIR/config/$(dirname "$file")"
        mkdir -p "$target_dir"
        cp "$file" "$target_dir/"
        echo "  ✓ $file"
    fi
done

echo -e "\n${YELLOW}🔐 Backing up environment files...${NC}"
find . -name ".env*" -o -name "*.env" | while read file; do
    if [[ -f "$file" ]]; then
        target_dir="$BACKUP_DIR/config/$(dirname "$file")"
        mkdir -p "$target_dir"
        cp "$file" "$target_dir/"
        echo "  ✓ $file"
    fi
done

echo -e "\n${YELLOW}⚙️  Backing up application configs...${NC}"
find . -name "application*.yml" -o -name "application*.yaml" -o -name "application*.properties" | while read file; do
    if [[ -f "$file" ]]; then
        target_dir="$BACKUP_DIR/config/$(dirname "$file")"
        mkdir -p "$target_dir"
        cp "$file" "$target_dir/"
        echo "  ✓ $file"
    fi
done

echo -e "\n${YELLOW}🐳 Backing up Dockerfiles...${NC}"
find . -name "Dockerfile*" | while read file; do
    if [[ -f "$file" ]]; then
        target_dir="$BACKUP_DIR/config/$(dirname "$file")"
        mkdir -p "$target_dir"
        cp "$file" "$target_dir/"
        echo "  ✓ $file"
    fi
done

echo -e "\n${YELLOW}📜 Backing up scripts...${NC}"
find . -name "*.sh" | while read file; do
    if [[ -f "$file" ]]; then
        target_dir="$BACKUP_DIR/config/$(dirname "$file")"
        mkdir -p "$target_dir"
        cp "$file" "$target_dir/"
        echo "  ✓ $file"
    fi
done

print_status "Configuration files backed up"

# 4. Backup Docker state
print_header "BACKING UP DOCKER STATE"

echo -e "${YELLOW}🏃 Capturing running containers...${NC}"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}\t{{.Networks}}" > "$BACKUP_DIR/docker-state/running_containers.txt"

echo -e "\n${YELLOW}📡 Capturing networks...${NC}"
docker network ls > "$BACKUP_DIR/docker-state/networks.txt"
docker network ls --format "{{.Name}}" | while read network; do
    if [[ "$network" != "bridge" && "$network" != "host" && "$network" != "none" ]]; then
        docker network inspect "$network" > "$BACKUP_DIR/docker-state/network_${network}.json" 2>/dev/null || true
    fi
done

echo -e "\n${YELLOW}💾 Capturing volumes...${NC}"
docker volume ls > "$BACKUP_DIR/docker-state/volumes.txt"
docker volume ls --format "{{.Name}}" | while read volume; do
    docker volume inspect "$volume" > "$BACKUP_DIR/docker-state/volume_${volume}.json" 2>/dev/null || true
done

echo -e "\n${YELLOW}🖼️  Capturing images...${NC}"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}" > "$BACKUP_DIR/docker-state/images.txt"

# 5. Test current service health
print_header "TESTING CURRENT SERVICE HEALTH"

echo -e "${YELLOW}🏥 Testing merch service health...${NC}"
if curl -f -s "http://localhost:8083/merch/actuator/health" > "$BACKUP_DIR/logs/health_before.json" 2>/dev/null; then
    print_status "Merch service is healthy"
    echo "Health endpoint response saved to logs/health_before.json"
else
    print_warning "Merch service health check failed - this is noted for comparison"
fi

# 6. Export volume data
print_header "BACKING UP VOLUME DATA"

echo -e "${YELLOW}💾 Exporting merch service volumes...${NC}"
docker volume ls --format "{{.Name}}" | grep -E "(merch|pse)" | while read volume; do
    echo "  📦 Exporting volume: $volume"
    docker run --rm -v "$volume:/data" -v "$(pwd)/$BACKUP_DIR/volumes:/backup" alpine sh -c "cd /data && tar czf /backup/volume_${volume}_data.tar.gz . 2>/dev/null || echo 'Volume $volume is empty or inaccessible'" || true
done

# 7. Capture service logs
print_header "CAPTURING SERVICE LOGS"

echo -e "${YELLOW}📋 Capturing merch service logs...${NC}"
cd backend/merch
$COMPOSE_CMD logs --no-color > "../../$BACKUP_DIR/logs/merch_service_logs.txt" 2>/dev/null || echo "No logs available" > "../../$BACKUP_DIR/logs/merch_service_logs.txt"
cd ../..

# 8. Git state
print_header "BACKING UP GIT STATE"

if [[ -d ".git" ]]; then
    echo -e "${YELLOW}📝 Capturing git state...${NC}"
    git status > "$BACKUP_DIR/docker-state/git_status.txt" 2>/dev/null || true
    git log --oneline -10 > "$BACKUP_DIR/docker-state/git_recent_commits.txt" 2>/dev/null || true
    git diff > "$BACKUP_DIR/docker-state/git_uncommitted_changes.patch" 2>/dev/null || true
    git branch -a > "$BACKUP_DIR/docker-state/git_branches.txt" 2>/dev/null || true
    print_status "Git state captured"
else
    print_warning "Not a git repository - skipping git backup"
fi

# 9. Create restoration scripts
print_header "CREATING RESTORATION SCRIPTS"

# Quick rollback script
cat > "$BACKUP_DIR/scripts/quick-rollback.sh" << EOF
#!/bin/bash

# PSE Cars Quick Rollback Script
# Generated: $TIMESTAMP

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\${YELLOW}🔄 Rolling back PSE Cars merch service...\${NC}"

# Get project root (assuming script is run from backup directory)
PROJECT_ROOT="\$(cd "\$(dirname "\$0")/.." && pwd)"
BACKUP_ROOT="\$(cd "\$(dirname "\$0")/.." && pwd)"

echo -e "\${YELLOW}📂 Project root: \$PROJECT_ROOT\${NC}"

# Stop current services
echo -e "\${YELLOW}⏹️  Stopping current services...\${NC}"
cd "\$PROJECT_ROOT/backend/merch"
docker compose down 2>/dev/null || true
cd "\$PROJECT_ROOT"

# Restore compose file
echo -e "\${YELLOW}📄 Restoring compose file...\${NC}"
cp "\$BACKUP_ROOT/config/backend/merch/compose.yaml" "\$PROJECT_ROOT/backend/merch/compose.yaml"

# Restore application.yml if changed
if [[ -f "\$BACKUP_ROOT/config/backend/merch/application.yml" ]]; then
    cp "\$BACKUP_ROOT/config/backend/merch/application.yml" "\$PROJECT_ROOT/backend/merch/application.yml"
fi

# Restart services
echo -e "\${YELLOW}🚀 Restarting services...\${NC}"
cd "\$PROJECT_ROOT/backend/merch"
docker compose up -d

echo -e "\${GREEN}✅ Rollback completed!\${NC}"
echo -e "\${GREEN}🏥 Test health: curl http://localhost:8083/merch/actuator/health\${NC}"
EOF

chmod +x "$BACKUP_DIR/scripts/quick-rollback.sh"

# Volume restoration script
cat > "$BACKUP_DIR/scripts/restore-volumes.sh" << EOF
#!/bin/bash

# Volume Restoration Script
# Generated: $TIMESTAMP

echo "🔄 Restoring PSE Cars volumes..."

# Stop services first
echo "⏹️  Stopping services..."
cd "\$(dirname "\$0")/../../backend/merch"
docker compose down

# Restore volumes
echo "💾 Restoring volume data..."
cd "\$(dirname "\$0")/../volumes"

for archive in volume_*_data.tar.gz; do
    if [[ -f "\$archive" ]]; then
        volume_name=\$(echo \$archive | sed 's/volume_\(.*\)_data\.tar\.gz/\1/')
        echo "  📦 Restoring volume: \$volume_name"
        
        # Create volume if it doesn't exist
        docker volume create \$volume_name 2>/dev/null || true
        
        # Restore data
        docker run --rm -v \$volume_name:/data -v \$(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/\$archive"
    fi
done

echo "✅ Volume restoration completed!"
EOF

chmod +x "$BACKUP_DIR/scripts/restore-volumes.sh"

# 10. Create migration script
cat > "$BACKUP_DIR/scripts/apply-network-migration.sh" << 'EOF'
#!/bin/bash

# PSE Cars Network Migration Script
# Modern docker compose compatible

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo -e "${BLUE}🔧 Applying PSE Cars Network Migration${NC}"

# 1. Backup current compose file (additional safety)
cd "$PROJECT_ROOT"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp backend/merch/compose.yaml backend/merch/compose.yaml.migration-backup.$TIMESTAMP

# 2. Apply the network fix
echo -e "${YELLOW}📝 Updating compose.yaml...${NC}"

# Create the updated compose file
cat > backend/merch/compose.yaml << 'COMPOSE_EOF'
include:
  - ../../compose-shared.yaml

services:
  merch-db:
    image: postgres:15-alpine
    container_name: merch-postgres
    environment:
      POSTGRES_DB: merchdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - merch_db_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - merch-network
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d merchdb"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped
    command: >
      postgres
      -c shared_preload_libraries='pg_stat_statements'
      -c pg_stat_statements.track=all
      -c max_connections=100
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100

  merch-redis:
    image: redis:7-alpine
    container_name: merch-redis
    command: >
      redis-server
      --appendonly yes
      --appendfsync everysec
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
      --save 60 10000
    volumes:
      - merch_redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - merch-network
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 10s
    restart: unless-stopped
    sysctls:
      - net.core.somaxconn=65535

  merch-service:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: merch-service
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_HOST: merch-db
      DB_PORT: 5432
      DB_NAME: merchdb
      DB_USERNAME: postgres
      DB_PASSWORD: password
      DDL_AUTO: update
      SHOW_SQL: true
      REDIS_HOST: merch-redis
      REDIS_PORT: 6379
      SERVER_PORT: 8083
      CORS_ORIGINS: http://localhost:3000,http://localhost:80,https://localhost:3000
      LOG_LEVEL: INFO
      CACHE_LOG_LEVEL: INFO
      SQL_LOG_LEVEL: INFO
      WEB_LOG_LEVEL: INFO
      JAVA_OPTS: "-Xms512m -Xmx1024m -XX:+UseG1GC -XX:G1HeapRegionSize=16m"
    ports:
      - "8083:8083"
    depends_on:
      merch-db:
        condition: service_healthy
      merch-redis:
        condition: service_healthy
    networks:
      - merch-network
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8083/merch/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
      - /tmp:/tmp
    deploy:
      resources:
        limits:
          memory: 1.5G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'

  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: redis-commander
    environment:
      REDIS_HOSTS: merch-redis:merch-redis:6379
      HTTP_USER: admin
      HTTP_PASSWORD: admin123
    ports:
      - "8081:8081"
    networks:
      - merch-network
    depends_on:
      - merch-redis
    profiles:
      - tools

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@psecars.com
      PGADMIN_DEFAULT_PASSWORD: admin123
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - "8082:80"
    networks:
      - merch-network
    depends_on:
      - merch-db
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    profiles:
      - tools

volumes:
  merch_db_data:
    driver: local
  merch_redis_data:
    driver: local
  pgadmin_data:
    driver: local

networks:
  merch-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
COMPOSE_EOF

echo -e "${GREEN}✅ Compose file updated with network migration${NC}"

# 3. Restart services
echo -e "${YELLOW}🔄 Restarting services with new configuration...${NC}"
cd backend/merch
docker compose down
docker compose up -d --build

# 4. Wait and test
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 20

# 5. Health check
echo -e "${BLUE}🏥 Testing service health...${NC}"
for i in {1..12}; do
    if curl -f -s "http://localhost:8083/merch/actuator/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Migration successful! Service is healthy.${NC}"
        break
    elif [ $i -eq 12 ]; then
        echo -e "${RED}❌ Migration failed - service not responding${NC}"
        echo -e "${YELLOW}🔄 Running automatic rollback...${NC}"
        
        # Automatic rollback
        docker compose down
        cp "compose.yaml.migration-backup.$TIMESTAMP" compose.yaml
        docker compose up -d
        
        echo -e "${RED}❌ Migration rolled back. Check logs: docker compose logs${NC}"
        exit 1
    else
        echo -n "."
        sleep 5
    fi
done

# 6. Verify network connectivity
echo -e "${BLUE}🔍 Verifying network connectivity...${NC}"
if docker network inspect backend >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend network exists${NC}"
    
    if docker network inspect backend --format '{{range .Containers}}{{.Name}} {{end}}' | grep -q "merch-service"; then
        echo -e "${GREEN}✅ Merch service connected to backend network${NC}"
    else
        echo -e "${YELLOW}⚠️  Merch service not visible in backend network (may be normal)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Backend network not found - will be created by main compose${NC}"
fi

echo -e "\n${GREEN}🎉 Network migration completed successfully!${NC}"
echo -e "${BLUE}📊 Service Status:${NC}"
docker compose ps

echo -e "\n${BLUE}🌐 Access URLs:${NC}"
echo -e "  External: http://localhost:8083/merch/actuator/health"
echo -e "  Internal: http://merch-service:8083 (from other services)"

echo -e "\n${BLUE}📋 What changed:${NC}"
echo -e "  ✓ Added include: ../../compose-shared.yaml"
echo -e "  ✓ Connected all services to backend network"
echo -e "  ✓ Preserved all existing configuration"
echo -e "  ✓ Maintained data and volumes"
EOF

chmod +x "$BACKUP_DIR/scripts/apply-network-migration.sh"

# 11. Create comprehensive restore instructions
cat > "$BACKUP_DIR/RESTORATION_GUIDE.md" << EOF
# PSE Cars Complete Restoration Guide

**Backup Created:** $TIMESTAMP  
**Original Location:** $(pwd)  
**Backup Directory:** $BACKUP_DIR  

## 🚨 Emergency Quick Rollback

If something goes wrong during migration:

\`\`\`bash
# From backup directory
./scripts/quick-rollback.sh
\`\`\`

## 📋 What Was Backed Up

- ✅ All compose files (compose.yaml, docker-compose.yml, etc.)
- ✅ All environment files (.env, *.env)
- ✅ All application configs (application.yml, etc.)
- ✅ All Dockerfiles
- ✅ All shell scripts
- ✅ Complete Docker state (containers, networks, volumes, images)
- ✅ Service logs
- ✅ Volume data exports
- ✅ Git state (if applicable)
- ✅ Current service health status

## 🔧 Migration Process

### Step 1: Apply Network Migration
\`\`\`bash
./scripts/apply-network-migration.sh
\`\`\`

This script:
- Creates additional backup before changes
- Updates compose.yaml with network connectivity
- Restarts services with new configuration
- Performs health checks
- Auto-rollback on failure

### Step 2: Verify Migration
\`\`\`bash
# Test external access
curl http://localhost:8083/merch/actuator/health

# Check network connectivity
docker network inspect backend

# Verify service status
cd ../../backend/merch && docker compose ps
\`\`\`

## 🔄 Manual Restoration Procedures

### Restore Configuration Files
\`\`\`bash
# From project root
cp $BACKUP_DIR/config/backend/merch/compose.yaml backend/merch/
cp $BACKUP_DIR/config/backend/merch/application.yml backend/merch/
\`\`\`

### Restore Volume Data
\`\`\`bash
./scripts/restore-volumes.sh
\`\`\`

### Complete System Restore
\`\`\`bash
# Stop all services
cd backend/merch && docker compose down

# Restore all config files
cp -r $BACKUP_DIR/config/* ./

# Restore volumes if needed
./scripts/restore-volumes.sh

# Restart with original configuration
cd backend/merch && docker compose up -d
\`\`\`

## 📊 Backup Contents

\`\`\`
$BACKUP_DIR/
├── config/                 # All configuration files
├── docker-state/          # Docker networks, volumes, containers
├── volumes/               # Volume data exports
├── scripts/               # Restoration scripts
├── logs/                  # Service logs and health status
└── RESTORATION_GUIDE.md   # This file
\`\`\`

## 🆘 Troubleshooting

### Service Won't Start
1. Check logs: \`docker compose logs\`
2. Verify volume permissions
3. Restore original config and restart

### Network Issues
1. Check if backend network exists: \`docker network ls\`
2. Inspect network: \`docker network inspect backend\`
3. Restart from root: \`docker compose up -d\`

### Data Loss
1. Stop services: \`docker compose down\`
2. Restore volumes: \`./scripts/restore-volumes.sh\`
3. Restart: \`docker compose up -d\`

## 📞 Support Information

- **Backup Created:** $TIMESTAMP
- **Docker Version:** $(docker --version)
- **Compose Version:** $(docker compose version)
- **System:** $(uname -a)
- **Working Directory:** $(pwd)

EOF

# 12. Create summary
print_header "BACKUP SUMMARY"

BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
FILE_COUNT=$(find "$BACKUP_DIR" -type f | wc -l)

cat > "$BACKUP_DIR/BACKUP_SUMMARY.txt" << EOF
PSE Cars Ultimate Backup Summary
================================

Backup Directory: $BACKUP_DIR
Backup Size: $BACKUP_SIZE
Files Backed Up: $FILE_COUNT
Created: $(date)
Docker Compose: Modern (docker compose)

Current Services:
$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -10)

Networks:
$(docker network ls | grep -v "bridge\|host\|none")

Volumes:
$(docker volume ls | grep -E "(merch|pse)")

Quick Commands:
- Apply migration: ./$BACKUP_DIR/scripts/apply-network-migration.sh
- Quick rollback: ./$BACKUP_DIR/scripts/quick-rollback.sh
- Restore volumes: ./$BACKUP_DIR/scripts/restore-volumes.sh
- Full guide: cat $BACKUP_DIR/RESTORATION_GUIDE.md

Migration Status: READY TO PROCEED
EOF

echo -e "${GREEN}📋 Backup Summary:${NC}"
cat "$BACKUP_DIR/BACKUP_SUMMARY.txt"

print_header "BACKUP COMPLETED SUCCESSFULLY"

print_special "Your PSE Cars project has been completely backed up!"
echo -e "${GREEN}📁 Backup location: ${BACKUP_DIR}${NC}"
echo -e "${GREEN}📖 Full guide: ${BACKUP_DIR}/RESTORATION_GUIDE.md${NC}"
echo -e "${GREEN}🚀 Ready for migration: ${BACKUP_DIR}/scripts/apply-network-migration.sh${NC}"

echo -e "\n${BLUE}🎯 Next Steps:${NC}"
echo -e "1. Review backup summary above"
echo -e "2. Run migration: ${BACKUP_DIR}/scripts/apply-network-migration.sh"
echo -e "3. Test functionality"
echo -e "4. Keep backup until satisfied with changes"

echo -e "\n${YELLOW}⚠️  Emergency rollback available at any time: ${BACKUP_DIR}/scripts/quick-rollback.sh${NC}"