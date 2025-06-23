#!/bin/bash

# PSE Cars Project Diagnostic Script
# Run this from your project root directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if we're in the right directory
check_project_root() {
    print_header "CHECKING PROJECT STRUCTURE"
    
    if [[ ! -d "backend" || ! -d "frontend" ]]; then
        print_error "Not in PSE Cars project root! Please run from project root directory."
        exit 1
    fi
    
    print_status "In correct project root directory"
    
    # Show project structure
    echo -e "\n📁 Project Structure:"
    find . -maxdepth 3 -name "docker-compose.yml" -o -name "compose.yml" -o -name "Dockerfile" | head -10
}

# Check Docker setup
check_docker() {
    print_header "CHECKING DOCKER SETUP"
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_status "Docker is running"
    
    # Check Docker versions
    echo -e "\n🐳 Docker Version:"
    docker --version
    
    # Check Docker Compose versions
    echo -e "\n🔧 Docker Compose Versions:"
    if command -v docker-compose &> /dev/null; then
        echo "Legacy docker-compose: $(docker-compose --version)"
    else
        print_warning "Legacy docker-compose not found"
    fi
    
    if docker compose version &> /dev/null; then
        echo "Modern docker compose: $(docker compose version)"
    else
        print_warning "Modern docker compose not found"
    fi
}

# Check existing containers/networks/volumes
check_existing_resources() {
    print_header "CHECKING EXISTING RESOURCES"
    
    echo -e "\n🏃 Running Containers:"
    if [ "$(docker ps -q)" ]; then
        docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
    else
        print_info "No containers currently running"
    fi
    
    echo -e "\n📡 Docker Networks:"
    docker network ls | grep -E "(pse|merch|cars)" || print_info "No PSE Cars networks found"
    
    echo -e "\n💾 Docker Volumes:"
    docker volume ls | grep -E "(pse|merch|cars)" || print_info "No PSE Cars volumes found"
}

# Analyze compose files
analyze_compose_files() {
    print_header "ANALYZING COMPOSE FILES"
    
    echo -e "\n📋 Found Compose Files:"
    
    # Root level
    if [ -f "compose.yml" ]; then
        print_status "Root: compose.yml"
    fi
    if [ -f "compose-shared.yml" ]; then
        print_status "Root: compose-shared.yml"
    fi
    if [ -f "docker-compose.yml" ]; then
        print_status "Root: docker-compose.yml"
    fi
    
    # Backend
    if [ -f "backend/docker-compose.yml" ]; then
        print_status "Backend: docker-compose.yml"
    fi
    if [ -f "backend/compose.yml" ]; then
        print_status "Backend: compose.yml"
    fi
    
    # Backend merch service
    if [ -f "backend/merch/docker-compose.yml" ]; then
        print_status "Backend/Merch: docker-compose.yml"
    fi
    if [ -f "backend/merch/compose.yml" ]; then
        print_status "Backend/Merch: compose.yml"
    fi
    
    # Frontend
    if [ -f "frontend/pse-cars/docker-compose.yml" ]; then
        print_status "Frontend: docker-compose.yml"
    fi
    if [ -f "frontend/pse-cars/compose.yml" ]; then
        print_status "Frontend: compose.yml"
    fi
}

# Check environment files
check_env_files() {
    print_header "CHECKING ENVIRONMENT FILES"
    
    echo -e "\n🔐 Environment Files:"
    find . -name ".env*" -type f | while read env_file; do
        if [ -r "$env_file" ]; then
            print_status "Found: $env_file"
        else
            print_warning "Found but not readable: $env_file"
        fi
    done
}

# Check for setup scripts
check_setup_scripts() {
    print_header "CHECKING SETUP SCRIPTS"
    
    echo -e "\n📜 Setup Scripts:"
    find . -name "setup*.sh" -o -name "deploy*.sh" | while read script; do
        if [ -x "$script" ]; then
            print_status "Executable: $script"
        else
            print_warning "Not executable: $script"
        fi
    done
}

# Check port conflicts
check_port_conflicts() {
    print_header "CHECKING PORT CONFLICTS"
    
    echo -e "\n🔌 Checking common ports:"
    
    # Common ports your project might use
    ports=(3000 8080 5432 6379 80 443)
    
    for port in "${ports[@]}"; do
        if lsof -i :$port >/dev/null 2>&1; then
            print_warning "Port $port is already in use"
            echo "   $(lsof -i :$port | tail -1)"
        else
            print_status "Port $port is available"
        fi
    done
}

# Generate deployment plan
generate_deployment_plan() {
    print_header "GENERATING DEPLOYMENT PLAN"
    
    echo -e "\n📝 Recommended Deployment Order:"
    
    echo "1. 🧹 Clean existing resources"
    echo "2. 🏗️  Start shared infrastructure (if compose-shared.yml exists)"
    echo "3. 🔧 Start backend services"
    echo "4. 🎨 Start frontend"
    echo "5. 🏥 Health checks"
    
    echo -e "\n💡 Next Steps:"
    echo "   Run: ./deploy-psecars.sh clean    # to clean existing resources"
    echo "   Run: ./deploy-psecars.sh deploy   # to deploy everything"
}

# Main execution
main() {
    echo -e "${GREEN}"
    echo "🚗 PSE Cars Project Diagnostic Tool"
    echo "===================================="
    echo -e "${NC}"
    
    check_project_root
    check_docker
    check_existing_resources
    analyze_compose_files
    check_env_files
    check_setup_scripts
    check_port_conflicts
    generate_deployment_plan
    
    print_header "DIAGNOSTIC COMPLETE"
    print_info "Review the output above and run the deployment script when ready."
}

# Run main function
main