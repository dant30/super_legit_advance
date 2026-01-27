#!/usr/bin/env bash
set -euo pipefail

# Super Legit Advance - Render Build Script
# This script prepares the Django app for deployment on Render

echo "🔨 Building Super Legit Advance..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements/prod.txt

# 2. Wait for database to be ready
echo "⏳ Waiting for database to be available..."
MAX_RETRIES=20
SLEEP=3
n=0

until python -c "
import os
import sys
from urllib.parse import urlparse
try:
    import psycopg2
    url = os.environ.get('DATABASE_URL')
    if not url:
        sys.exit(1)
    p = urlparse(url)
    conn = psycopg2.connect(
        dbname=p.path.lstrip('/'),
        user=p.username,
        password=p.password,
        host=p.hostname,
        port=p.port or 5432
    )
    conn.close()
    print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database not ready: {e}')
    sys.exit(1)
" 2>/dev/null; do
  n=$((n+1))
  if [ $n -ge $MAX_RETRIES ]; then
    echo "❌ Database did not become available after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "  Retrying in $SLEEP seconds... ($n/$MAX_RETRIES)"
  sleep $SLEEP
done

# 3. Run migrations
echo "🗄️  Running database migrations..."
python manage.py migrate --noinput

# 4. Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear

# 5. Create default data (optional)
echo "🌱 Setting up default data..."
python manage.py setup_default_data

echo "✅ Build completed successfully!"