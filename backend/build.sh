#!/usr/bin/env bash
set -euo pipefail

# Super Legit Advance - Render Build Script
# Prepares backend services for deployment

echo "Building Super Legit Advance..."

############################################
# 1. Install backend dependencies
############################################
echo "Installing backend dependencies..."
pip install --upgrade pip
pip install -r requirements/prod.txt

############################################
# 2. Wait for database
############################################
echo "Waiting for database to be available..."

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
        print("DATABASE_URL not set")
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
    print("Database connection successful")
    sys.exit(0)

except psycopg2.OperationalError as e:
    print(f"Database not ready: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Unexpected DB error: {e}")
    sys.exit(1)
EOF
do
  n=$((n+1))
  if [ "$n" -ge "$MAX_RETRIES" ]; then
    echo "Database did not become available after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "Retrying in $SLEEP seconds... ($n/$MAX_RETRIES)"
  sleep "$SLEEP"
done

echo "Database is ready"

############################################
# 3. Run migrations
############################################
echo "Running database migrations..."
python manage.py migrate --noinput

############################################
# 4. Collect static files
############################################
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

############################################
# 5. Create or update superuser (idempotent)
############################################
echo "Setting up superuser..."

python manage.py shell << 'EOF'
import os, sys, secrets
from django.db import transaction
from django.db.utils import OperationalError
from apps.users.models import User

try:
    with transaction.atomic():
        email = os.getenv("ADMIN_EMAIL", "admin@superlegitadvance.com")
        phone = os.getenv("ADMIN_PHONE", "+254700000000")
        password = os.getenv("ADMIN_PASSWORD")
        rotate_password = os.getenv("ADMIN_ROTATE_PASSWORD_ON_DEPLOY", "false").lower() == "true"

        user = User.objects.filter(email=email, is_superuser=True).first()

        if user:
            print(f"Superuser already exists: {email}")
            changed = False

            if phone and user.phone_number != phone:
                user.phone_number = phone
                changed = True
                print(f"Phone updated: {phone}")

            if password and rotate_password:
                user.set_password(password)
                changed = True
                print("Password rotated from ADMIN_PASSWORD")
            elif password and not rotate_password:
                print("ADMIN_PASSWORD is set but rotation is disabled (ADMIN_ROTATE_PASSWORD_ON_DEPLOY=false)")
            else:
                print("Existing admin password kept unchanged")

            if changed:
                user.save()
        else:
            if not password:
                password = secrets.token_urlsafe(16)

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
            print(f"Created superuser: {email}")
            print(f"Phone: {phone}")
            print(f"Password: {password}")
            print("Save these credentials securely")

except OperationalError as e:
    print(f"Database error during superuser creation: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Unexpected error during superuser creation: {e}")
    sys.exit(1)
EOF

############################################
# 6. Setup default data
############################################
echo "Setting up default data..."
python manage.py setup_default_data || echo "setup_default_data failed or not defined"

############################################
# 7. Seed sample data (optional)
############################################
SEED_DATA_ON_BUILD="${SEED_DATA_ON_BUILD:-true}"
SEED_DATA_CUSTOMERS="${SEED_DATA_CUSTOMERS:-10}"
SEED_DATA_RANDOM_SEED="${SEED_DATA_RANDOM_SEED:-42}"
SEED_DATA_RESET="${SEED_DATA_RESET:-false}"

if [ "$SEED_DATA_ON_BUILD" = "true" ]; then
  echo "Seeding sample data..."
  if [ "$SEED_DATA_RESET" = "true" ]; then
    python manage.py seed_data --customers "$SEED_DATA_CUSTOMERS" --seed "$SEED_DATA_RANDOM_SEED" --reset || echo "seed_data failed"
  else
    python manage.py seed_data --customers "$SEED_DATA_CUSTOMERS" --seed "$SEED_DATA_RANDOM_SEED" || echo "seed_data failed"
  fi
else
  echo "Skipping seed_data (SEED_DATA_ON_BUILD=$SEED_DATA_ON_BUILD)"
fi

############################################
# 8. Verify setup
############################################
echo "Verifying setup..."

python manage.py shell << 'EOF'
from apps.users.models import User
from django.db.models import Q

total = User.objects.count()
admins = User.objects.filter(Q(is_superuser=True) | Q(role="admin")).count()

print(f"Total users: {total}")
print(f"Admin/Superusers: {admins}")

if admins == 0:
    print("No admin users found")
    raise SystemExit(1)

print("Setup verified")
EOF

############################################
# Done
############################################
echo "Build completed successfully"
