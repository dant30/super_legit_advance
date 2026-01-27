#!/usr/bin/env bash
set -euo pipefail

# Backend build script for Render
# - Installs deps (optional if Render handles)
# - Waits for DB
# - Runs migrations and collects static files

cd "$(dirname "$0")"

# Optional: install deps if Render doesn't
if [ -f "requirements.txt" ]; then
  python -m pip install --upgrade pip
  pip install -r requirements.txt
fi

# Wait for DB to be ready (uses DATABASE_URL)
echo "Waiting for database..."
MAX_RETRIES=20
SLEEP=3
n=0
until python - <<'PY' 2>/dev/null
import os, sys
from urllib.parse import urlparse
import psycopg2
url = os.environ.get('DATABASE_URL')
if not url:
    sys.exit(1)
p = urlparse(url)
conn = psycopg2.connect(dbname=p.path.lstrip('/'), user=p.username, password=p.password, host=p.hostname, port=p.port)
conn.close()
print("DB ok")
PY
do
  n=$((n+1))
  if [ $n -ge $MAX_RETRIES ]; then
    echo "Database did not become available after $MAX_RETRIES attempts" >&2
    exit 1
  fi
  echo "DB not ready, retrying in $SLEEP seconds... ($n/$MAX_RETRIES)"
  sleep $SLEEP
done

echo "Running Django migrations..."
export DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE:-super_legit_advance.settings.production}
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

# Optionally create default data / superuser (uncomment if desired)
# python manage.py loaddata initial_data.json
# echo "from django.contrib.auth import get_user_model; User = get_user_model(); \
# if not User.objects.filter(username='admin').exists(): User.objects.create_superuser('admin','admin@local','admin123')" | python manage.py shell

echo "Build script completed."