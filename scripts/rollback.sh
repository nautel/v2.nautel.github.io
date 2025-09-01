#!/bin/bash
set -euo pipefail

# Rollback Script for Portfolio Website
# This script provides comprehensive rollback capabilities for the dual-theme portfolio deployment

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ROLLBACK_LOG="/var/log/portfolio-rollback.log"
BACKUP_BASE_DIR="/tmp"
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_INTERVAL=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Command line arguments
ENVIRONMENT="${1:-production}"
ROLLBACK_TYPE="${2:-full}"  # full, app, config, database
ROLLBACK_TARGET="${3:-}"    # backup directory, git commit, or docker tag

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$ROLLBACK_LOG" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

# Validation functions
validate_environment() {
    log "Validating rollback environment: $ENVIRONMENT"
    
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

validate_rollback_type() {
    log "Validating rollback type: $ROLLBACK_TYPE"
    
    case "$ROLLBACK_TYPE" in
        full|app|config|database)
            log "Rollback type $ROLLBACK_TYPE is valid"
            ;;
        *)
            error "Invalid rollback type: $ROLLBACK_TYPE. Must be one of: full, app, config, database"
            exit 1
            ;;
    esac
}

# Discovery functions
list_available_backups() {
    log "Available backups:"
    
    local backup_dirs=($(find "$BACKUP_BASE_DIR" -name "portfolio-backup-*" -type d | sort -r))
    
    if [[ ${#backup_dirs[@]} -eq 0 ]]; then
        warning "No backups found in $BACKUP_BASE_DIR"
        return 1
    fi
    
    for i in "${!backup_dirs[@]}"; do
        local backup_dir="${backup_dirs[$i]}"
        local backup_name=$(basename "$backup_dir")
        local backup_date=$(echo "$backup_name" | sed 's/portfolio-backup-//' | sed 's/\([0-9]\{8\}\)-\([0-9]\{6\}\)/\1 \2/')
        
        echo "  [$((i+1))] $backup_name ($backup_date)"
        
        # Show backup contents
        if [[ -f "$backup_dir/current-images.txt" ]]; then
            echo "      - Docker images backup available"
        fi
        if [[ -f "$backup_dir/database-backup.sql" ]]; then
            echo "      - PostgreSQL database backup available"
        fi
        if [[ -f "$backup_dir/mongodb-backup.archive" ]]; then
            echo "      - MongoDB backup available"
        fi
        if [[ -d "$backup_dir/nginx" ]]; then
            echo "      - Nginx configuration backup available"
        fi
    done
    
    return 0
}

list_available_git_commits() {
    log "Recent Git commits:"
    
    git log --oneline -10 | while read -r commit; do
        echo "  $commit"
    done
}

list_available_docker_images() {
    log "Available Docker images:"
    
    docker images --filter "reference=*portfolio*" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" | head -20
}

# Backup functions
create_pre_rollback_backup() {
    local current_backup_dir="/tmp/portfolio-pre-rollback-$(date +%Y%m%d-%H%M%S)"
    log "Creating pre-rollback backup: $current_backup_dir"
    
    mkdir -p "$current_backup_dir"
    
    # Backup current configuration
    cp "$PROJECT_ROOT/.env.$ENVIRONMENT" "$current_backup_dir/" 2>/dev/null || warning "No environment file to backup"
    cp -r "$PROJECT_ROOT/nginx" "$current_backup_dir/" 2>/dev/null || warning "No nginx config to backup"
    cp -r "$PROJECT_ROOT/monitoring" "$current_backup_dir/" 2>/dev/null || warning "No monitoring config to backup"
    
    # Backup current Docker state
    docker compose -f docker-compose.yml -f docker-compose.prod.yml ps > "$current_backup_dir/docker-state.txt"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml images > "$current_backup_dir/current-images.txt"
    
    # Backup databases if running
    if docker compose ps database | grep -q "Up"; then
        log "Creating current database backup..."
        docker compose exec -T database pg_dumpall -U postgres > "$current_backup_dir/database-backup.sql" || \
            warning "Database backup failed"
    fi
    
    if docker compose ps mongodb | grep -q "Up"; then
        log "Creating current MongoDB backup..."
        docker compose exec -T mongodb mongodump --archive > "$current_backup_dir/mongodb-backup.archive" || \
            warning "MongoDB backup failed"
    fi
    
    success "Pre-rollback backup created at: $current_backup_dir"
    echo "$current_backup_dir" > /tmp/last-pre-rollback-backup
}

# Rollback functions
rollback_from_backup() {
    local backup_dir="$1"
    
    log "Rolling back from backup: $backup_dir"
    
    if [[ ! -d "$backup_dir" ]]; then
        error "Backup directory does not exist: $backup_dir"
        return 1
    fi
    
    # Stop current services
    log "Stopping current services..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml down
    
    case "$ROLLBACK_TYPE" in
        full|config)
            # Restore configuration files
            if [[ -f "$backup_dir/.env.$ENVIRONMENT" ]]; then
                log "Restoring environment configuration..."
                cp "$backup_dir/.env.$ENVIRONMENT" "$PROJECT_ROOT/"
                success "Environment configuration restored"
            fi
            
            if [[ -d "$backup_dir/nginx" ]]; then
                log "Restoring Nginx configuration..."
                rm -rf "$PROJECT_ROOT/nginx"
                cp -r "$backup_dir/nginx" "$PROJECT_ROOT/"
                success "Nginx configuration restored"
            fi
            
            if [[ -d "$backup_dir/monitoring" ]]; then
                log "Restoring monitoring configuration..."
                rm -rf "$PROJECT_ROOT/monitoring"
                cp -r "$backup_dir/monitoring" "$PROJECT_ROOT/"
                success "Monitoring configuration restored"
            fi
            ;;
    esac
    
    case "$ROLLBACK_TYPE" in
        full|database)
            # Restore databases
            if [[ -f "$backup_dir/database-backup.sql" ]]; then
                log "Restoring PostgreSQL database..."
                
                # Start database service
                docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d database
                
                # Wait for database to be ready
                for i in {1..30}; do
                    if docker compose exec -T database pg_isready -U postgres >/dev/null 2>&1; then
                        break
                    fi
                    sleep 5
                done
                
                # Restore database
                docker compose exec -T database dropdb -U postgres --if-exists "$DB_NAME" || true
                docker compose exec -T database createdb -U postgres "$DB_NAME"
                docker compose exec -T database psql -U postgres < "$backup_dir/database-backup.sql"
                
                success "PostgreSQL database restored"
            fi
            
            if [[ -f "$backup_dir/mongodb-backup.archive" ]]; then
                log "Restoring MongoDB database..."
                
                # Start MongoDB service
                docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d mongodb
                
                # Wait for MongoDB to be ready
                for i in {1..30}; do
                    if docker compose exec -T mongodb mongo --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
                        break
                    fi
                    sleep 5
                done
                
                # Drop existing database and restore
                docker compose exec -T mongodb mongo --eval "db.getSiblingDB('$MONGO_DB_NAME').dropDatabase()"
                docker compose exec -T mongodb mongorestore --archive < "$backup_dir/mongodb-backup.archive"
                
                success "MongoDB database restored"
            fi
            ;;
    esac
    
    case "$ROLLBACK_TYPE" in
        full|app)
            # Load environment and restart services
            log "Restarting services with restored configuration..."
            
            # Load environment variables
            if [[ -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]]; then
                set -a
                source "$PROJECT_ROOT/.env.$ENVIRONMENT"
                set +a
            fi
            
            # Start all services
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            
            success "Services restarted with restored configuration"
            ;;
    esac
}

rollback_from_git() {
    local git_commit="$1"
    
    log "Rolling back to Git commit: $git_commit"
    
    # Validate commit exists
    if ! git rev-parse --verify "$git_commit" >/dev/null 2>&1; then
        error "Git commit not found: $git_commit"
        return 1
    fi
    
    # Create backup of current state
    create_pre_rollback_backup
    
    # Checkout the specified commit
    log "Checking out commit: $git_commit"
    git checkout "$git_commit"
    
    # Rebuild and redeploy
    case "$ROLLBACK_TYPE" in
        full|app)
            log "Rebuilding application with rolled back code..."
            
            # Stop current services
            docker compose -f docker-compose.yml -f docker-compose.prod.yml down
            
            # Rebuild images
            docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
            
            # Start services
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            
            success "Application rolled back to commit: $git_commit"
            ;;
        config)
            warning "Git rollback for config-only not supported. Use backup rollback instead."
            ;;
    esac
}

rollback_from_docker_tag() {
    local docker_tag="$1"
    
    log "Rolling back to Docker image tag: $docker_tag"
    
    # Validate image exists
    if ! docker image inspect "portfolio-frontend:$docker_tag" >/dev/null 2>&1; then
        error "Docker image not found: portfolio-frontend:$docker_tag"
        return 1
    fi
    
    # Create backup of current state
    create_pre_rollback_backup
    
    # Stop current services
    log "Stopping current services..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml down
    
    # Update image tags in docker-compose
    log "Updating Docker Compose configuration for rollback..."
    
    # Create temporary docker-compose override
    cat > docker-compose.rollback.yml << EOF
version: '3.8'
services:
  frontend:
    image: portfolio-frontend:$docker_tag
  backend:
    image: portfolio-backend:$docker_tag
EOF
    
    # Start services with rolled back images
    docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.rollback.yml up -d
    
    success "Services rolled back to Docker tag: $docker_tag"
}

# Health check functions
run_post_rollback_health_checks() {
    log "Running post-rollback health checks..."
    
    local endpoints=(
        "https://nautel.dev/health:Frontend Health Check"
        "https://api.nautel.dev/health:Backend API Health Check"
    )
    
    local failed_checks=0
    
    # Wait for services to start
    sleep 30
    
    for endpoint_info in "${endpoints[@]}"; do
        IFS=':' read -r endpoint description <<< "$endpoint_info"
        
        log "Testing: $description"
        
        for i in {1..$HEALTH_CHECK_RETRIES}; do
            if curl -f -s -o /dev/null --max-time 10 "$endpoint"; then
                success "$description - OK"
                break
            elif [[ $i -eq $HEALTH_CHECK_RETRIES ]]; then
                error "$description - FAILED after $HEALTH_CHECK_RETRIES attempts"
                ((failed_checks++))
            else
                log "Attempt $i/$HEALTH_CHECK_RETRIES failed, retrying..."
                sleep $HEALTH_CHECK_INTERVAL
            fi
        done
    done
    
    # Test theme system functionality
    log "Testing theme system functionality after rollback..."
    
    if curl -f -s -o /dev/null --max-time 30 "https://api.nautel.dev/api/v1/themes/available"; then
        success "Theme API - OK"
    else
        error "Theme API - FAILED"
        ((failed_checks++))
    fi
    
    # Test database connectivity
    log "Testing database connectivity after rollback..."
    
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
    
    if [[ $failed_checks -eq 0 ]]; then
        success "All post-rollback health checks passed"
        return 0
    else
        error "$failed_checks post-rollback health checks failed"
        return 1
    fi
}

# Notification function
send_rollback_notification() {
    local status="$1"
    local message="$2"
    
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local color="warning"
        local emoji="🔄"
        
        if [[ "$status" == "success" ]]; then
            color="good"
            emoji="✅"
        elif [[ "$status" == "failure" ]]; then
            color="danger"
            emoji="❌"
        fi
        
        local payload="{
            \"attachments\": [{
                \"color\": \"$color\",
                \"title\": \"Portfolio Rollback $status\",
                \"text\": \"$emoji $message\",
                \"fields\": [
                    {\"title\": \"Environment\", \"value\": \"$ENVIRONMENT\", \"short\": true},
                    {\"title\": \"Rollback Type\", \"value\": \"$ROLLBACK_TYPE\", \"short\": true},
                    {\"title\": \"Target\", \"value\": \"$ROLLBACK_TARGET\", \"short\": true},
                    {\"title\": \"Timestamp\", \"value\": \"$(date)\", \"short\": true}
                ]
            }]
        }"
        
        curl -X POST -H 'Content-type: application/json' \
             --data "$payload" \
             "$SLACK_WEBHOOK_URL" \
             >/dev/null 2>&1 || warning "Failed to send Slack notification"
    fi
}

# Interactive selection functions
interactive_backup_selection() {
    if ! list_available_backups; then
        error "No backups available for rollback"
        exit 1
    fi
    
    echo ""
    read -p "Select backup number (or 'q' to quit): " selection
    
    if [[ "$selection" == "q" ]]; then
        log "Rollback cancelled by user"
        exit 0
    fi
    
    local backup_dirs=($(find "$BACKUP_BASE_DIR" -name "portfolio-backup-*" -type d | sort -r))
    local selected_index=$((selection - 1))
    
    if [[ $selected_index -ge 0 && $selected_index -lt ${#backup_dirs[@]} ]]; then
        ROLLBACK_TARGET="${backup_dirs[$selected_index]}"
        log "Selected backup: $(basename "$ROLLBACK_TARGET")"
    else
        error "Invalid selection: $selection"
        exit 1
    fi
}

interactive_git_selection() {
    list_available_git_commits
    echo ""
    read -p "Enter Git commit hash (or 'q' to quit): " selection
    
    if [[ "$selection" == "q" ]]; then
        log "Rollback cancelled by user"
        exit 0
    fi
    
    ROLLBACK_TARGET="$selection"
    log "Selected Git commit: $ROLLBACK_TARGET"
}

interactive_docker_selection() {
    list_available_docker_images
    echo ""
    read -p "Enter Docker tag (or 'q' to quit): " selection
    
    if [[ "$selection" == "q" ]]; then
        log "Rollback cancelled by user"
        exit 0
    fi
    
    ROLLBACK_TARGET="$selection"
    log "Selected Docker tag: $ROLLBACK_TARGET"
}

# Confirmation function
confirm_rollback() {
    echo ""
    warning "WARNING: This will perform a rollback operation!"
    echo "Environment: $ENVIRONMENT"
    echo "Rollback Type: $ROLLBACK_TYPE"
    echo "Target: $ROLLBACK_TARGET"
    echo ""
    
    read -p "Are you sure you want to proceed? (yes/NO): " confirmation
    
    if [[ "$confirmation" != "yes" ]]; then
        log "Rollback cancelled by user"
        exit 0
    fi
}

# Main rollback function
perform_rollback() {
    log "Starting rollback process..."
    
    # Change to project directory
    cd "$PROJECT_ROOT"
    
    # Load environment variables if available
    if [[ -f ".env.$ENVIRONMENT" ]]; then
        set -a
        source ".env.$ENVIRONMENT"
        set +a
    fi
    
    # Create pre-rollback backup
    create_pre_rollback_backup
    
    # Perform rollback based on target type
    if [[ -d "$ROLLBACK_TARGET" ]]; then
        # Backup directory rollback
        rollback_from_backup "$ROLLBACK_TARGET"
    elif [[ "$ROLLBACK_TARGET" =~ ^[a-f0-9]{7,40}$ ]]; then
        # Git commit rollback
        rollback_from_git "$ROLLBACK_TARGET"
    else
        # Docker tag rollback
        rollback_from_docker_tag "$ROLLBACK_TARGET"
    fi
    
    # Run health checks
    log "Running post-rollback validation..."
    if run_post_rollback_health_checks; then
        success "Rollback completed successfully!"
        send_rollback_notification "success" "Rollback to $ROLLBACK_TARGET completed successfully"
    else
        error "Rollback completed but health checks failed!"
        send_rollback_notification "failure" "Rollback to $ROLLBACK_TARGET completed but health checks failed"
        exit 1
    fi
    
    # Cleanup
    log "Cleaning up temporary files..."
    rm -f docker-compose.rollback.yml
    
    log "Rollback summary:"
    log "- Environment: $ENVIRONMENT"
    log "- Rollback Type: $ROLLBACK_TYPE"
    log "- Target: $ROLLBACK_TARGET"
    log "- Pre-rollback backup: $(cat /tmp/last-pre-rollback-backup 2>/dev/null || echo 'N/A')"
    log "- Rollback log: $ROLLBACK_LOG"
}

# Usage function
usage() {
    echo "Usage: $0 [ENVIRONMENT] [ROLLBACK_TYPE] [ROLLBACK_TARGET]"
    echo ""
    echo "ENVIRONMENT:"
    echo "  production   Rollback production environment (default)"
    echo "  staging      Rollback staging environment"
    echo "  development  Rollback development environment"
    echo ""
    echo "ROLLBACK_TYPE:"
    echo "  full         Full rollback including app, config, and database"
    echo "  app          Application and Docker images only"
    echo "  config       Configuration files only"
    echo "  database     Database only"
    echo ""
    echo "ROLLBACK_TARGET:"
    echo "  <backup-dir> Path to backup directory"
    echo "  <git-hash>   Git commit hash"
    echo "  <docker-tag> Docker image tag"
    echo "  (if not specified, interactive selection will be prompted)"
    echo ""
    echo "Examples:"
    echo "  $0                                                    # Interactive rollback"
    echo "  $0 production full                                    # Interactive full production rollback"
    echo "  $0 staging app v1.2.3                               # Rollback staging app to Docker tag v1.2.3"
    echo "  $0 production database /tmp/portfolio-backup-xyz     # Rollback production database from backup"
    echo "  $0 production full abc123def                         # Rollback production to Git commit"
    echo ""
    echo "Interactive modes:"
    echo "  --list-backups    List available backups"
    echo "  --list-commits    List recent Git commits"
    echo "  --list-images     List available Docker images"
}

# Check for help flag
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    usage
    exit 0
fi

# Handle special listing modes
case "${1:-}" in
    --list-backups)
        list_available_backups
        exit 0
        ;;
    --list-commits)
        list_available_git_commits
        exit 0
        ;;
    --list-images)
        list_available_docker_images
        exit 0
        ;;
esac

# Validation
validate_environment
validate_rollback_type

# Interactive selection if target not specified
if [[ -z "$ROLLBACK_TARGET" ]]; then
    log "No rollback target specified. Starting interactive selection..."
    
    echo ""
    echo "Select rollback source:"
    echo "1. From backup directory"
    echo "2. From Git commit"
    echo "3. From Docker tag"
    read -p "Enter choice (1-3): " choice
    
    case "$choice" in
        1)
            interactive_backup_selection
            ;;
        2)
            interactive_git_selection
            ;;
        3)
            interactive_docker_selection
            ;;
        *)
            error "Invalid choice: $choice"
            exit 1
            ;;
    esac
fi

# Confirmation
confirm_rollback

# Perform rollback
perform_rollback