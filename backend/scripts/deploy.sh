# scripts/deploy.sh
#!/bin/bash

# Super Legit Advance - Deployment Script
# This script automates the deployment of the loan management system

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="super_legit_advance"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
ENV_FILE=".env"
DOCKER_COMPOSE="docker-compose.yml"
DOCKER_COMPOSE_PROD="docker-compose.prod.yml"
LOG_DIR="logs"
BACKUP_DIR="backups"

# Environment options
ENVIRONMENTS=("development" "staging" "production")
DEFAULT_ENVIRONMENT="development"

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Super Legit Advance Deployment       ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ Error: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Git is installed
    if ! command -v git &> /dev/null; then
        print_warning "Git is not installed. Some features may not work properly."
    fi
    
    print_success "Prerequisites check passed"
}

setup_environment() {
    local env=$1
    
    print_info "Setting up $env environment..."
    
    # Create necessary directories
    mkdir -p $LOG_DIR
    mkdir -p $BACKUP_DIR
    mkdir -p $BACKEND_DIR/media
    mkdir -p $BACKEND_DIR/staticfiles
    mkdir -p $BACKEND_DIR/logs
    
    # Set proper permissions
    chmod 755 $BACKEND_DIR/media
    chmod 755 $BACKEND_DIR/staticfiles
    chmod 755 $BACKEND_DIR/logs
    chmod 755 $LOG_DIR
    chmod 755 $BACKUP_DIR
    
    # Check for environment file
    if [ ! -f "$BACKEND_DIR/$ENV_FILE" ]; then
        if [ -f "$BACKEND_DIR/${ENV_FILE}.example" ]; then
            print_warning "Environment file not found. Creating from example..."
            cp "$BACKEND_DIR/${ENV_FILE}.example" "$BACKEND_DIR/$ENV_FILE"
            print_success "Created environment file from example"
            print_warning "Please edit $BACKEND_DIR/$ENV_FILE with your configuration"
        else
            print_error "Environment file not found and no example file available"
            exit 1
        fi
    fi
    
    # Frontend environment file
    if [ ! -f "$FRONTEND_DIR/$ENV_FILE" ]; then
        if [ -f "$FRONTEND_DIR/${ENV_FILE}.example" ]; then
            cp "$FRONTEND_DIR/${ENV_FILE}.example" "$FRONTEND_DIR/$ENV_FILE"
        fi
    fi
    
    print_success "Environment setup completed"
}

load_environment() {
    local env=$1
    
    # Load environment-specific variables
    if [ -f ".env.$env" ]; then
        print_info "Loading environment variables from .env.$env"
        source ".env.$env"
    fi
    
    # Set Docker Compose file based on environment
    if [ "$env" = "production" ]; then
        DOCKER_COMPOSE_FILE=$DOCKER_COMPOSE_PROD
    else
        DOCKER_COMPOSE_FILE=$DOCKER_COMPOSE
    fi
    
    export DEPLOYMENT_ENV=$env
}

build_containers() {
    local env=$1
    
    print_info "Building Docker containers for $env environment..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE build
    
    if [ $? -eq 0 ]; then
        print_success "Containers built successfully"
    else
        print_error "Failed to build containers"
        exit 1
    fi
}

start_services() {
    local env=$1
    
    print_info "Starting services for $env environment..."
    
    # Start all services
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    if [ $? -eq 0 ]; then
        print_success "Services started successfully"
        
        # Show service status
        sleep 5
        print_info "Service status:"
        docker-compose -f $DOCKER_COMPOSE_FILE ps
    else
        print_error "Failed to start services"
        exit 1
    fi
}

stop_services() {
    local env=$1
    
    print_info "Stopping services for $env environment..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE down
    
    if [ $? -eq 0 ]; then
        print_success "Services stopped successfully"
    else
        print_error "Failed to stop services"
        exit 1
    fi
}

restart_services() {
    local env=$1
    
    print_info "Restarting services for $env environment..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE restart
    
    if [ $? -eq 0 ]; then
        print_success "Services restarted successfully"
    else
        print_error "Failed to restart services"
        exit 1
    fi
}

run_migrations() {
    local env=$1
    
    print_info "Running database migrations for $env environment..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE exec backend python manage.py migrate --noinput
    
    if [ $? -eq 0 ]; then
        print_success "Migrations completed successfully"
    else
        print_error "Migrations failed"
        exit 1
    fi
}

collect_static() {
    local env=$1
    
    print_info "Collecting static files for $env environment..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE exec backend python manage.py collectstatic --noinput
    
    if [ $? -eq 0 ]; then
        print_success "Static files collected successfully"
    else
        print_error "Failed to collect static files"
        exit 1
    fi
}

create_superuser() {
    local env=$1
    
    print_info "Creating superuser for $env environment..."
    
    # Check if superuser already exists
    docker-compose -f $DOCKER_COMPOSE_FILE exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('No superuser found. Creating one...')
    User.objects.create_superuser('admin', 'admin@superlegitadvance.com', 'admin123')
    print('Superuser created: username=admin, password=admin123')
else:
    print('Superuser already exists')
"
    
    print_success "Superuser check completed"
}

run_tests() {
    local env=$1
    
    print_info "Running tests for $env environment..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE exec backend python manage.py test
    
    if [ $? -eq 0 ]; then
        print_success "All tests passed"
    else
        print_error "Tests failed"
        exit 1
    fi
}

backup_database() {
    local env=$1
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$BACKUP_DIR/db_backup_${env}_${timestamp}.sql"
    
    print_info "Creating database backup for $env environment..."
    
    # Create backup directory if it doesn't exist
    mkdir -p $BACKUP_DIR
    
    # Backup PostgreSQL database
    docker-compose -f $DOCKER_COMPOSE_FILE exec db pg_dump -U postgres sla_db > $backup_file
    
    if [ $? -eq 0 ] && [ -s "$backup_file" ]; then
        print_success "Database backup created: $backup_file"
        
        # Compress backup
        gzip $backup_file
        print_success "Backup compressed: ${backup_file}.gz"
        
        # Keep only last 7 backups
        ls -t $BACKUP_DIR/db_backup_${env}_*.sql.gz | tail -n +8 | xargs rm -f
        
    else
        print_error "Failed to create database backup"
        rm -f $backup_file
        exit 1
    fi
}

restore_database() {
    local env=$1
    local backup_file=$2
    
    if [ -z "$backup_file" ]; then
        # Get latest backup
        backup_file=$(ls -t $BACKUP_DIR/db_backup_${env}_*.sql.gz | head -1)
        
        if [ -z "$backup_file" ]; then
            print_error "No backup files found for $env environment"
            exit 1
        fi
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_warning "This will restore the database from backup: $backup_file"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_info "Restore cancelled"
        return
    fi
    
    print_info "Restoring database from backup..."
    
    # Stop backend to prevent connections during restore
    docker-compose -f $DOCKER_COMPOSE_FILE stop backend
    
    # Decompress and restore
    gunzip -c $backup_file | docker-compose -f $DOCKER_COMPOSE_FILE exec -T db psql -U postgres sla_db
    
    # Start backend again
    docker-compose -f $DOCKER_COMPOSE_FILE start backend
    
    print_success "Database restored successfully from $backup_file"
}

view_logs() {
    local env=$1
    local service=${2:-""}
    
    print_info "Viewing logs for $env environment..."
    
    if [ -z "$service" ]; then
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f
    else
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f $service
    fi
}

cleanup_containers() {
    print_info "Cleaning up Docker containers and images..."
    
    # Remove stopped containers
    docker-compose -f $DOCKER_COMPOSE_FILE down --rmi all --volumes --remove-orphans
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    print_success "Cleanup completed"
}

monitor_system() {
    print_info "System monitoring..."
    
    echo -e "${BLUE}--- Docker Containers ---${NC}"
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    
    echo -e "${BLUE}--- Disk Usage ---${NC}"
    df -h
    
    echo -e "${BLUE}--- Memory Usage ---${NC}"
    free -h
    
    echo -e "${BLUE}--- Log Files ---${NC}"
    ls -la $LOG_DIR/
}

update_code() {
    local env=$1
    
    print_info "Updating code from repository..."
    
    if [ -d ".git" ]; then
        git pull origin main
        
        if [ $? -eq 0 ]; then
            print_success "Code updated successfully"
        else
            print_error "Failed to update code"
            exit 1
        fi
    else
        print_warning "Not a git repository. Skipping code update."
    fi
}

deploy_full() {
    local env=$1
    
    print_header
    print_info "Starting full deployment for $env environment"
    
    # Load environment
    load_environment $env
    
    # Check prerequisites
    check_prerequisites
    
    # Setup environment
    setup_environment $env
    
    # Backup database
    backup_database $env
    
    # Update code (if git repository)
    update_code $env
    
    # Build containers
    build_containers $env
    
    # Run migrations
    run_migrations $env
    
    # Collect static files
    collect_static $env
    
    # Start services
    start_services $env
    
    # Create superuser if needed
    create_superuser $env
    
    # Run tests
    run_tests $env
    
    print_success "Full deployment completed successfully!"
    print_info "Access points:"
    print_info "  - Backend API: http://localhost:8000"
    print_info "  - Frontend: http://localhost:3000"
    print_info "  - Admin: http://localhost:8000/admin"
    print_info "  - API Docs: http://localhost:8000/api/docs/"
}

show_help() {
    print_header
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  deploy       - Full deployment (build, migrate, start)"
    echo "  start        - Start services"
    echo "  stop         - Stop services"
    echo "  restart      - Restart services"
    echo "  build        - Build containers"
    echo "  migrate      - Run database migrations"
    echo "  collectstatic - Collect static files"
    echo "  test         - Run tests"
    echo "  backup       - Backup database"
    echo "  restore [FILE] - Restore database from backup"
    echo "  logs [SERVICE] - View logs"
    echo "  monitor      - Monitor system resources"
    echo "  cleanup      - Cleanup Docker resources"
    echo "  superuser    - Create superuser"
    echo "  help         - Show this help"
    echo ""
    echo "Environments:"
    for env in "${ENVIRONMENTS[@]}"; do
        echo "  - $env"
    done
    echo ""
    echo "Examples:"
    echo "  $0 deploy production"
    echo "  $0 start development"
    echo "  $0 logs backend"
    echo "  $0 backup staging"
    echo ""
}

# Main script
main() {
    local command=${1:-"help"}
    local environment=${2:-"$DEFAULT_ENVIRONMENT"}
    
    # Validate environment
    if [[ ! " ${ENVIRONMENTS[@]} " =~ " ${environment} " ]]; then
        print_error "Invalid environment: $environment"
        echo "Valid environments: ${ENVIRONMENTS[*]}"
        exit 1
    fi
    
    case $command in
        deploy)
            deploy_full $environment
            ;;
        start)
            load_environment $environment
            start_services $environment
            ;;
        stop)
            load_environment $environment
            stop_services $environment
            ;;
        restart)
            load_environment $environment
            restart_services $environment
            ;;
        build)
            load_environment $environment
            build_containers $environment
            ;;
        migrate)
            load_environment $environment
            run_migrations $environment
            ;;
        collectstatic)
            load_environment $environment
            collect_static $environment
            ;;
        test)
            load_environment $environment
            run_tests $environment
            ;;
        backup)
            load_environment $environment
            backup_database $environment
            ;;
        restore)
            local backup_file=${3:-""}
            load_environment $environment
            restore_database $environment $backup_file
            ;;
        logs)
            local service=${3:-""}
            load_environment $environment
            view_logs $environment $service
            ;;
        monitor)
            load_environment $environment
            monitor_system
            ;;
        cleanup)
            load_environment $environment
            cleanup_containers
            ;;
        superuser)
            load_environment $environment
            create_superuser $environment
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"