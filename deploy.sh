#!/bin/bash

# Exit on error
set -e

# Create required directories
mkdir -p data/certbot/conf
mkdir -p data/certbot/www
mkdir -p nginx/ssl
mkdir -p nginx/conf.d

# Generate strong DH parameters for SSL
openssl dhparam -out nginx/ssl/dhparam.pem 2048

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
SECRET_KEY=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 16)
EOF
fi

# Initial SSL certificate setup
echo "Getting SSL certificates..."
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot \
    -d sunobot.com -d www.sunobot.com -d api.sunobot.com \
    --email your-email@example.com --agree-tos --no-eff-email

# Start the services
echo "Starting services..."
docker-compose up -d

# Wait for services to be up
echo "Waiting for services to start..."
sleep 10

# Create database backup directory
mkdir -p backups

# Set up automatic daily backups
(crontab -l 2>/dev/null; echo "0 0 * * * $(pwd)/backup.sh") | crontab -

echo "Deployment complete! Your application is now running at https://sunobot.com"
echo "Please make sure to:"
echo "1. Update your DNS settings to point to this server"
echo "2. Replace 'your-email@example.com' in this script with your actual email"
echo "3. Configure your firewall to allow only ports 80 and 443" 