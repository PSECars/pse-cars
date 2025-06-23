#!/bin/bash

# PSE Cars Quick Rollback Script
# Generated: 20250622_113328

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Rolling back PSE Cars merch service...${NC}"

# Get project root (assuming script is run from backup directory)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${YELLOW}📂 Project root: $PROJECT_ROOT${NC}"

# Stop current services
echo -e "${YELLOW}⏹️  Stopping current services...${NC}"
cd "$PROJECT_ROOT/backend/merch"
docker compose down 2>/dev/null || true
cd "$PROJECT_ROOT"

# Restore compose file
echo -e "${YELLOW}📄 Restoring compose file...${NC}"
cp "$BACKUP_ROOT/config/backend/merch/compose.yaml" "$PROJECT_ROOT/backend/merch/compose.yaml"

# Restore application.yml if changed
if [[ -f "$BACKUP_ROOT/config/backend/merch/application.yml" ]]; then
    cp "$BACKUP_ROOT/config/backend/merch/application.yml" "$PROJECT_ROOT/backend/merch/application.yml"
fi

# Restart services
echo -e "${YELLOW}🚀 Restarting services...${NC}"
cd "$PROJECT_ROOT/backend/merch"
docker compose up -d

echo -e "${GREEN}✅ Rollback completed!${NC}"
echo -e "${GREEN}🏥 Test health: curl http://localhost:8083/merch/actuator/health${NC}"
