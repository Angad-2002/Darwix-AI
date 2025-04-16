#!/bin/bash

# Exit on error
set -e

# Set backup directory
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL database
echo "Backing up PostgreSQL database..."
docker-compose exec -T db pg_dump -U postgres sunobot > "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup environment variables
echo "Backing up environment variables..."
cp .env "$BACKUP_DIR/env_backup_$DATE"

# Backup SSL certificates
echo "Backing up SSL certificates..."
tar -czf "$BACKUP_DIR/ssl_backup_$DATE.tar.gz" data/certbot/conf/

# Backup nginx configuration
echo "Backing up nginx configuration..."
tar -czf "$BACKUP_DIR/nginx_backup_$DATE.tar.gz" nginx/

# Remove backups older than 30 days
find "$BACKUP_DIR" -type f -mtime +30 -exec rm {} \;

echo "Backup completed successfully!" 