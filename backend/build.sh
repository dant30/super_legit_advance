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
        print('❌ DATABASE_URL environment variable not set')
        sys.exit(1)
    p = urlparse(url)
    conn = psycopg2.connect(
        dbname=p.path.lstrip('/'),
        user=p.username,
        password=p.password,
        host=p.hostname,
        port=p.port or 5432,
        connect_timeout=5
    )
    conn.close()
    print('✅ Database connection successful')
    sys.exit(0)
except psycopg2.OperationalError as e:
    print(f'❌ Database not ready: {e}')
    sys.exit(1)
except Exception as e:
    print(f'❌ Database connection error: {e}')
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

echo "✅ Database is ready!"

# 3. Run migrations
echo "🗄️  Running database migrations..."
python manage.py migrate --noinput

# 4. Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear

# 5. Create superuser
echo "👑 Setting up superuser..."
python manage.py shell << EOF
import os
import sys
from django.db import transaction
from django.db.utils import OperationalError
from apps.users.models import User

try:
    with transaction.atomic():
        email = os.getenv('ADMIN_EMAIL', 'admin@superlegitadvance.com')
        phone = os.getenv('ADMIN_PHONE', '+254700000000')
        password = os.getenv('ADMIN_PASSWORD')
        
        if not email:
            print('⚠️  ADMIN_EMAIL not set, using default')
            email = 'admin@superlegitadvance.com'
        
        if not phone:
            print('⚠️  ADMIN_PHONE not set, using default')
            phone = '+254700000000'
        
        # Generate password if not set
        if not password:
            import secrets
            password = secrets.token_urlsafe(16)
            print(f'🔐 Generated password: {password}')
        
        # Check if superuser already exists
        if User.objects.filter(email=email, is_superuser=True).exists():
            print(f'✅ Superuser {email} already exists')
            
            # Update password if needed
            if password and not User.objects.filter(email=email).first().check_password(password):
                user = User.objects.get(email=email)
                user.set_password(password)
                user.save()
                print(f'🔑 Updated password for existing superuser')
        else:
            # Create new superuser
            try:
                user = User.objects.create_superuser(
                    email=email,
                    phone_number=phone,
                    password=password,
                    first_name='Super',
                    last_name='Admin',
                    role='admin',
                    is_verified=True,
                    email_verified=True,
                    phone_verified=True,
                    kyc_completed=True,
                    terms_accepted=True,
                    privacy_policy_accepted=True
                )
                print(f'✅ Created superuser: {email}')
                print(f'📱 Phone: {phone}')
                print(f'🔑 Password: {password}')
                print('⚠️  Please save these credentials securely!')
                
            except Exception as e:
                print(f'❌ Failed to create superuser: {e}')
                # Try alternative method
                try:
                    user = User.objects.create_user(
                        email=email,
                        phone_number=phone,
                        password=password,
                        first_name='Super',
                        last_name='Admin',
                        role='admin',
                        is_staff=True,
                        is_superuser=True,
                        is_verified=True,
                        email_verified=True,
                        phone_verified=True,
                        kyc_completed=True,
                        terms_accepted=True,
                        privacy_policy_accepted=True,
                        is_active=True
                    )
                    print(f'✅ Created superuser (alternative method): {email}')
                except Exception as e2:
                    print(f'❌ Alternative method also failed: {e2}')
        
except OperationalError as e:
    print(f'❌ Database error during superuser creation: {e}')
    sys.exit(1)
except Exception as e:
    print(f'❌ Unexpected error during superuser creation: {e}')
    sys.exit(1)
EOF

# 6. Setup other default data
echo "🌱 Setting up other default data..."
python manage.py setup_default_data

# 7. Verify setup
echo "🔍 Verifying setup..."
python manage.py shell << EOF
from apps.users.models import User
from django.db.models import Q

superusers = User.objects.filter(Q(is_superuser=True) | Q(role='admin')).count()
all_users = User.objects.count()

print(f'Total users: {all_users}')
print(f'Superusers/Admins: {superusers}')

if superusers == 0:
    print('⚠️  WARNING: No superusers found!')
    sys.exit(1)
else:
    print('✅ Superuser setup verified')
EOF

echo "✅ Build completed successfully!"