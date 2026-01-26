# scripts/setup_dev.sh
#!/bin/bash

# Super Legit Advance - Development Setup Script
# This script sets up the development environment

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
BACKEND_DIR="."
FRONTEND_DIR="../frontend"
PYTHON_VERSION="3.11"
NODE_VERSION="18"
DATABASE_NAME="sla_dev"
DATABASE_USER="postgres"
DATABASE_PASSWORD="password"
REDIS_PORT="6379"
CELERY_BROKER_URL="redis://localhost:6379/0"

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Super Legit Advance Dev Setup        ${NC}"
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
    
    # Check operating system
    case "$(uname -s)" in
        Linux*)
            OS="Linux"
            ;;
        Darwin*)
            OS="macOS"
            ;;
        CYGWIN*|MINGW*|MSYS*)
            OS="Windows"
            ;;
        *)
            OS="Unknown"
            ;;
    esac
    
    print_info "Operating System: $OS"
    
    # Check Python version
    if command -v python3 &> /dev/null; then
        PYTHON_VER=$(python3 --version | cut -d' ' -f2)
        print_info "Python version: $PYTHON_VER"
        
        # Check if Python version meets requirements
        REQUIRED_VER="3.8"
        if printf '%s\n' "$REQUIRED_VER" "$PYTHON_VER" | sort -V | head -n1 | grep -q "$REQUIRED_VER"; then
            print_success "Python version meets requirements"
        else
            print_error "Python $PYTHON_VERSION or higher is required"
            print_info "Current version: $PYTHON_VER"
            exit 1
        fi
    else
        print_error "Python 3 is not installed"
        exit 1
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VER=$(node --version | cut -d'v' -f2)
        print_info "Node.js version: $NODE_VER"
        
        # Check if Node version meets requirements
        REQUIRED_NODE_VER="16"
        if printf '%s\n' "$REQUIRED_NODE_VER" "$NODE_VER" | sort -V | head -n1 | grep -q "$REQUIRED_NODE_VER"; then
            print_success "Node.js version meets requirements"
        else
            print_warning "Node.js $NODE_VERSION or higher is recommended"
        fi
    else
        print_warning "Node.js is not installed (needed for frontend)"
    fi
    
    # Check Docker
    if command -v docker &> /dev/null; then
        DOCKER_VER=$(docker --version | cut -d' ' -f3 | tr -d ',')
        print_info "Docker version: $DOCKER_VER"
        print_success "Docker is installed"
    else
        print_warning "Docker is not installed (optional for containerized setup)"
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_VER=$(docker-compose --version | cut -d' ' -f3 | tr -d ',')
        print_info "Docker Compose version: $DOCKER_COMPOSE_VER"
        print_success "Docker Compose is installed"
    else
        print_warning "Docker Compose is not installed (optional)"
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        GIT_VER=$(git --version | cut -d' ' -f3)
        print_info "Git version: $GIT_VER"
        print_success "Git is installed"
    else
        print_warning "Git is not installed (optional for version control)"
    fi
    
    # Check PostgreSQL
    if command -v psql &> /dev/null; then
        PSQL_VER=$(psql --version | cut -d' ' -f3)
        print_info "PostgreSQL version: $PSQL_VER"
        print_success "PostgreSQL client is installed"
    else
        print_warning "PostgreSQL client is not installed"
    fi
    
    # Check Redis
    if command -v redis-cli &> /dev/null; then
        print_info "Redis client is installed"
        print_success "Redis is available"
    else
        print_warning "Redis client is not installed"
    fi
    
    print_success "Prerequisites check completed"
}

setup_python_environment() {
    print_info "Setting up Python environment..."
    
    # Check for virtual environment
    if [ -d "venv" ] || [ -d ".venv" ]; then
        print_info "Virtual environment already exists"
    else
        print_info "Creating Python virtual environment..."
        python3 -m venv venv
        
        if [ $? -eq 0 ]; then
            print_success "Virtual environment created"
        else
            print_error "Failed to create virtual environment"
            exit 1
        fi
    fi
    
    # Activate virtual environment
    print_info "Activating virtual environment..."
    
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    elif [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    else
        print_error "Could not find virtual environment activation script"
        exit 1
    fi
    
    # Upgrade pip
    print_info "Upgrading pip..."
    pip install --upgrade pip
    
    # Install Python dependencies
    print_info "Installing Python dependencies..."
    
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        
        if [ $? -eq 0 ]; then
            print_success "Python dependencies installed"
        else
            print_error "Failed to install Python dependencies"
            exit 1
        fi
    else
        print_warning "requirements.txt not found"
    fi
    
    # Install development dependencies
    print_info "Installing development dependencies..."
    
    if [ -f "requirements-dev.txt" ]; then
        pip install -r requirements-dev.txt
        print_success "Development dependencies installed"
    else
        print_warning "requirements-dev.txt not found"
    fi
    
    # Install package in development mode
    print_info "Installing package in development mode..."
    pip install -e .
    
    print_success "Python environment setup completed"
}

setup_database() {
    print_info "Setting up database..."
    
    # Check if PostgreSQL is running
    if command -v pg_isready &> /dev/null; then
        if pg_isready -q; then
            print_success "PostgreSQL is running"
        else
            print_warning "PostgreSQL is not running"
            print_info "Attempting to start PostgreSQL..."
            
            # Try to start PostgreSQL (platform-specific)
            case "$OS" in
                Linux)
                    if command -v systemctl &> /dev/null; then
                        sudo systemctl start postgresql
                    elif command -v service &> /dev/null; then
                        sudo service postgresql start
                    fi
                    ;;
                macOS)
                    if command -v brew &> /dev/null; then
                        brew services start postgresql
                    fi
                    ;;
            esac
            
            sleep 3
            
            if pg_isready -q; then
                print_success "PostgreSQL started successfully"
            else
                print_error "Could not start PostgreSQL"
                print_info "Please start PostgreSQL manually and run this script again"
                exit 1
            fi
        fi
    else
        print_warning "PostgreSQL client not found, skipping database setup"
        return
    fi
    
    # Create database
    print_info "Creating database '$DATABASE_NAME'..."
    
    if createdb -U "$DATABASE_USER" "$DATABASE_NAME" 2>/dev/null; then
        print_success "Database created"
    else
        print_warning "Database might already exist or there was an error"
    fi
    
    # Create test database
    print_info "Creating test database..."
    createdb -U "$DATABASE_USER" "${DATABASE_NAME}_test" 2>/dev/null || true
    
    # Run migrations
    print_info "Running database migrations..."
    python manage.py migrate --noinput
    
    if [ $? -eq 0 ]; then
        print_success "Database migrations completed"
    else
        print_error "Database migrations failed"
        exit 1
    fi
    
    # Create superuser
    print_info "Creating superuser..."
    
    python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()

# Check if superuser already exists
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@superlegitadvance.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        is_staff=True,
        is_superuser=True
    )
    print('Superuser created:')
    print('  Username: admin')
    print('  Password: admin123')
    print('  Email: admin@superlegitadvance.com')
else:
    print('Superuser already exists')
"
    
    # Create test users
    print_info "Creating test users..."
    
    python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()

# Create manager user
if not User.objects.filter(username='manager').exists():
    User.objects.create_user(
        username='manager',
        email='manager@superlegitadvance.com',
        password='manager123',
        first_name='Jane',
        last_name='Manager',
        is_staff=True,
        is_manager=True
    )
    print('Manager user created: manager / manager123')

# Create staff user
if not User.objects.filter(username='staff').exists():
    User.objects.create_user(
        username='staff',
        email='staff@superlegitadvance.com',
        password='staff123',
        first_name='John',
        last_name='Staff',
        is_staff=True
    )
    print('Staff user created: staff / staff123')

# Create customer user
if not User.objects.filter(username='customer').exists():
    User.objects.create_user(
        username='customer',
        email='customer@superlegitadvance.com',
        password='customer123',
        first_name='Customer',
        last_name='User',
        is_customer=True
    )
    print('Customer user created: customer / customer123')
"
    
    print_success "Database setup completed"
}

setup_redis() {
    print_info "Setting up Redis..."
    
    # Check if Redis is running
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping > /dev/null 2>&1; then
            print_success "Redis is running"
        else
            print_warning "Redis is not running"
            print_info "Attempting to start Redis..."
            
            # Try to start Redis (platform-specific)
            case "$OS" in
                Linux)
                    if command -v systemctl &> /dev/null; then
                        sudo systemctl start redis
                    elif command -v service &> /dev/null; then
                        sudo service redis start
                    fi
                    ;;
                macOS)
                    if command -v brew &> /dev/null; then
                        brew services start redis
                    fi
                    ;;
            esac
            
            sleep 2
            
            if redis-cli ping > /dev/null 2>&1; then
                print_success "Redis started successfully"
            else
                print_warning "Could not start Redis"
                print_info "Redis is optional for Celery and caching"
            fi
        fi
    else
        print_warning "Redis client not found, skipping Redis setup"
    fi
    
    print_success "Redis setup completed"
}

setup_frontend() {
    print_info "Setting up frontend..."
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_warning "Frontend directory not found: $FRONTEND_DIR"
        return
    fi
    
    cd "$FRONTEND_DIR" || {
        print_error "Cannot access frontend directory"
        return
    }
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed, skipping frontend setup"
        cd - > /dev/null
        return
    fi
    
    # Check npm or yarn
    if command -v npm &> /dev/null; then
        PACKAGE_MANAGER="npm"
    elif command -v yarn &> /dev/null; then
        PACKAGE_MANAGER="yarn"
    else
        print_warning "Neither npm nor yarn is installed, skipping frontend setup"
        cd - > /dev/null
        return
    fi
    
    print_info "Using $PACKAGE_MANAGER as package manager"
    
    # Install dependencies
    print_info "Installing frontend dependencies..."
    
    if [ -f "package.json" ]; then
        if [ "$PACKAGE_MANAGER" = "npm" ]; then
            npm install
        else
            yarn install
        fi
        
        if [ $? -eq 0 ]; then
            print_success "Frontend dependencies installed"
        else
            print_error "Failed to install frontend dependencies"
            cd - > /dev/null
            return
        fi
    else
        print_warning "package.json not found"
        cd - > /dev/null
        return
    fi
    
    # Build frontend
    print_info "Building frontend..."
    
    if [ "$PACKAGE_MANAGER" = "npm" ]; then
        npm run build
    else
        yarn build
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Frontend built successfully"
    else
        print_warning "Frontend build failed (this might be normal in development)"
    fi
    
    cd - > /dev/null
    print_success "Frontend setup completed"
}

setup_environment_files() {
    print_info "Setting up environment files..."
    
    # Backend .env file
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_info "Creating .env file from example..."
            cp .env.example .env
            
            # Update with development values
            sed -i.bak 's/DEBUG=False/DEBUG=True/g' .env
            sed -i.bak "s/DATABASE_URL=.*/DATABASE_URL=postgres:\/\/$DATABASE_USER:$DATABASE_PASSWORD@localhost:5432\/$DATABASE_NAME/g" .env
            sed -i.bak "s/REDIS_URL=.*/REDIS_URL=redis:\/\/localhost:6379/g" .env
            sed -i.bak 's/MPESA_ENVIRONMENT=production/MPESA_ENVIRONMENT=sandbox/g' .env
            
            rm -f .env.bak
            print_success "Backend .env file created"
        else
            print_warning ".env.example not found"
        fi
    else
        print_info "Backend .env file already exists"
    fi
    
    # Frontend .env file
    if [ -d "$FRONTEND_DIR" ]; then
        cd "$FRONTEND_DIR" || {
            print_warning "Cannot access frontend directory"
            cd - > /dev/null
            return
        }
        
        if [ ! -f ".env" ]; then
            if [ -f ".env.example" ]; then
                print_info "Creating frontend .env file..."
                cp .env.example .env
                sed -i.bak 's/VITE_API_URL=.*/VITE_API_URL=http:\/\/localhost:8000\/api/g' .env
                rm -f .env.bak
                print_success "Frontend .env file created"
            fi
        fi
        
        cd - > /dev/null
    fi
    
    print_success "Environment files setup completed"
}

setup_docker() {
    print_info "Setting up Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed, skipping Docker setup"
        return
    fi
    
    # Check if Docker Compose file exists
    if [ ! -f "docker-compose.yml" ]; then
        print_warning "docker-compose.yml not found"
        return
    fi
    
    # Build Docker images
    print_info "Building Docker images..."
    docker-compose build
    
    if [ $? -eq 0 ]; then
        print_success "Docker images built successfully"
    else
        print_error "Failed to build Docker images"
        return
    fi
    
    # Create Docker network if needed
    print_info "Setting up Docker network..."
    docker network create super_legit_network 2>/dev/null || true
    
    print_success "Docker setup completed"
}

setup_development_tools() {
    print_info "Setting up development tools..."
    
    # Install pre-commit hooks
    if command -v pre-commit &> /dev/null; then
        print_info "Setting up pre-commit hooks..."
        pre-commit install
        print_success "Pre-commit hooks installed"
    else
        print_warning "pre-commit not installed, skipping hooks setup"
    fi
    
    # Create development directories
    print_info "Creating development directories..."
    
    mkdir -p logs
    mkdir -p media
    mkdir -p staticfiles
    mkdir -p tests/fixtures
    
    # Set permissions
    chmod 755 logs media staticfiles
    
    # Create useful aliases
    print_info "Creating useful aliases..."
    
    ALIAS_FILE="$HOME/.super_legit_aliases"
    
    cat > "$ALIAS_FILE" << 'EOF'
# Super Legit Advance Development Aliases
alias sla-run='python manage.py runserver'
alias sla-migrate='python manage.py migrate'
alias sla-makemigrations='python manage.py makemigrations'
alias sla-shell='python manage.py shell_plus'
alias sla-test='python manage.py test'
alias sla-celery='celery -A super_legit_advance worker -l INFO'
alias sla-celery-beat='celery -A super_legit_advance beat -l INFO'
alias sla-lint='flake8 .'
alias sla-format='black . && isort .'
alias sla-docker-up='docker-compose up'
alias sla-docker-down='docker-compose down'
alias sla-docker-build='docker-compose build'
alias sla-docker-logs='docker-compose logs -f'
EOF
    
    # Add to shell configuration if not already present
    SHELL_CONFIG="$HOME/.bashrc"
    if [ -f "$HOME/.zshrc" ]; then
        SHELL_CONFIG="$HOME/.zshrc"
    fi
    
    if ! grep -q "super_legit_aliases" "$SHELL_CONFIG"; then
        echo "source $ALIAS_FILE" >> "$SHELL_CONFIG"
        print_info "Aliases added to $SHELL_CONFIG"
        print_info "Run 'source $SHELL_CONFIG' to load aliases"
    fi
    
    print_success "Development tools setup completed"
}

run_health_check() {
    print_info "Running health check..."
    
    echo -e "${BLUE}--- Service Status ---${NC}"
    
    # Check Django
    if python manage.py check --deploy 2>/dev/null | grep -q "System check identified no issues"; then
        print_success "Django: OK"
    else
        print_warning "Django: Issues found (normal in development)"
    fi
    
    # Check database
    if python manage.py check --database default 2>/dev/null | grep -q "System check identified no issues"; then
        print_success "Database: OK"
    else
        print_error "Database: Connection issue"
    fi
    
    # Check Redis
    if command -v redis-cli &> /dev/null && redis-cli ping > /dev/null 2>&1; then
        print_success "Redis: OK"
    else
        print_warning "Redis: Not running (optional)"
    fi
    
    # Check frontend
    if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/package.json" ]; then
        print_success "Frontend: Setup detected"
    else
        print_info "Frontend: Not configured"
    fi
    
    echo -e "${BLUE}--- Development URLs ---${NC}"
    echo "  Django Admin: http://localhost:8000/admin"
    echo "  API: http://localhost:8000/api"
    echo "  API Docs: http://localhost:8000/api/docs"
    echo "  Frontend: http://localhost:3000"
    
    echo -e "${BLUE}--- Test Credentials ---${NC}"
    echo "  Admin: admin / admin123"
    echo "  Manager: manager / manager123"
    echo "  Staff: staff / staff123"
    echo "  Customer: customer / customer123"
    
    print_success "Health check completed"
}

show_help() {
    print_header
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  all          - Complete development setup (default)"
    echo "  python       - Setup Python environment only"
    echo "  database     - Setup database only"
    echo "  frontend     - Setup frontend only"
    echo "  docker       - Setup Docker only"
    echo "  env          - Setup environment files only"
    echo "  tools        - Setup development tools only"
    echo "  check        - Run health check only"
    echo "  help         - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0            # Complete setup"
    echo "  $0 python     # Setup Python only"
    echo "  $0 database   # Setup database only"
    echo "  $0 check      # Run health check"
    echo ""
}

# Main script
main() {
    local command=${1:-"all"}
    
    print_header
    
    case $command in
        all)
            check_prerequisites
            setup_python_environment
            setup_environment_files
            setup_database
            setup_redis
            setup_frontend
            setup_docker
            setup_development_tools
            run_health_check
            
            print_success "🎉 Development setup completed successfully!"
            print_info "Next steps:"
            print_info "  1. Start Django: python manage.py runserver"
            print_info "  2. Start frontend: cd frontend && npm run dev"
            print_info "  3. Access the application at http://localhost:3000"
            print_info "  4. Check README.md for more details"
            ;;
        
        python)
            check_prerequisites
            setup_python_environment
            ;;
        
        database)
            check_prerequisites
            setup_database
            ;;
        
        frontend)
            check_prerequisites
            setup_frontend
            ;;
        
        docker)
            check_prerequisites
            setup_docker
            ;;
        
        env)
            setup_environment_files
            ;;
        
        tools)
            setup_development_tools
            ;;
        
        check)
            check_prerequisites
            run_health_check
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

# Run main function
main "$@"