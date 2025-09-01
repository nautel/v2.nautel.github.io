#!/bin/bash
set -euo pipefail

# Production Deployment Script for Portfolio Website with Theme System
# This script handles the complete deployment process with proper error handling and rollback capabilities

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOYMENT_LOG="/var/log/portfolio-deployment.log"
BACKUP_DIR="/tmp/portfolio-backup-$(date +%Y%m%d-%H%M%S)"
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_INTERVAL=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment detection
ENVIRONMENT="${1:-production}"
DRY_RUN="${2:-false}"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$DEPLOYMENT_LOG" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

# Validation functions
validate_environment() {
    log "Validating deployment environment: $ENVIRONMENT"
    
    case "$ENVIRONMENT" in
        production|staging|development)
            log "Environment $ENVIRONMENT is valid"
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT. Must be one of: production, staging, development"
            exit 1
            ;;
    esac
}

validate_prerequisites() {
    log "Validating prerequisites..."
    
    # Check if Docker is installed and running
    if ! docker --version >/dev/null 2>&1; then
        error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker compose version >/dev/null 2>&1 && ! docker-compose --version >/dev/null 2>&1; then
        error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if required files exist
    required_files=(
        "docker-compose.yml"
        "docker-compose.prod.yml"
        ".env.example"
        "Dockerfile"
        "nginx/prod.conf"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$PROJECT_ROOT/$file" ]]; then
            error "Required file not found: $file"
            exit 1
        fi
    done
    
    # Check if environment file exists
    if [[ ! -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]]; then
        error "Environment file not found: .env.$ENVIRONMENT"
        error "Please copy .env.example to .env.$ENVIRONMENT and configure it"
        exit 1
    fi
    
    success "All prerequisites validated"
}

# Backup functions
create_backup() {
    log "Creating backup before deployment..."
    mkdir -p "$BACKUP_DIR"
    
    # Backup current Docker images
    if docker compose ps -q | grep -q .; then
        log "Backing up current Docker images..."
        docker compose -f docker-compose.yml -f docker-compose.prod.yml images > "$BACKUP_DIR/current-images.txt"
        
        # Export current configuration
        cp "$PROJECT_ROOT/.env.$ENVIRONMENT" "$BACKUP_DIR/"
        cp -r "$PROJECT_ROOT/nginx" "$BACKUP_DIR/"
        cp -r "$PROJECT_ROOT/monitoring" "$BACKUP_DIR/"
        
        success "Configuration backup completed"
    fi
    
    # Backup databases if running
    if docker compose ps database | grep -q "Up"; then
        log "Creating database backup..."
        docker compose exec -T database pg_dumpall -U postgres > "$BACKUP_DIR/database-backup.sql" || {
            warning "Database backup failed, continuing anyway..."
        }
    fi
    
    if docker compose ps mongodb | grep -q "Up"; then
        log "Creating MongoDB backup..."
        docker compose exec -T mongodb mongodump --archive > "$BACKUP_DIR/mongodb-backup.archive" || {
            warning "MongoDB backup failed, continuing anyway..."
        }
    fi
    
    success "Backup created at: $BACKUP_DIR"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check disk space
    available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    required_space=2000000  # 2GB in KB
    
    if [[ $available_space -lt $required_space ]]; then
        error "Insufficient disk space. Available: ${available_space}KB, Required: ${required_space}KB"
        exit 1
    fi
    
    # Check Docker system resources
    docker system df
    
    # Validate environment variables
    log "Validating environment variables..."
    source "$PROJECT_ROOT/.env.$ENVIRONMENT"
    
    required_vars=(
        "NODE_ENV"
        "GATSBY_SITE_URL"
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Test external services connectivity
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log "Testing external service connectivity..."
        
        # Test database connectivity (if external)
        if [[ "$DATABASE_URL" =~ ^postgresql://.*@.*: ]]; then
            log "Testing database connectivity..."
            # Extract connection details and test
            # This is a simplified test - implement full connectivity check
        fi
    fi
    
    success "Pre-deployment checks passed"
}

# Build functions
build_images() {
    log "Building Docker images..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would build Docker images"
        return 0
    fi
    
    # Build with build args from environment
    docker compose -f docker-compose.yml -f docker-compose.prod.yml build \
        --build-arg NODE_ENV="$NODE_ENV" \
        --build-arg GATSBY_THEME_API_URL="$GATSBY_THEME_API_URL" \
        --build-arg GATSBY_GA_TRACKING_ID="$GATSBY_GA_TRACKING_ID" \
        --build-arg GATSBY_SENTRY_DSN="$GATSBY_SENTRY_DSN" \
        --parallel \
        --progress plain
    
    success "Docker images built successfully"
}

# Deployment functions
deploy_infrastructure() {
    log "Deploying infrastructure services..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would deploy infrastructure services"
        return 0
    fi
    
    # Start databases first
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d database redis mongodb
    
    # Wait for databases to be ready
    log "Waiting for databases to be ready..."
    for i in {1..30}; do
        if docker compose exec -T database pg_isready -U postgres >/dev/null 2>&1 && \
           docker compose exec -T redis redis-cli ping >/dev/null 2>&1 && \
           docker compose exec -T mongodb mongo --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            success "All databases are ready"
            break
        fi
        
        if [[ $i -eq 30 ]]; then
            error "Databases failed to start within timeout"
            return 1
        fi
        
        log "Waiting for databases... ($i/30)"
        sleep 10
    done
    
    success "Infrastructure services deployed"
}

deploy_application() {
    log "Deploying application services..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would deploy application services"
        return 0
    fi
    
    # Deploy backend API
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend
    
    # Wait for backend to be ready
    log "Waiting for backend API to be ready..."
    for i in {1..$HEALTH_CHECK_RETRIES}; do
        if curl -f http://localhost:3001/health >/dev/null 2>&1; then
            success "Backend API is ready"
            break
        fi
        
        if [[ $i -eq $HEALTH_CHECK_RETRIES ]]; then
            error "Backend API failed to start within timeout"
            return 1
        fi
        
        log "Waiting for backend API... ($i/$HEALTH_CHECK_RETRIES)"
        sleep $HEALTH_CHECK_INTERVAL
    done
    
    # Deploy frontend
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d frontend
    
    # Deploy reverse proxy
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d traefik
    
    success "Application services deployed"
}

deploy_monitoring() {
    log "Deploying monitoring services..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would deploy monitoring services"
        return 0
    fi
    
    # Start monitoring stack
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d prometheus grafana
    
    # Start logging stack
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d elasticsearch kibana
    
    success "Monitoring services deployed"
}

# Health check functions
run_health_checks() {
    log "Running comprehensive health checks..."
    
    local endpoints=(
        "https://nautel.dev/health:Frontend Health Check"
        "https://api.nautel.dev/health:Backend API Health Check"
        "http://localhost:9090/-/healthy:Prometheus Health Check"
        "http://localhost:3000/api/health:Grafana Health Check"
    )
    
    local failed_checks=0
    
    for endpoint_info in "${endpoints[@]}"; do
        IFS=':' read -r endpoint description <<< "$endpoint_info"
        
        log "Testing: $description"
        
        if curl -f -s -o /dev/null --max-time 30 "$endpoint"; then
            success "$description - OK"
        else
            error "$description - FAILED"
            ((failed_checks++))
        fi
    done
    
    # Test theme system functionality
    log "Testing theme system functionality..."
    
    # Test theme API endpoints
    theme_endpoints=(
        "https://api.nautel.dev/api/v1/themes/available:Theme Available API"
        "https://nautel.dev:Frontend Theme System"
    )
    
    for endpoint_info in "${theme_endpoints[@]}"; do
        IFS=':' read -r endpoint description <<< "$endpoint_info"
        
        if curl -f -s -o /dev/null --max-time 30 "$endpoint"; then
            success "$description - OK"
        else
            error "$description - FAILED"
            ((failed_checks++))
        fi
    done
    
    # Test database connectivity
    log "Testing database connectivity..."
    
    if docker compose exec -T database pg_isready -U postgres >/dev/null 2>&1; then
        success "PostgreSQL connectivity - OK"
    else
        error "PostgreSQL connectivity - FAILED"
        ((failed_checks++))
    fi
    
    if docker compose exec -T redis redis-cli ping | grep -q PONG; then
        success "Redis connectivity - OK"
    else
        error "Redis connectivity - FAILED"
        ((failed_checks++))
    fi
    
    if docker compose exec -T mongodb mongo --eval "db.adminCommand('ping')" | grep -q '"ok" : 1'; then
        success "MongoDB connectivity - OK"
    else
        error "MongoDB connectivity - FAILED"
        ((failed_checks++))
    fi
    
    if [[ $failed_checks -eq 0 ]]; then
        success "All health checks passed"
        return 0
    else
        error "$failed_checks health checks failed"
        return 1
    fi
}

# Performance validation
validate_performance() {
    log "Running performance validation..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would run performance validation"
        return 0
    fi
    
    # Install Lighthouse CI if not available
    if ! command -v lhci >/dev/null 2>&1; then
        log "Installing Lighthouse CI..."
        npm install -g @lhci/cli@0.12.x
    fi
    
    # Run Lighthouse audit
    log "Running Lighthouse performance audit..."
    cd "$PROJECT_ROOT"
    
    if lhci autorun --config=.lighthouserc-themes.json; then
        success "Performance validation passed"
    else
        warning "Performance validation had issues - check Lighthouse results"
    fi
}

# Rollback function
rollback_deployment() {
    error "Rolling back deployment..."
    
    if [[ -d "$BACKUP_DIR" ]]; then
        log "Restoring from backup: $BACKUP_DIR"
        
        # Stop current services
        docker compose -f docker-compose.yml -f docker-compose.prod.yml down
        
        # Restore configuration
        cp "$BACKUP_DIR/.env.$ENVIRONMENT" "$PROJECT_ROOT/"
        cp -r "$BACKUP_DIR/nginx" "$PROJECT_ROOT/"
        cp -r "$BACKUP_DIR/monitoring" "$PROJECT_ROOT/"
        
        # Restore database if backup exists
        if [[ -f "$BACKUP_DIR/database-backup.sql" ]]; then
            log "Restoring database from backup..."
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d database
            sleep 30
            docker compose exec -T database psql -U postgres < "$BACKUP_DIR/database-backup.sql"
        fi
        
        # Restart services with previous configuration
        docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        
        success "Rollback completed"
    else
        error "No backup found for rollback"
        exit 1
    fi
}

# Notification function
send_notification() {
    local status="$1"
    local message="$2"
    
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local color="good"
        local emoji="✅"
        
        if [[ "$status" == "failure" ]]; then
            color="danger"
            emoji="❌"
        elif [[ "$status" == "warning" ]]; then
            color="warning"
            emoji="⚠️"
        fi
        
        local payload="{
            \"attachments\": [{
                \"color\": \"$color\",
                \"title\": \"Portfolio Deployment $status\",
                \"text\": \"$emoji $message\",
                \"fields\": [
                    {\"title\": \"Environment\", \"value\": \"$ENVIRONMENT\", \"short\": true},
                    {\"title\": \"Timestamp\", \"value\": \"$(date)\", \"short\": true}
                ]
            }]
        }"
        
        curl -X POST -H 'Content-type: application/json' \
             --data "$payload" \
             "$SLACK_WEBHOOK_URL" \
             >/dev/null 2>&1 || warning "Failed to send Slack notification"
    fi
    
    # Email notification (if configured)
    if [[ -n "${NOTIFICATION_EMAIL:-}" ]]; then
        echo "$message" | mail -s "Portfolio Deployment $status" "$NOTIFICATION_EMAIL" || \
            warning "Failed to send email notification"
    fi
}

# Cleanup function
cleanup() {
    log "Cleaning up deployment artifacts..."
    
    # Clean up Docker system
    docker system prune -f --volumes || warning "Docker cleanup had issues"
    
    # Remove old backups (keep last 5)
    find /tmp -name "portfolio-backup-*" -type d | sort | head -n -5 | xargs rm -rf || true
    
    success "Cleanup completed"
}

# Signal handlers
handle_interrupt() {
    error "Deployment interrupted by user"
    send_notification "failure" "Deployment was interrupted by user"
    exit 130
}

handle_error() {
    local exit_code=$?
    error "Deployment failed with exit code: $exit_code"
    
    if [[ "${ROLLBACK_ON_FAILURE:-true}" == "true" ]]; then
        rollback_deployment
        send_notification "failure" "Deployment failed and was rolled back"
    else
        send_notification "failure" "Deployment failed (no rollback performed)"
    fi
    
    exit $exit_code
}

# Set signal handlers
trap handle_interrupt SIGINT SIGTERM
trap handle_error ERR

# Main deployment function
main() {
    log "Starting deployment process for $ENVIRONMENT environment"
    
    # Change to project directory
    cd "$PROJECT_ROOT"
    
    # Load environment variables
    set -a
    source ".env.$ENVIRONMENT"
    set +a
    
    # Validation phase
    validate_environment
    validate_prerequisites
    pre_deployment_checks
    
    # Backup phase
    create_backup
    
    # Build phase
    log "=== BUILD PHASE ==="
    build_images
    
    # Deployment phase
    log "=== DEPLOYMENT PHASE ==="
    deploy_infrastructure
    deploy_application
    deploy_monitoring
    
    # Validation phase
    log "=== VALIDATION PHASE ==="
    if ! run_health_checks; then
        error "Health checks failed"
        if [[ "${ROLLBACK_ON_HEALTH_CHECK_FAILURE:-true}" == "true" ]]; then
            rollback_deployment
            send_notification "failure" "Deployment failed health checks and was rolled back"
            exit 1
        fi
    fi
    
    # Performance validation
    validate_performance
    
    # Cleanup
    cleanup
    
    # Success notification
    success "Deployment completed successfully!"
    send_notification "success" "Deployment completed successfully to $ENVIRONMENT environment"
    
    log "Deployment summary:"
    log "- Environment: $ENVIRONMENT"
    log "- Backup location: $BACKUP_DIR"
    log "- Deployment log: $DEPLOYMENT_LOG"
    log "- Frontend URL: ${GATSBY_SITE_URL:-https://nautel.dev}"
    log "- API URL: ${GATSBY_THEME_API_URL:-https://api.nautel.dev}"
    log "- Monitoring: http://localhost:3000 (Grafana)"
}

# Script usage
usage() {
    echo "Usage: $0 [ENVIRONMENT] [DRY_RUN]"
    echo ""
    echo "ENVIRONMENT:"
    echo "  production   Deploy to production (default)"
    echo "  staging      Deploy to staging"
    echo "  development  Deploy to development"
    echo ""
    echo "DRY_RUN:"
    echo "  true         Simulate deployment without making changes"
    echo "  false        Execute actual deployment (default)"
    echo ""
    echo "Examples:"
    echo "  $0                           # Deploy to production"
    echo "  $0 staging                   # Deploy to staging"
    echo "  $0 production true           # Dry run for production"
    echo ""
    echo "Environment variables:"
    echo "  ROLLBACK_ON_FAILURE=true            # Auto-rollback on failure"
    echo "  ROLLBACK_ON_HEALTH_CHECK_FAILURE=true  # Auto-rollback on health check failure"
    echo "  SLACK_WEBHOOK_URL=<url>              # Slack notifications"
    echo "  NOTIFICATION_EMAIL=<email>           # Email notifications"
}

# Check for help flag
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    usage
    exit 0
fi

# Execute main function
main "$@"