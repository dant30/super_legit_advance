#!/usr/bin/env bash
set -euo pipefail

# Super Legit Advance - Render Build Script
# Prepares Django + Frontend for deployment

echo "🔨 Building Super Legit Advance..."

############################################
# 1. Install backend dependencies
############################################
echo "📦 Installing backend dependencies..."
pip install --upgrade pip
pip install -r requirements/prod.txt

############################################
# 2. Wait for database
############################################
echo "⏳ Waiting for database to be available..."

MAX_RETRIES=20
SLEEP=3
n=0

until python - << 'EOF'
import os, sys
from urllib.parse import urlparse

try:
    import psycopg2
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("❌ DATABASE_URL not set")
        sys.exit(1)

    p = urlparse(url)
    conn = psycopg2.connect(
        dbname=p.path.lstrip("/"),
        user=p.username,
        password=p.password,
        host=p.hostname,
        port=p.port or 5432,
        connect_timeout=5,
    )
    conn.close()
    print("✅ Database connection successful")
    sys.exit(0)

except psycopg2.OperationalError as e:
    print(f"❌ Database not ready: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected DB error: {e}")
    sys.exit(1)
EOF
do
  n=$((n+1))
  if [ "$n" -ge "$MAX_RETRIES" ]; then
    echo "❌ Database did not become available after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "🔁 Retrying in $SLEEP seconds... ($n/$MAX_RETRIES)"
  sleep "$SLEEP"
done

echo "✅ Database is ready!"

############################################
# 3. Run migrations
############################################
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

############################################
# 4. Build frontend (optional but preferred)
############################################
echo "🏗️ Building frontend..."

FRONTEND_DIR="../frontend"
FRONTEND_BUILD_DIR="dist"
DJANGO_FRONTEND_TARGET="super_legit_advance/templates/frontend"

if [ -d "$FRONTEND_DIR" ]; then
    if command -v npm >/dev/null 2>&1; then
        cd "$FRONTEND_DIR"
        npm install
        npm run build
        cd ../backend

        mkdir -p "$DJANGO_FRONTEND_TARGET"
        cp -r "$FRONTEND_DIR/$FRONTEND_BUILD_DIR/"* "$DJANGO_FRONTEND_TARGET/" 2>/dev/null || true

        echo "✅ Frontend built and copied to Django templates"
    else
        echo "⚠️ npm not found — skipping frontend build"
    fi
else
    echo "⚠️ Frontend directory not found — skipping frontend build"
fi

############################################
# 5. Collect static files
############################################
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear

############################################
# 6. Create or update superuser
############################################
echo "👑 Setting up superuser..."

python manage.py shell << 'EOF'
import os, sys, secrets
from django.db import transaction
from django.db.utils import OperationalError
from apps.users.models import User

try:
    with transaction.atomic():
        email = os.getenv("ADMIN_EMAIL", "admin@superlegitadvance.com")
        phone = os.getenv("ADMIN_PHONE", "+254700000000")
        password = os.getenv("ADMIN_PASSWORD") or secrets.token_urlsafe(16)

        user = User.objects.filter(email=email, is_superuser=True).first()

        if user:
            print(f"✅ Superuser already exists: {email}")
            user.set_password(password)
            user.save()
            print("🔑 Password updated")
        else:
            user = User.objects.create_superuser(
                email=email,
                phone_number=phone,
                password=password,
                first_name="Super",
                last_name="Admin",
                role="admin",
                is_verified=True,
                email_verified=True,
                phone_verified=True,
                kyc_completed=True,
                terms_accepted=True,
                privacy_policy_accepted=True,
            )
            print(f"✅ Created superuser: {email}")

        print(f"📱 Phone: {phone}")
        print(f"🔐 Password: {password}")
        print("⚠️  SAVE THESE CREDENTIALS SECURELY")

except OperationalError as e:
    print(f"❌ Database error during superuser creation: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error during superuser creation: {e}")
    sys.exit(1)
EOF

############################################
# 7. Setup default data
############################################
echo "🌱 Setting up default data..."
python manage.py setup_default_data || echo "⚠️ setup_default_data failed or not defined"

############################################
# 8. Verify setup
############################################
echo "🔍 Verifying setup..."

python manage.py shell << 'EOF'
from apps.users.models import User
from django.db.models import Q

total = User.objects.count()
admins = User.objects.filter(Q(is_superuser=True) | Q(role="admin")).count()

print(f"👥 Total users: {total}")
print(f"👑 Admin/Superusers: {admins}")

if admins == 0:
    print("❌ No admin users found!")
    raise SystemExit(1)

print("✅ Setup verified")
EOF

############################################
# Done
############################################
echo "🎉 Build completed successfully!"
