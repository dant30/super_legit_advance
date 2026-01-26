# scripts/backup_db.sh
#!/bin/bash

# Super Legit Advance - Database Backup Script
# This script handles database backups for PostgreSQL

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
BACKUP_DIR="../backups"
LOG_DIR="../logs"
RETENTION_DAYS=7
COMPRESS=true
ENCRYPT=false
ENCRYPT_PASSWORD=""
NOTIFY=false
NOTIFY_EMAIL="admin@superlegitadvance.com"

# Database configuration
DB_NAME="sla_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Super Legit Advance Database Backup  ${NC}"
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

log_message() {
    local message=$1
    local log_file="$LOG_DIR/backup_$(date +%Y%m%d).log"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $message" | tee -a "$log_file"
}

check_directories() {
    print_info "Checking directories..."
    
    # Create backup directory if it doesn't exist
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        chmod 750 "$BACKUP_DIR"
        print_success "Created backup directory: $BACKUP_DIR"
    fi
    
    # Create log directory if it doesn't exist
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        chmod 750 "$LOG_DIR"
        print_success "Created log directory: $LOG_DIR"
    fi
    
    # Create daily backup directory
    local daily_dir="$BACKUP_DIR/$(date +%Y%m%d)"
    if [ ! -d "$daily_dir" ]; then
        mkdir -p "$daily_dir"
        chmod 750 "$daily_dir"
    fi
}

check_database_connection() {
    print_info "Checking database connection..."
    
    # Check if PostgreSQL client is installed
    if ! command -v pg_isready &> /dev/null; then
        print_error "PostgreSQL client (pg_isready) is not installed"
        exit 1
    fi
    
    # Check database connection
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
        print_success "Database connection successful"
    else
        print_error "Cannot connect to database"
        print_info "Trying with docker-compose..."
        
        # Try docker-compose method
        if command -v docker-compose &> /dev/null; then
            if docker-compose exec db pg_isready -U postgres > /dev/null 2>&1; then
                print_success "Database connection via Docker successful"
                USE_DOCKER=true
            else
                print_error "Database is not accessible"
                exit 1
            fi
        else
            print_error "Please check if database is running"
            exit 1
        fi
    fi
}

backup_database() {
    local backup_type=$1
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_filename="${DB_NAME}_${backup_type}_${timestamp}.sql"
    local backup_path="$BACKUP_DIR/$(date +%Y%m%d)/$backup_filename"
    
    print_info "Starting $backup_type backup..."
    log_message "Starting $backup_type backup"
    
    # Perform backup based on method
    if [ "${USE_DOCKER:-false}" = true ]; then
        # Backup using docker-compose
        print_info "Using Docker method for backup"
        
        if [ "$backup_type" = "full" ]; then
            docker-compose exec -T db pg_dumpall -U "$DB_USER" > "$backup_path"
        else
            docker-compose exec -T db pg_dump -U "$DB_USER" "$DB_NAME" > "$backup_path"
        fi
    else
        # Backup using local PostgreSQL client
        print_info "Using local PostgreSQL client for backup"
        
        if [ "$backup_type" = "full" ]; then
            pg_dumpall -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > "$backup_path"
        else
            pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$backup_path"
        fi
    fi
    
    # Check if backup was successful
    if [ $? -eq 0 ] && [ -s "$backup_path" ]; then
        local backup_size=$(du -h "$backup_path" | cut -f1)
        print_success "$backup_type backup completed: $backup_path ($backup_size)"
        log_message "$backup_type backup completed: $backup_path ($backup_size)"
        
        # Process backup file
        process_backup_file "$backup_path" "$backup_type"
        
        echo "$backup_path"
    else
        print_error "Backup failed or created empty file"
        log_message "ERROR: Backup failed or created empty file"
        
        # Clean up failed backup
        if [ -f "$backup_path" ]; then
            rm -f "$backup_path"
        fi
        
        exit 1
    fi
}

process_backup_file() {
    local backup_path=$1
    local backup_type=$2
    
    print_info "Processing backup file..."
    
    # Compress backup if enabled
    if [ "$COMPRESS" = true ]; then
        print_info "Compressing backup..."
        gzip "$backup_path"
        backup_path="${backup_path}.gz"
        print_success "Backup compressed: $backup_path"
        log_message "Backup compressed: $backup_path"
    fi
    
    # Encrypt backup if enabled
    if [ "$ENCRYPT" = true ] && [ -n "$ENCRYPT_PASSWORD" ]; then
        print_info "Encrypting backup..."
        
        if command -v gpg &> /dev/null; then
            echo "$ENCRYPT_PASSWORD" | gpg --batch --yes --passphrase-fd 0 -c "$backup_path"
            if [ $? -eq 0 ]; then
                rm -f "$backup_path"
                backup_path="${backup_path}.gpg"
                print_success "Backup encrypted: $backup_path"
                log_message "Backup encrypted: $backup_path"
            else
                print_warning "Encryption failed, keeping unencrypted backup"
            fi
        else
            print_warning "GPG not installed, skipping encryption"
        fi
    fi
    
    # Set secure permissions
    chmod 600 "$backup_path"
    
    # Create checksum
    print_info "Creating checksum..."
    sha256sum "$backup_path" > "${backup_path}.sha256"
    print_success "Checksum created: ${backup_path}.sha256"
}

cleanup_old_backups() {
    print_info "Cleaning up old backups..."
    log_message "Cleaning up backups older than $RETENTION_DAYS days"
    
    local deleted_count=0
    
    # Find and delete old backup directories
    find "$BACKUP_DIR" -type d -name "20*" -mtime +$RETENTION_DAYS | while read dir; do
        print_info "Deleting old backup directory: $dir"
        rm -rf "$dir"
        deleted_count=$((deleted_count + 1))
        log_message "Deleted backup directory: $dir"
    done
    
    # Also delete individual backup files in root backup directory
    find "$BACKUP_DIR" -maxdepth 1 -type f -name "*.sql*" -mtime +$RETENTION_DAYS | while read file; do
        print_info "Deleting old backup file: $file"
        rm -f "$file"
        deleted_count=$((deleted_count + 1))
        log_message "Deleted backup file: $file"
    done
    
    if [ $deleted_count -gt 0 ]; then
        print_success "Cleaned up $deleted_count old backup(s)"
    else
        print_info "No old backups to clean up"
    fi
}

verify_backup() {
    local backup_path=$1
    
    print_info "Verifying backup integrity..."
    
    # Check if backup file exists
    if [ ! -f "$backup_path" ]; then
        print_error "Backup file not found: $backup_path"
        return 1
    fi
    
    # Verify checksum if exists
    local checksum_file="${backup_path}.sha256"
    if [ -f "$checksum_file" ]; then
        if sha256sum -c "$checksum_file" > /dev/null 2>&1; then
            print_success "Backup integrity verified (checksum match)"
            log_message "Backup integrity verified: $backup_path"
            return 0
        else
            print_error "Backup integrity check failed (checksum mismatch)"
            log_message "ERROR: Backup integrity check failed: $backup_path"
            return 1
        fi
    else
        print_warning "No checksum file found, skipping integrity check"
        return 0
    fi
}

send_notification() {
    local subject=$1
    local message=$2
    local backup_path=$3
    
    if [ "$NOTIFY" = false ]; then
        return
    fi
    
    print_info "Sending notification..."
    
    local email_body="Super Legit Advance Database Backup Report\n"
    email_body+="============================================\n"
    email_body+="Project: $PROJECT_NAME\n"
    email_body+="Timestamp: $(date)\n"
    email_body+="Backup Type: $subject\n"
    email_body+="Backup Location: $backup_path\n"
    email_body+="Size: $(du -h "$backup_path" | cut -f1)\n"
    email_body+="Status: SUCCESS\n"
    email_body+="\n$message\n"
    
    if command -v mail &> /dev/null; then
        echo -e "$email_body" | mail -s "Database Backup: $subject" "$NOTIFY_EMAIL"
        print_success "Notification sent to $NOTIFY_EMAIL"
    else
        print_warning "Mail command not available, skipping notification"
    fi
}

backup_media_files() {
    print_info "Backing up media files..."
    log_message "Starting media files backup"
    
    local media_backup_dir="$BACKUP_DIR/media_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$media_backup_dir"
    
    # Copy media files
    if [ -d "../media" ]; then
        cp -r ../media "$media_backup_dir/"
        print_success "Media files backed up to: $media_backup_dir"
        log_message "Media files backed up to: $media_backup_dir"
    else
        print_warning "Media directory not found"
        log_message "WARNING: Media directory not found"
    fi
    
    # Compress media backup
    print_info "Compressing media backup..."
    tar -czf "${media_backup_dir}.tar.gz" -C "$media_backup_dir" .
    rm -rf "$media_backup_dir"
    
    print_success "Media backup compressed: ${media_backup_dir}.tar.gz"
    echo "${media_backup_dir}.tar.gz"
}

list_backups() {
    print_header
    print_info "Available backups:"
    
    echo -e "${BLUE}Database Backups:${NC}"
    find "$BACKUP_DIR" -type f -name "*.sql*" | sort | while read file; do
        local size=$(du -h "$file" | cut -f1)
        local date=$(stat -c %y "$file" | cut -d' ' -f1)
        echo "  $file ($size, $date)"
    done
    
    echo ""
    echo -e "${BLUE}Media Backups:${NC}"
    find "$BACKUP_DIR" -type f -name "*media_backup*.tar.gz" | sort | while read file; do
        local size=$(du -h "$file" | cut -f1)
        local date=$(stat -c %y "$file" | cut -d' ' -f1)
        echo "  $file ($size, $date)"
    done
    
    echo ""
    echo -e "${BLUE}Backup Statistics:${NC}"
    local total_size=$(du -sh "$BACKUP_DIR" | cut -f1)
    local file_count=$(find "$BACKUP_DIR" -type f -name "*.sql*" -o -name "*media_backup*.tar.gz" | wc -l)
    echo "  Total backups: $file_count"
    echo "  Total size: $total_size"
}

restore_backup() {
    local backup_file=$1
    local restore_type=${2:-"database"}
    
    print_header
    print_warning "RESTORE OPERATION - This will overwrite existing data!"
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    # Ask for confirmation
    read -p "Are you sure you want to restore from $backup_file? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Restore cancelled"
        exit 0
    fi
    
    print_info "Starting restore from: $backup_file"
    log_message "Starting restore from: $backup_file"
    
    if [ "$restore_type" = "database" ]; then
        restore_database "$backup_file"
    elif [ "$restore_type" = "media" ]; then
        restore_media "$backup_file"
    else
        print_error "Unknown restore type: $restore_type"
        exit 1
    fi
}

restore_database() {
    local backup_file=$1
    
    print_info "Restoring database..."
    
    # Stop application services if running
    print_info "Stopping application services..."
    if command -v docker-compose &> /dev/null; then
        docker-compose stop backend || true
    fi
    
    # Determine file type and decompress if needed
    local restore_file="$backup_file"
    
    if [[ "$backup_file" == *.gz ]]; then
        print_info "Decompressing backup..."
        gunzip -c "$backup_file" > "/tmp/restore_temp.sql"
        restore_file="/tmp/restore_temp.sql"
    fi
    
    if [[ "$backup_file" == *.gpg ]]; then
        print_info "Decrypting backup..."
        if [ -z "$ENCRYPT_PASSWORD" ]; then
            read -sp "Enter decryption password: " ENCRYPT_PASSWORD
            echo
        fi
        echo "$ENCRYPT_PASSWORD" | gpg --batch --yes --passphrase-fd 0 -d "$backup_file" > "/tmp/restore_temp.sql"
        restore_file="/tmp/restore_temp.sql"
    fi
    
    # Perform restore
    if [ "${USE_DOCKER:-false}" = true ]; then
        # Check if it's a full backup (pg_dumpall)
        if head -n 5 "$restore_file" | grep -q "pg_dumpall"; then
            print_info "Restoring full database backup..."
            docker-compose exec -T db psql -U "$DB_USER" < "$restore_file"
        else
            print_info "Restoring single database backup..."
            # Drop and recreate database
            docker-compose exec db dropdb -U "$DB_USER" "$DB_NAME" --if-exists
            docker-compose exec db createdb -U "$DB_USER" "$DB_NAME"
            docker-compose exec -T db psql -U "$DB_USER" "$DB_NAME" < "$restore_file"
        fi
    else
        # Local restore
        if head -n 5 "$restore_file" | grep -q "pg_dumpall"; then
            psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" < "$restore_file"
        else
            dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" --if-exists
            createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
            psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" < "$restore_file"
        fi
    fi
    
    # Cleanup temporary file
    if [ "$restore_file" != "$backup_file" ]; then
        rm -f "$restore_file"
    fi
    
    # Start application services
    print_info "Starting application services..."
    if command -v docker-compose &> /dev/null; then
        docker-compose start backend || true
    fi
    
    print_success "Database restore completed successfully"
    log_message "Database restore completed from: $backup_file"
}

restore_media() {
    local backup_file=$1
    
    print_info "Restoring media files..."
    
    # Create temporary directory for extraction
    local temp_dir="/tmp/media_restore_$(date +%s)"
    mkdir -p "$temp_dir"
    
    # Extract backup
    tar -xzf "$backup_file" -C "$temp_dir"
    
    # Restore media files
    if [ -d "$temp_dir/media" ]; then
        # Backup existing media
        if [ -d "../media" ]; then
            local media_backup="../media_backup_before_restore_$(date +%Y%m%d_%H%M%S)"
            cp -r ../media "$media_backup"
            print_info "Existing media backed up to: $media_backup"
        fi
        
        # Restore new media
        rm -rf ../media
        cp -r "$temp_dir/media" ../
        
        # Set proper permissions
        chmod -R 755 ../media
        
        print_success "Media files restored successfully"
        log_message "Media files restored from: $backup_file"
    else
        print_error "No media directory found in backup"
        log_message "ERROR: No media directory found in backup: $backup_file"
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
}

show_help() {
    print_header
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  backup [TYPE]     - Create database backup (full|schema|data, default: full)"
    echo "  media             - Backup media files"
    echo "  list              - List available backups"
    echo "  verify [FILE]     - Verify backup integrity"
    echo "  restore [FILE]    - Restore from backup"
    echo "  cleanup           - Clean up old backups"
    echo "  help              - Show this help"
    echo ""
    echo "Options:"
    echo "  --compress        - Compress backup (default: true)"
    echo "  --encrypt         - Encrypt backup"
    echo "  --retention DAYS  - Number of days to keep backups (default: 7)"
    echo "  --notify          - Send email notification"
    echo "  --password PASS   - Encryption password"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 backup schema"
    echo "  $0 media"
    echo "  $0 list"
    echo "  $0 verify backups/20240101/db_backup.sql.gz"
    echo "  $0 restore backups/20240101/db_backup.sql.gz"
    echo "  $0 cleanup"
    echo ""
}

# Main script
main() {
    local command=${1:-"help"}
    local arg1=${2:-""}
    
    # Load configuration from file if exists
    if [ -f "backup_config.conf" ]; then
        source "backup_config.conf"
    fi
    
    case $command in
        backup)
            local backup_type=${arg1:-"full"}
            
            if [[ ! "$backup_type" =~ ^(full|schema|data)$ ]]; then
                print_error "Invalid backup type: $backup_type"
                echo "Valid types: full, schema, data"
                exit 1
            fi
            
            print_header
            check_directories
            check_database_connection
            
            backup_path=$(backup_database "$backup_type")
            
            verify_backup "$backup_path"
            
            cleanup_old_backups
            
            send_notification "Database Backup ($backup_type)" "Backup completed successfully" "$backup_path"
            
            print_success "Backup process completed!"
            ;;
        
        media)
            print_header
            check_directories
            
            backup_path=$(backup_media_files)
            
            cleanup_old_backups
            
            send_notification "Media Backup" "Media backup completed successfully" "$backup_path"
            
            print_success "Media backup completed!"
            ;;
        
        list)
            list_backups
            ;;
        
        verify)
            if [ -z "$arg1" ]; then
                print_error "Please specify backup file to verify"
                exit 1
            fi
            
            print_header
            verify_backup "$arg1"
            ;;
        
        restore)
            if [ -z "$arg1" ]; then
                print_error "Please specify backup file to restore"
                exit 1
            fi
            
            local restore_type="database"
            if [[ "$arg1" == *media_backup* ]]; then
                restore_type="media"
            fi
            
            restore_backup "$arg1" "$restore_type"
            ;;
        
        cleanup)
            print_header
            check_directories
            cleanup_old_backups
            print_success "Cleanup completed!"
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