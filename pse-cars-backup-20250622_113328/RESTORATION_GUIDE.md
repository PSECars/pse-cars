# PSE Cars Complete Restoration Guide

**Backup Created:** 20250622_113328  
**Original Location:** /c/Users/RachidelWardi/Desktop/pse-cars  
**Backup Directory:** pse-cars-backup-20250622_113328  

## 🚨 Emergency Quick Rollback

If something goes wrong during migration:

```bash
# From backup directory
./scripts/quick-rollback.sh
```

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
```bash
./scripts/apply-network-migration.sh
```

This script:
- Creates additional backup before changes
- Updates compose.yaml with network connectivity
- Restarts services with new configuration
- Performs health checks
- Auto-rollback on failure

### Step 2: Verify Migration
```bash
# Test external access
curl http://localhost:8083/merch/actuator/health

# Check network connectivity
docker network inspect backend

# Verify service status
cd ../../backend/merch && docker compose ps
```

## 🔄 Manual Restoration Procedures

### Restore Configuration Files
```bash
# From project root
cp pse-cars-backup-20250622_113328/config/backend/merch/compose.yaml backend/merch/
cp pse-cars-backup-20250622_113328/config/backend/merch/application.yml backend/merch/
```

### Restore Volume Data
```bash
./scripts/restore-volumes.sh
```

### Complete System Restore
```bash
# Stop all services
cd backend/merch && docker compose down

# Restore all config files
cp -r pse-cars-backup-20250622_113328/config/* ./

# Restore volumes if needed
./scripts/restore-volumes.sh

# Restart with original configuration
cd backend/merch && docker compose up -d
```

## 📊 Backup Contents

```
pse-cars-backup-20250622_113328/
├── config/                 # All configuration files
├── docker-state/          # Docker networks, volumes, containers
├── volumes/               # Volume data exports
├── scripts/               # Restoration scripts
├── logs/                  # Service logs and health status
└── RESTORATION_GUIDE.md   # This file
```

## 🆘 Troubleshooting

### Service Won't Start
1. Check logs: `docker compose logs`
2. Verify volume permissions
3. Restore original config and restart

### Network Issues
1. Check if backend network exists: `docker network ls`
2. Inspect network: `docker network inspect backend`
3. Restart from root: `docker compose up -d`

### Data Loss
1. Stop services: `docker compose down`
2. Restore volumes: `./scripts/restore-volumes.sh`
3. Restart: `docker compose up -d`

## 📞 Support Information

- **Backup Created:** 20250622_113328
- **Docker Version:** Docker version 28.1.1, build 4eba377
- **Compose Version:** Docker Compose version v2.35.1-desktop.1
- **System:** MINGW64_NT-10.0-22631 DibucoRW 3.5.4-1e8cf1a5.x86_64 2024-09-25 21:18 UTC x86_64 Msys
- **Working Directory:** /c/Users/RachidelWardi/Desktop/pse-cars

