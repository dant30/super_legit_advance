# backend/super_legit_advance/settings/production.py
"""
Production settings - Secure, optimized for production deployment.
"""

from .base import *
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
import dj_database_url

# ============================================================================
# PRODUCTION OVERRIDES
# ============================================================================

DEBUG = False
SECRET_KEY = env('SECRET_KEY')  # MUST be set in environment

# Hosts - Strictly configured for production
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost'])
if not ALLOWED_HOSTS or ALLOWED_HOSTS == ['localhost']:
    raise ValueError(
        "ALLOWED_HOSTS must be set for production. "
        "Set ALLOWED_HOSTS=host1.com,host2.com in .env"
    )

# ============================================================================
# SECURITY - Production Hardening
# ============================================================================
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# ============================================================================
# CORS - Production Configuration
# ============================================================================
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])

if not CORS_ALLOWED_ORIGINS:
    raise ValueError(
        "CORS_ALLOWED_ORIGINS must be set for production. "
        "Set CORS_ALLOWED_ORIGINS=https://frontend.com in .env"
    )

# ============================================================================
# DATABASE - Production (PostgreSQL)
# ============================================================================
DATABASES = {
    'default': dj_database_url.config(
        default=env('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# ============================================================================
# CACHE & CELERY
# ============================================================================
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": env('REDIS_URL', default='redis://localhost:6379/0'),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "CONNECTION_POOL_KWARGS": {"max_connections": 50}
        }
    }
}

CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_TASK_ACKS_LATE = True
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_TASK_REJECT_ON_WORKER_LOST = True
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_TASK_SOFT_TIME_LIMIT = 25 * 60

# ============================================================================
# EMAIL - Production
# ============================================================================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = env('EMAIL_HOST')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL')

# ============================================================================
# EXTERNAL SERVICES - Production
# ============================================================================
MPESA_ENVIRONMENT = 'production'
MPESA_CONSUMER_KEY = env('MPESA_CONSUMER_KEY')
MPESA_CONSUMER_SECRET = env('MPESA_CONSUMER_SECRET')
MPESA_SHORTCODE = env('MPESA_SHORTCODE')
MPESA_PASSKEY = env('MPESA_PASSKEY')
MPESA_CALLBACK_URL = env('MPESA_CALLBACK_URL')
MPESA_INITIATOR_PASSWORD = env('MPESA_INITIATOR_PASSWORD')

AFRICASTALKING_USERNAME = env('AFRICASTALKING_USERNAME')
AFRICASTALKING_API_KEY = env('AFRICASTALKING_API_KEY')

# ============================================================================
# STATIC FILES
# ============================================================================
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ============================================================================
# REST FRAMEWORK & JWT
# ============================================================================
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = (
    'rest_framework.renderers.JSONRenderer',
)

SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(minutes=15)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=1)

# ============================================================================
# PERFORMANCE
# ============================================================================
MIDDLEWARE.insert(1, 'django.middleware.gzip.GZipMiddleware')
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'
SESSION_CACHE_ALIAS = 'default'

# ============================================================================
# LOGGING - Production
# ============================================================================
LOGGING['handlers']['file']['level'] = 'WARNING'
LOGGING['loggers']['django']['level'] = 'WARNING'
LOGGING['loggers']['django.security'] = {
    'handlers': ['console', 'file'],
    'level': 'WARNING',
    'propagate': False,
}

LOGGING['loggers']['apps'] = {
    'handlers': ['console'],
    'level': 'INFO',
    'propagate': False,
}

# ============================================================================
# ERROR TRACKING (Sentry)
# ============================================================================
SENTRY_DSN = env('SENTRY_DSN', default=None)

if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=True,
        environment="production",
    )

# ============================================================================
# STARTUP VALIDATION
# ============================================================================
if __name__ == '__main__' or True:
    print("=" * 60)
    print("✓ Production settings loaded")
    print(f"  DEBUG: {DEBUG}")
    print(f"  ALLOWED_HOSTS: {ALLOWED_HOSTS}")
    print(f"  CORS_ALLOWED_ORIGINS: {CORS_ALLOWED_ORIGINS}")
    print(f"  DATABASE: {DATABASES['default']['ENGINE']}")
    print("=" * 60)